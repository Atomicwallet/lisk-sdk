"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = exports.EVENT_PROCESSOR_BROADCAST_BLOCK = exports.EVENT_PROCESSOR_SYNC_REQUIRED = void 0;
const lisk_bft_1 = require("@liskhq/lisk-bft");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const events_1 = require("events");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const constants_1 = require("../../constants");
const errors_1 = require("../../errors");
const forkStatusList = [
    lisk_bft_1.ForkStatus.IDENTICAL_BLOCK,
    lisk_bft_1.ForkStatus.VALID_BLOCK,
    lisk_bft_1.ForkStatus.DOUBLE_FORGING,
    lisk_bft_1.ForkStatus.TIE_BREAK,
    lisk_bft_1.ForkStatus.DIFFERENT_CHAIN,
    lisk_bft_1.ForkStatus.DISCARD,
];
exports.EVENT_PROCESSOR_SYNC_REQUIRED = 'EVENT_PROCESSOR_SYNC_REQUIRED';
exports.EVENT_PROCESSOR_BROADCAST_BLOCK = 'EVENT_PROCESSOR_BROADCAST_BLOCK';
const BLOCK_VERSION = 2;
class Processor {
    constructor({ channel, logger, chainModule, bftModule }) {
        this._modules = [];
        this._stop = false;
        this._channel = channel;
        this._logger = logger;
        this._chain = chainModule;
        this._bft = bftModule;
        this._mutex = new lisk_utils_1.jobHandlers.Mutex();
        this.events = new events_1.EventEmitter();
    }
    register(customModule) {
        const existingModule = this._modules.find(m => m.id === customModule.id);
        if (existingModule) {
            throw new Error(`Module id ${customModule.id} is already registered`);
        }
        this._modules.push(customModule);
    }
    async init(genesisBlock) {
        this._logger.debug({
            id: genesisBlock.header.id,
            transactionRoot: genesisBlock.header.transactionRoot,
        }, 'Initializing processor');
        const genesisExist = await this._chain.genesisBlockExist(genesisBlock);
        const stateStore = await this._chain.newStateStore();
        if (!genesisExist) {
            this._chain.validateGenesisBlockHeader(genesisBlock);
            await this._chain.applyGenesisBlock(genesisBlock, stateStore);
            for (const customModule of this._modules) {
                if (customModule.afterGenesisBlockApply) {
                    await customModule.afterGenesisBlockApply({
                        genesisBlock,
                        stateStore: this._createScopedStateStore(stateStore, customModule.name),
                        reducerHandler: this._createReducerHandler(stateStore),
                    });
                }
            }
            await this._chain.saveBlock(genesisBlock, stateStore, 0);
        }
        await this._chain.init();
        await this._bft.init(stateStore);
        this._logger.info('Blockchain ready');
    }
    async stop() {
        this._stop = true;
        await this._mutex.acquire();
    }
    async process(block, { peerId } = {}) {
        if (this._stop) {
            return;
        }
        await this._mutex.runExclusive(async () => {
            this._logger.debug({ id: block.header.id, height: block.header.height }, 'Starting to process block');
            const { lastBlock } = this._chain;
            const forkStatus = this._bft.forkChoice(block.header, lastBlock.header);
            if (!forkStatusList.includes(forkStatus)) {
                this._logger.debug({ status: forkStatus, blockId: block.header.id }, 'Unknown fork status');
                throw new Error('Unknown fork status');
            }
            if (forkStatus === lisk_bft_1.ForkStatus.DISCARD) {
                this._logger.debug({ id: block.header.id, height: block.header.height }, 'Discarding block');
                const encodedBlock = this._chain.dataAccess.encode(block);
                this._channel.publish(constants_1.APP_EVENT_CHAIN_FORK, {
                    block: encodedBlock.toString('hex'),
                });
                return;
            }
            if (forkStatus === lisk_bft_1.ForkStatus.IDENTICAL_BLOCK) {
                this._logger.debug({ id: block.header.id, height: block.header.height }, 'Block already processed');
                return;
            }
            if (forkStatus === lisk_bft_1.ForkStatus.DOUBLE_FORGING) {
                this._logger.warn({
                    id: block.header.id,
                    generatorPublicKey: block.header.generatorPublicKey,
                }, 'Discarding block due to double forging');
                const encodedBlock = this._chain.dataAccess.encode(block);
                this._channel.publish(constants_1.APP_EVENT_CHAIN_FORK, {
                    block: encodedBlock.toString('hex'),
                });
                return;
            }
            if (forkStatus === lisk_bft_1.ForkStatus.DIFFERENT_CHAIN) {
                this._logger.debug({ id: block.header.id, height: block.header.height }, 'Detected different chain to sync');
                const encodedBlock = this._chain.dataAccess.encode(block);
                this.events.emit(exports.EVENT_PROCESSOR_SYNC_REQUIRED, {
                    block,
                    peerId,
                });
                this._channel.publish(constants_1.APP_EVENT_CHAIN_FORK, {
                    block: encodedBlock.toString('hex'),
                });
                return;
            }
            if (forkStatus === lisk_bft_1.ForkStatus.TIE_BREAK) {
                this._logger.info({ id: lastBlock.header.id, height: lastBlock.header.height }, 'Received tie breaking block');
                const encodedBlock = this._chain.dataAccess.encode(block);
                this._channel.publish(constants_1.APP_EVENT_CHAIN_FORK, {
                    block: encodedBlock.toString('hex'),
                });
                this._validate(block);
                const previousLastBlock = lisk_utils_1.objects.cloneDeep(lastBlock);
                await this._deleteBlock(lastBlock);
                try {
                    await this._processValidated(block);
                }
                catch (err) {
                    this._logger.error({
                        id: block.header.id,
                        previousBlockId: previousLastBlock.header.id,
                        err: err,
                    }, 'Failed to apply newly received block. restoring previous block.');
                    await this._processValidated(previousLastBlock, {
                        skipBroadcast: true,
                    });
                }
                return;
            }
            this._logger.debug({ id: block.header.id, height: block.header.height }, 'Processing valid block');
            this._validate(block);
            await this._processValidated(block);
        });
    }
    validate(block) {
        this._logger.debug({ id: block.header.id, height: block.header.height }, 'Validating block');
        this._validate(block);
    }
    async processValidated(block, { removeFromTempTable = false } = {}) {
        if (this._stop) {
            return;
        }
        await this._mutex.runExclusive(async () => {
            this._logger.debug({ id: block.header.id, height: block.header.height }, 'Processing validated block');
            return this._processValidated(block, {
                skipBroadcast: true,
                removeFromTempTable,
            });
        });
    }
    async deleteLastBlock({ saveTempBlock = false, } = {}) {
        if (this._stop) {
            return;
        }
        await this._mutex.runExclusive(async () => {
            const { lastBlock } = this._chain;
            this._logger.debug({ id: lastBlock.header.id, height: lastBlock.header.height }, 'Deleting last block');
            await this._deleteBlock(lastBlock, saveTempBlock);
            return this._chain.lastBlock;
        });
    }
    validateTransaction(transaction) {
        this._chain.validateTransaction(transaction);
        const customAsset = this._getAsset(transaction);
        if (customAsset.validate) {
            const decodedAsset = lisk_codec_1.codec.decode(customAsset.schema, transaction.asset);
            const assetSchemaErrors = lisk_validator_1.validator.validate(customAsset.schema, decodedAsset);
            if (assetSchemaErrors.length) {
                throw new lisk_validator_1.LiskValidationError(assetSchemaErrors);
            }
            customAsset.validate({
                asset: decodedAsset,
                transaction,
            });
        }
    }
    async verifyTransactions(transactions, stateStore) {
        var _a;
        if (!transactions.length) {
            return;
        }
        for (const transaction of transactions) {
            try {
                for (const customModule of this._modules) {
                    if (customModule.beforeTransactionApply) {
                        await customModule.beforeTransactionApply({
                            reducerHandler: this._createReducerHandler(stateStore),
                            stateStore: this._createScopedStateStore(stateStore, customModule.name),
                            transaction,
                        });
                    }
                }
                const moduleName = this._getModule(transaction).name;
                const customAsset = this._getAsset(transaction);
                const decodedAsset = lisk_codec_1.codec.decode(customAsset.schema, transaction.asset);
                await customAsset.apply({
                    asset: decodedAsset,
                    reducerHandler: this._createReducerHandler(stateStore),
                    stateStore: this._createScopedStateStore(stateStore, moduleName),
                    transaction,
                });
                for (const customModule of this._modules) {
                    if (customModule.afterTransactionApply) {
                        await customModule.afterTransactionApply({
                            reducerHandler: this._createReducerHandler(stateStore),
                            stateStore: this._createScopedStateStore(stateStore, customModule.name),
                            transaction,
                        });
                    }
                }
            }
            catch (err) {
                throw new errors_1.TransactionApplyError((_a = err.message) !== null && _a !== void 0 ? _a : 'Transaction verification failed', transaction.id, err);
            }
        }
    }
    async _processValidated(block, { skipBroadcast, removeFromTempTable = false, } = {}) {
        const stateStore = await this._chain.newStateStore();
        const reducerHandler = this._createReducerHandler(stateStore);
        await this._chain.verifyBlockHeader(block, stateStore);
        await this._bft.verifyBlockHeader(block.header, stateStore);
        if (!skipBroadcast) {
            this.events.emit(exports.EVENT_PROCESSOR_BROADCAST_BLOCK, {
                block,
            });
        }
        for (const customModule of this._modules) {
            if (customModule.beforeBlockApply) {
                await customModule.beforeBlockApply({
                    block,
                    stateStore: this._createScopedStateStore(stateStore, customModule.name),
                    reducerHandler,
                });
            }
        }
        await this._bft.applyBlockHeader(block.header, stateStore);
        if (block.payload.length) {
            for (const transaction of block.payload) {
                for (const customModule of this._modules) {
                    if (customModule.beforeTransactionApply) {
                        await customModule.beforeTransactionApply({
                            reducerHandler: this._createReducerHandler(stateStore),
                            stateStore: this._createScopedStateStore(stateStore, customModule.name),
                            transaction,
                        });
                    }
                }
                const moduleName = this._getModule(transaction).name;
                const customAsset = this._getAsset(transaction);
                const decodedAsset = lisk_codec_1.codec.decode(customAsset.schema, transaction.asset);
                await customAsset.apply({
                    asset: decodedAsset,
                    reducerHandler,
                    stateStore: this._createScopedStateStore(stateStore, moduleName),
                    transaction,
                });
                for (const customModule of this._modules) {
                    if (customModule.afterTransactionApply) {
                        await customModule.afterTransactionApply({
                            reducerHandler: this._createReducerHandler(stateStore),
                            stateStore: this._createScopedStateStore(stateStore, customModule.name),
                            transaction,
                        });
                    }
                }
            }
        }
        for (const customModule of this._modules) {
            if (customModule.afterBlockApply) {
                await customModule.afterBlockApply({
                    block,
                    reducerHandler,
                    stateStore: this._createScopedStateStore(stateStore, customModule.name),
                    consensus: this._createConsensus(stateStore, block.header),
                });
            }
        }
        await this._chain.saveBlock(block, stateStore, this._bft.finalizedHeight, {
            removeFromTempTable,
        });
        return block;
    }
    _validate(block) {
        var _a;
        if (block.header.version !== BLOCK_VERSION) {
            throw new errors_1.ApplyPenaltyError(`Block version must be ${BLOCK_VERSION}`);
        }
        try {
            this._chain.validateBlockHeader(block);
            if (block.payload.length) {
                for (const transaction of block.payload) {
                    this.validateTransaction(transaction);
                }
            }
        }
        catch (error) {
            throw new errors_1.ApplyPenaltyError((_a = error.message) !== null && _a !== void 0 ? _a : 'Invalid block to be processed');
        }
    }
    async _deleteBlock(block, saveTempBlock = false) {
        if (block.header.height <= this._bft.finalizedHeight) {
            throw new Error('Can not delete block below or same as finalized height');
        }
        const stateStore = await this._chain.newStateStore(1);
        await this._chain.removeBlock(block, stateStore, { saveTempBlock });
    }
    _createConsensus(stateStore, blockHeader) {
        return {
            getFinalizedHeight: () => this._bft.finalizedHeight,
            updateDelegates: async (delegates) => {
                await this._chain.setValidators(delegates, stateStore, blockHeader);
            },
            getDelegates: async () => lisk_chain_1.getValidators(stateStore),
        };
    }
    _createScopedStateStore(stateStore, moduleName) {
        return {
            account: {
                get: async (key) => {
                    const account = await stateStore.account.get(key);
                    return {
                        address: account.address,
                        [moduleName]: account[moduleName],
                    };
                },
                getOrDefault: async (key) => {
                    const account = await stateStore.account.getOrDefault(key);
                    return {
                        address: account.address,
                        [moduleName]: account[moduleName],
                    };
                },
                set: async (key, value) => {
                    const account = await stateStore.account.getOrDefault(key);
                    account[moduleName] = value[moduleName];
                    await stateStore.account.set(key, account);
                },
                del: async (key) => stateStore.account.del(key),
            },
            chain: {
                get: async (key) => stateStore.chain.get(key),
                lastBlockHeaders: stateStore.chain.lastBlockHeaders,
                lastBlockReward: stateStore.chain.lastBlockReward,
                networkIdentifier: stateStore.chain.networkIdentifier,
                set: async (key, value) => {
                    await stateStore.chain.set(key, value);
                },
            },
        };
    }
    _createReducerHandler(stateStore) {
        return {
            invoke: async (name, params) => {
                const requestNames = name.split(':');
                if (requestNames.length !== 2) {
                    throw new Error('Invalid format to call reducer');
                }
                const [moduleName, funcName] = requestNames;
                const customModule = this._getModuleByName(moduleName);
                const fn = customModule.reducers[funcName];
                if (!fn) {
                    throw new Error(`${funcName} does not exist in module ${moduleName}`);
                }
                return fn(params !== null && params !== void 0 ? params : {}, this._createScopedStateStore(stateStore, moduleName));
            },
        };
    }
    _getModuleByName(name) {
        const customModule = this._modules.find(m => m.name === name);
        if (!customModule) {
            throw new Error(`Module ${name} does not exist`);
        }
        return customModule;
    }
    _getModule(transaction) {
        const customModule = this._modules.find(m => m.id === transaction.moduleID);
        if (!customModule) {
            throw new Error(`Module id ${transaction.moduleID} does not exist`);
        }
        return customModule;
    }
    _getAsset(transaction) {
        const customModule = this._getModule(transaction);
        const customAsset = customModule.transactionAssets.find(asset => asset.id === transaction.assetID);
        if (!customAsset) {
            throw new Error(`Asset id ${transaction.assetID} does not exist in module id ${transaction.moduleID}.`);
        }
        return customAsset;
    }
}
exports.Processor = Processor;
//# sourceMappingURL=processor.js.map