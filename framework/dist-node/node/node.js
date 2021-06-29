"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_bft_1 = require("@liskhq/lisk-bft");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_transaction_pool_1 = require("@liskhq/lisk-transaction-pool");
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("../constants");
const forger_1 = require("./forger");
const transport_1 = require("./transport");
const synchronizer_1 = require("./synchronizer");
const processor_1 = require("./processor");
const channels_1 = require("../controller/channels");
const processor_2 = require("./processor/processor");
const base_synchronizer_1 = require("./synchronizer/base_synchronizer");
const network_1 = require("./network");
const modules_1 = require("../modules");
const forgeInterval = 1000;
const { EVENT_NEW_BLOCK, EVENT_DELETE_BLOCK, EVENT_VALIDATORS_CHANGED } = lisk_chain_1.events;
const { EVENT_TRANSACTION_REMOVED } = lisk_transaction_pool_1.events;
const MINIMUM_MODULE_ID = 2;
class Node {
    constructor({ options, genesisBlockJSON }) {
        this._registeredModules = [];
        this._registeredAccountSchemas = {};
        this._options = options;
        this._genesisBlockJSON = genesisBlockJSON;
        if (this._options.forging.waitThreshold >= this._options.genesisConfig.blockTime) {
            throw Error(`forging.waitThreshold=${this._options.forging.waitThreshold} is greater or equal to genesisConfig.blockTime=${this._options.genesisConfig.blockTime}. It impacts the forging and propagation of blocks. Please use a smaller value for forging.waitThreshold`);
        }
    }
    getSchema() {
        const transactionsAssets = [];
        for (const customModule of this._registeredModules) {
            for (const customAsset of customModule.transactionAssets) {
                transactionsAssets.push({
                    moduleID: customModule.id,
                    moduleName: customModule.name,
                    assetID: customAsset.id,
                    assetName: customAsset.name,
                    schema: customAsset.schema,
                });
            }
        }
        const { default: defaultAccount, ...accountSchema } = lisk_chain_1.getAccountSchemaWithDefault(this._registeredAccountSchemas);
        const blockHeadersAssets = lisk_chain_1.getRegisteredBlockAssetSchema(accountSchema);
        return {
            account: accountSchema,
            block: lisk_chain_1.blockSchema,
            blockHeader: lisk_chain_1.blockHeaderSchema,
            blockHeadersAssets,
            transaction: lisk_chain_1.transactionSchema,
            transactionsAssets,
        };
    }
    getDefaultAccount() {
        const { default: defaultAccount } = lisk_chain_1.getAccountSchemaWithDefault(this._registeredAccountSchemas);
        return defaultAccount;
    }
    getRegisteredModules() {
        return this._registeredModules.reduce((prev, current) => {
            const assets = current.transactionAssets.map(asset => ({ id: asset.id, name: asset.name }));
            prev.push({
                id: current.id,
                name: current.name,
                actions: Object.keys(current.actions).map(key => `${current.name}:${key}`),
                events: current.events.map(key => `${current.name}:${key}`),
                reducers: Object.keys(current.reducers).map(key => `${current.name}:${key}`),
                transactionAssets: assets,
            });
            return prev;
        }, []);
    }
    registerModule(customModule) {
        const exist = this._registeredModules.find(rm => rm.id === customModule.id);
        if (exist) {
            throw new Error(`Custom module with id ${customModule.id} already exists.`);
        }
        if (!customModule.name || !customModule.id) {
            throw new Error(`Custom module '${customModule.constructor.name}' is missing either one or both of the required properties: 'id', 'name'.`);
        }
        if (customModule.id < MINIMUM_MODULE_ID) {
            throw new Error(`Custom module must have id greater than ${MINIMUM_MODULE_ID}.`);
        }
        if (customModule.accountSchema) {
            this._registeredAccountSchemas[customModule.name] = {
                ...customModule.accountSchema,
                fieldNumber: customModule.id,
            };
        }
        for (const asset of customModule.transactionAssets) {
            if (!(asset instanceof modules_1.BaseAsset)) {
                throw new Error('Custom module contains asset which does not extend `BaseAsset` class.');
            }
            if (typeof asset.name !== 'string' || asset.name === '') {
                throw new Error('Custom module contains asset with invalid `name` property.');
            }
            if (typeof asset.id !== 'number') {
                throw new Error('Custom module contains asset with invalid `id` property.');
            }
            if (typeof asset.schema !== 'object') {
                throw new Error('Custom module contains asset with invalid `schema` property.');
            }
            if (typeof asset.apply !== 'function') {
                throw new Error('Custom module contains asset with invalid `apply` property.');
            }
        }
        this._registeredModules.push(customModule);
    }
    async init({ bus, channel, blockchainDB, forgerDB, logger, nodeDB, }) {
        var _a;
        this._channel = channel;
        this._logger = logger;
        this._blockchainDB = blockchainDB;
        this._forgerDB = forgerDB;
        this._nodeDB = nodeDB;
        this._bus = bus;
        this._genesisBlock = lisk_chain_1.readGenesisBlockJSON(this._genesisBlockJSON, this._registeredAccountSchemas);
        this._networkIdentifier = lisk_cryptography_1.getNetworkIdentifier(this._genesisBlock.header.id, this._options.genesisConfig.communityIdentifier);
        this._initModules();
        for (const customModule of this._registeredModules) {
            this._processor.register(customModule);
            const customModuleChannel = new channels_1.InMemoryChannel(customModule.name, customModule.events, customModule.actions);
            await customModuleChannel.registerToBus(this._bus);
            customModule.init({
                channel: {
                    publish: (name, data) => customModuleChannel.publish(name, data),
                },
                dataAccess: {
                    getChainState: async (key) => this._chain.dataAccess.getChainState(key),
                    getAccountByAddress: async (address) => this._chain.dataAccess.getAccountByAddress(address),
                    getLastBlockHeader: async () => this._chain.dataAccess.getLastBlockHeader(),
                },
                logger: this._logger,
            });
        }
        this._networkModule.registerEndpoint('getTransactions', async ({ data, peerId }) => this._transport.handleRPCGetTransactions(data, peerId));
        this._networkModule.registerEndpoint('getLastBlock', ({ peerId }) => this._transport.handleRPCGetLastBlock(peerId));
        this._networkModule.registerEndpoint('getBlocksFromId', async ({ data, peerId }) => this._transport.handleRPCGetBlocksFromId(data, peerId));
        this._networkModule.registerEndpoint('getHighestCommonBlock', async ({ data, peerId }) => this._transport.handleRPCGetHighestCommonBlock(data, peerId));
        await this._networkModule.bootstrap(this.networkIdentifier);
        this._subscribeToEvents();
        await this._processor.init(this._genesisBlock);
        await this._synchronizer.init();
        this._networkModule.applyNodeInfo({
            height: this._chain.lastBlock.header.height,
            lastBlockID: this._chain.lastBlock.header.id,
            maxHeightPrevoted: (_a = this._chain.lastBlock.header.asset.maxHeightPrevoted) !== null && _a !== void 0 ? _a : 0,
            blockVersion: this._chain.lastBlock.header.version,
        });
        await this._transactionPool.start();
        await this._startForging();
        this._logger.info('Node ready and launched');
        this._networkModule.events.on(constants_1.APP_EVENT_NETWORK_READY, async () => {
            await this._startLoader();
        });
        this._networkModule.events.on(constants_1.APP_EVENT_NETWORK_EVENT, async (eventData) => {
            const { event, data, peerId } = eventData;
            try {
                if (event === 'postTransactionsAnnouncement') {
                    await this._transport.handleEventPostTransactionsAnnouncement(data, peerId);
                    return;
                }
                if (event === 'postBlock') {
                    await this._transport.handleEventPostBlock(data, peerId);
                    return;
                }
            }
            catch (err) {
                this._logger.warn({ err, event }, 'Received invalid event message');
            }
        });
    }
    get networkIdentifier() {
        return this._networkIdentifier;
    }
    get actions() {
        return {
            getValidators: async () => {
                const validators = await this._chain.getValidators();
                const slot = this._chain.slots.getSlotNumber();
                const startTime = this._chain.slots.getSlotTime(slot);
                let nextForgingTime = startTime;
                const slotInRound = slot % this._chain.numberOfValidators;
                const blockTime = this._chain.slots.blockTime();
                const forgersInfo = [];
                for (let i = slotInRound; i < slotInRound + this._chain.numberOfValidators; i += 1) {
                    const validator = validators[i % validators.length];
                    forgersInfo.push({
                        ...validator,
                        address: validator.address.toString('hex'),
                        nextForgingTime,
                    });
                    nextForgingTime += blockTime;
                }
                return forgersInfo;
            },
            updateForgingStatus: async (params) => {
                const result = await this._forger.updateForgingStatus(Buffer.from(params.address, 'hex'), params.password, params.forging, params.height, params.maxHeightPreviouslyForged, params.maxHeightPrevoted, params.overwrite);
                return {
                    address: result.address.toString('hex'),
                    forging: result.forging,
                };
            },
            getAccount: async (params) => {
                const account = await this._chain.dataAccess.getAccountByAddress(Buffer.from(params.address, 'hex'));
                return this._chain.dataAccess.encodeAccount(account).toString('hex');
            },
            getAccounts: async (params) => {
                const accounts = await this._chain.dataAccess.getAccountsByAddress(params.address.map(address => Buffer.from(address, 'hex')));
                return accounts.map(account => this._chain.dataAccess.encodeAccount(account).toString('hex'));
            },
            getBlockByID: async (params) => {
                const block = await this._chain.dataAccess.getBlockByID(Buffer.from(params.id, 'hex'));
                return this._chain.dataAccess.encode(block).toString('hex');
            },
            getBlocksByIDs: async (params) => {
                const blocks = [];
                try {
                    for (const id of params.ids) {
                        const block = await this._chain.dataAccess.getBlockByID(Buffer.from(id, 'hex'));
                        blocks.push(block);
                    }
                }
                catch (error) {
                    if (!(error instanceof lisk_db_1.NotFoundError)) {
                        throw error;
                    }
                }
                return blocks.map(block => this._chain.dataAccess.encode(block).toString('hex'));
            },
            getBlockByHeight: async (params) => {
                const block = await this._chain.dataAccess.getBlockByHeight(params.height);
                return this._chain.dataAccess.encode(block).toString('hex');
            },
            getBlocksByHeightBetween: async (params) => {
                const blocks = await this._chain.dataAccess.getBlocksByHeightBetween(params.from, params.to);
                return blocks.map(b => this._chain.dataAccess.encode(b).toString('hex'));
            },
            getTransactionByID: async (params) => {
                const transaction = await this._chain.dataAccess.getTransactionByID(Buffer.from(params.id, 'hex'));
                return transaction.getBytes().toString('hex');
            },
            getTransactionsByIDs: async (params) => {
                const transactions = [];
                try {
                    for (const id of params.ids) {
                        const transaction = await this._chain.dataAccess.getTransactionByID(Buffer.from(id, 'hex'));
                        transactions.push(transaction);
                    }
                }
                catch (error) {
                    if (!(error instanceof lisk_db_1.NotFoundError)) {
                        throw error;
                    }
                }
                return transactions.map(tx => tx.getBytes().toString('hex'));
            },
            getForgingStatus: async () => {
                const forgingStatus = await this._forger.getForgingStatusOfAllDelegates();
                if (forgingStatus) {
                    return forgingStatus.map(({ address, ...forgingStatusWithoutAddress }) => ({
                        address: address.toString('hex'),
                        ...forgingStatusWithoutAddress,
                    }));
                }
                return undefined;
            },
            getTransactionsFromPool: () => this._transactionPool.getAll().map(tx => tx.getBytes().toString('hex')),
            postTransaction: async (params) => this._transport.handleEventPostTransaction(params),
            getLastBlock: () => this._chain.dataAccess.encode(this._chain.lastBlock).toString('hex'),
            getSchema: () => this.getSchema(),
            getRegisteredModules: () => this.getRegisteredModules(),
            getNodeInfo: () => ({
                version: this._options.version,
                networkVersion: this._options.networkVersion,
                networkIdentifier: this._networkIdentifier.toString('hex'),
                lastBlockID: this._chain.lastBlock.header.id.toString('hex'),
                height: this._chain.lastBlock.header.height,
                finalizedHeight: this._bft.finalityManager.finalizedHeight,
                syncing: this._synchronizer.isActive,
                unconfirmedTransactions: this._transactionPool.getAll().length,
                genesisConfig: {
                    ...this._options.genesisConfig,
                },
                registeredModules: this.getRegisteredModules(),
                network: {
                    port: this._options.network.port,
                    hostIp: this._options.network.hostIp,
                    seedPeers: this._options.network.seedPeers,
                    blacklistedIPs: this._options.network.blacklistedIPs,
                    fixedPeers: this._options.network.fixedPeers,
                    whitelistedPeers: this._options.network.whitelistedPeers,
                },
            }),
            getConnectedPeers: () => this._networkModule.getConnectedPeers(),
            getDisconnectedPeers: () => this._networkModule.getDisconnectedPeers(),
            getNetworkStats: () => this._networkModule.getNetworkStats(),
        };
    }
    async cleanup() {
        this._logger.info('Node cleanup started');
        this._transactionPool.stop();
        this._unsubscribeToEvents();
        if (this._forgingJob) {
            this._forgingJob.stop();
        }
        await this._synchronizer.stop();
        await this._processor.stop();
        this._logger.info('Node cleanup completed');
        await this._networkModule.cleanup();
    }
    _initModules() {
        this._networkModule = new network_1.Network({
            networkVersion: this._options.networkVersion,
            options: this._options.network,
            logger: this._logger,
            channel: this._channel,
            nodeDB: this._nodeDB,
        });
        this._chain = new lisk_chain_1.Chain({
            db: this._blockchainDB,
            genesisBlock: this._genesisBlock,
            networkIdentifier: this._networkIdentifier,
            maxPayloadLength: this._options.genesisConfig.maxPayloadLength,
            rewardDistance: this._options.genesisConfig.rewards.distance,
            rewardOffset: this._options.genesisConfig.rewards.offset,
            rewardMilestones: this._options.genesisConfig.rewards.milestones.map(s => BigInt(s)),
            blockTime: this._options.genesisConfig.blockTime,
            accountSchemas: this._registeredAccountSchemas,
            minFeePerByte: this._options.genesisConfig.minFeePerByte,
            baseFees: this._options.genesisConfig.baseFees,
        });
        this._bft = new lisk_bft_1.BFT({
            chain: this._chain,
            threshold: this._options.genesisConfig.bftThreshold,
            genesisHeight: this._genesisBlock.header.height,
        });
        this._processor = new processor_1.Processor({
            channel: this._channel,
            logger: this._logger,
            chainModule: this._chain,
            bftModule: this._bft,
        });
        this._transactionPool = new lisk_transaction_pool_1.TransactionPool({
            baseFees: this._options.genesisConfig.baseFees.map(fees => ({
                ...fees,
                baseFee: BigInt(fees.baseFee),
            })),
            minFeePerByte: this._options.genesisConfig.minFeePerByte,
            applyTransactions: async (transactions) => {
                const stateStore = await this._chain.newStateStore();
                return this._processor.verifyTransactions(transactions, stateStore);
            },
            ...this._options.transactionPool,
            minEntranceFeePriority: BigInt(this._options.transactionPool.minEntranceFeePriority),
            minReplacementFeeDifference: BigInt(this._options.transactionPool.minReplacementFeeDifference),
        });
        const blockSyncMechanism = new synchronizer_1.BlockSynchronizationMechanism({
            logger: this._logger,
            bft: this._bft,
            channel: this._channel,
            chain: this._chain,
            processorModule: this._processor,
            networkModule: this._networkModule,
        });
        const fastChainSwitchMechanism = new synchronizer_1.FastChainSwitchingMechanism({
            logger: this._logger,
            channel: this._channel,
            chain: this._chain,
            bft: this._bft,
            processor: this._processor,
            networkModule: this._networkModule,
        });
        this._synchronizer = new synchronizer_1.Synchronizer({
            channel: this._channel,
            logger: this._logger,
            chainModule: this._chain,
            bftModule: this._bft,
            processorModule: this._processor,
            transactionPoolModule: this._transactionPool,
            mechanisms: [blockSyncMechanism, fastChainSwitchMechanism],
            networkModule: this._networkModule,
        });
        blockSyncMechanism.events.on(base_synchronizer_1.EVENT_SYNCHRONIZER_SYNC_REQUIRED, ({ block, peerId }) => {
            this._synchronizer.run(block, peerId).catch(err => {
                this._logger.error({ err: err }, 'Error occurred during synchronization.');
            });
        });
        fastChainSwitchMechanism.events.on(base_synchronizer_1.EVENT_SYNCHRONIZER_SYNC_REQUIRED, ({ block, peerId }) => {
            this._synchronizer.run(block, peerId).catch(err => {
                this._logger.error({ err: err }, 'Error occurred during synchronization.');
            });
        });
        this._forger = new forger_1.Forger({
            logger: this._logger,
            db: this._forgerDB,
            bftModule: this._bft,
            transactionPoolModule: this._transactionPool,
            processorModule: this._processor,
            chainModule: this._chain,
            forgingDelegates: this._options.forging.delegates.map(delegate => ({
                ...delegate,
                address: Buffer.from(delegate.address, 'hex'),
                hashOnion: {
                    ...delegate.hashOnion,
                    hashes: delegate.hashOnion.hashes.map(h => Buffer.from(h, 'hex')),
                },
            })),
            forgingForce: this._options.forging.force,
            forgingDefaultPassword: this._options.forging.defaultPassword,
            forgingWaitThreshold: this._options.forging.waitThreshold,
        });
        this._transport = new transport_1.Transport({
            channel: this._channel,
            logger: this._logger,
            synchronizer: this._synchronizer,
            transactionPoolModule: this._transactionPool,
            processorModule: this._processor,
            chainModule: this._chain,
            networkModule: this._networkModule,
        });
    }
    async _startLoader() {
        return this._synchronizer.loadUnconfirmedTransactions();
    }
    async _forgingTask() {
        try {
            if (!this._forger.delegatesEnabled()) {
                this._logger.trace('No delegates are enabled');
                return;
            }
            if (this._synchronizer.isActive) {
                this._logger.debug('Client not ready to forge');
                return;
            }
            await this._forger.forge();
        }
        catch (err) {
            this._logger.error({ err: err });
        }
    }
    async _startForging() {
        try {
            await this._forger.loadDelegates();
        }
        catch (err) {
            this._logger.error({ err: err }, 'Failed to load delegates for forging');
        }
        this._forgingJob = new lisk_utils_1.jobHandlers.Scheduler(async () => this._forgingTask(), forgeInterval);
        this._forgingJob.start();
    }
    _subscribeToEvents() {
        this._chain.events.on(EVENT_NEW_BLOCK, async (eventData) => {
            const { block } = eventData;
            this._channel.publish(constants_1.APP_EVENT_BLOCK_NEW, {
                block: this._chain.dataAccess.encode(block).toString('hex'),
                accounts: eventData.accounts.map(acc => this._chain.dataAccess.encodeAccount(acc).toString('hex')),
            });
            if (block.payload.length) {
                for (const transaction of block.payload) {
                    this._transactionPool.remove(transaction);
                }
            }
            if (!this._synchronizer.isActive) {
                this._networkModule.applyNodeInfo({
                    height: block.header.height,
                    lastBlockID: block.header.id,
                    maxHeightPrevoted: block.header.asset.maxHeightPrevoted,
                    blockVersion: block.header.version,
                });
            }
            this._logger.info({
                id: block.header.id,
                height: block.header.height,
                numberOfTransactions: block.payload.length,
            }, 'New block added to the chain');
        });
        this._chain.events.on(EVENT_DELETE_BLOCK, async (eventData) => {
            const { block } = eventData;
            this._channel.publish(constants_1.APP_EVENT_BLOCK_DELETE, {
                block: this._chain.dataAccess.encode(block).toString('hex'),
                accounts: eventData.accounts.map(acc => this._chain.dataAccess.encodeAccount(acc).toString('hex')),
            });
            if (block.payload.length) {
                for (const transaction of block.payload) {
                    try {
                        await this._transactionPool.add(transaction);
                    }
                    catch (err) {
                        this._logger.error({ err: err }, 'Failed to add transaction back to the pool');
                    }
                }
            }
            this._logger.info({ id: block.header.id, height: block.header.height }, 'Deleted a block from the chain');
        });
        this._chain.events.on(EVENT_VALIDATORS_CHANGED, (eventData) => {
            const updatedValidatorsList = eventData.validators.map(aValidator => ({
                ...aValidator,
                address: aValidator.address.toString('hex'),
            }));
            this._channel.publish(constants_1.APP_EVENT_CHAIN_VALIDATORS_CHANGE, {
                validators: updatedValidatorsList,
            });
        });
        this._processor.events.on(processor_2.EVENT_PROCESSOR_BROADCAST_BLOCK, async ({ block }) => {
            await this._transport.handleBroadcastBlock(block);
        });
        this._processor.events.on(processor_2.EVENT_PROCESSOR_SYNC_REQUIRED, ({ block, peerId }) => {
            this._synchronizer.run(block, peerId).catch(err => {
                this._logger.error({ err: err }, 'Error occurred during synchronization.');
            });
        });
        this._transactionPool.events.on(EVENT_TRANSACTION_REMOVED, event => {
            this._logger.debug(event, 'Transaction was removed from the pool.');
        });
    }
    _unsubscribeToEvents() {
        this._bft.removeAllListeners(lisk_bft_1.EVENT_BFT_BLOCK_FINALIZED);
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map