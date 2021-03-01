"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_validator_1 = require("@liskhq/lisk-validator");
const errors_1 = require("./errors");
const schemas_1 = require("./schemas");
const broadcaster_1 = require("./broadcaster");
const errors_2 = require("../../errors");
const constants_1 = require("../../constants");
const DEFAULT_RATE_RESET_TIME = 10000;
const DEFAULT_RATE_LIMIT_FREQUENCY = 3;
const DEFAULT_LAST_BLOCK_RATE_LIMIT_FREQUENCY = 10;
const DEFAULT_COMMON_BLOCK_RATE_LIMIT_FREQUENCY = 10;
const DEFAULT_BLOCKS_FROM_IDS_RATE_LIMIT_FREQUENCY = 100;
const DEFAULT_RELEASE_LIMIT = 100;
const DEFAULT_RELEASE_INTERVAL = 5000;
class Transport {
    constructor({ channel, logger, synchronizer, transactionPoolModule, chainModule, processorModule, networkModule, }) {
        this._channel = channel;
        this._logger = logger;
        this._synchronizerModule = synchronizer;
        this._transactionPoolModule = transactionPoolModule;
        this._chainModule = chainModule;
        this._processorModule = processorModule;
        this._networkModule = networkModule;
        this._broadcaster = new broadcaster_1.Broadcaster({
            transactionPool: this._transactionPoolModule,
            logger: this._logger,
            releaseLimit: DEFAULT_RELEASE_LIMIT,
            interval: DEFAULT_RELEASE_INTERVAL,
            networkModule: this._networkModule,
        });
        this._rateTracker = {};
        setInterval(() => {
            this._rateTracker = {};
        }, DEFAULT_RATE_RESET_TIME);
    }
    handleBroadcastTransaction(transaction) {
        this._broadcaster.enqueueTransactionId(transaction.id);
        this._channel.publish(constants_1.APP_EVENT_TRANSACTION_NEW, {
            transaction: transaction.getBytes().toString('hex'),
        });
    }
    async handleBroadcastBlock(block) {
        if (this._synchronizerModule.isActive) {
            this._logger.debug('Transport->onBroadcastBlock: Aborted - blockchain synchronization in progress');
            return null;
        }
        return this._networkModule.send({
            event: 'postBlock',
            data: {
                block: this._chainModule.dataAccess.encode(block).toString('hex'),
            },
        });
    }
    handleRPCGetLastBlock(peerId) {
        this._addRateLimit('getLastBlock', peerId, DEFAULT_LAST_BLOCK_RATE_LIMIT_FREQUENCY);
        return this._chainModule.dataAccess.encode(this._chainModule.lastBlock).toString('hex');
    }
    async handleRPCGetBlocksFromId(data, peerId) {
        this._addRateLimit('getBlocksFromId', peerId, DEFAULT_BLOCKS_FROM_IDS_RATE_LIMIT_FREQUENCY);
        const errors = lisk_validator_1.validator.validate(schemas_1.schemas.getBlocksFromIdRequest, data);
        if (errors.length) {
            const error = new lisk_validator_1.LiskValidationError(errors);
            this._logger.warn({
                err: error,
                req: data,
            }, 'getBlocksFromID request validation failed');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw error;
        }
        const blockID = Buffer.from(data.blockId, 'hex');
        const lastBlock = await this._chainModule.dataAccess.getBlockHeaderByID(blockID);
        const lastBlockHeight = lastBlock.height;
        const fetchUntilHeight = lastBlockHeight + 103;
        const blocks = await this._chainModule.dataAccess.getBlocksByHeightBetween(lastBlockHeight + 1, fetchUntilHeight);
        return blocks.map(block => this._chainModule.dataAccess.encode(block).toString('hex'));
    }
    async handleRPCGetHighestCommonBlock(data, peerId) {
        this._addRateLimit('getHighestCommonBlock', peerId, DEFAULT_COMMON_BLOCK_RATE_LIMIT_FREQUENCY);
        const errors = lisk_validator_1.validator.validate(schemas_1.schemas.getHighestCommonBlockRequest, data);
        if (errors.length) {
            const error = new lisk_validator_1.LiskValidationError(errors);
            this._logger.warn({
                err: error,
                req: data,
            }, 'getHighestCommonBlock request validation failed');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw error;
        }
        const blockIDs = data.ids.map(id => Buffer.from(id, 'hex'));
        const commonBlockHeader = await this._chainModule.dataAccess.getHighestCommonBlockHeader(blockIDs);
        return commonBlockHeader
            ? this._chainModule.dataAccess.encodeBlockHeader(commonBlockHeader).toString('hex')
            : undefined;
    }
    async handleEventPostBlock(data, peerId) {
        if (this._synchronizerModule.isActive) {
            this._logger.debug("Client is syncing. Can't process new block at the moment.");
            return;
        }
        const errors = lisk_validator_1.validator.validate(schemas_1.schemas.postBlockEvent, data);
        if (errors.length) {
            this._logger.warn({
                errors,
                module: 'transport',
                data,
            }, 'Received post block broadcast request in unexpected format');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw new lisk_validator_1.LiskValidationError(errors);
        }
        const blockBytes = Buffer.from(data.block, 'hex');
        let block;
        try {
            block = this._chainModule.dataAccess.decode(blockBytes);
        }
        catch (error) {
            this._logger.warn({
                err: error,
                data,
            }, 'Received post block broadcast request in not decodable format');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw errors;
        }
        try {
            await this._processorModule.process(block, {
                peerId,
            });
        }
        catch (error) {
            if (error instanceof errors_2.ApplyPenaltyError) {
                this._logger.warn({
                    err: error,
                    data,
                }, 'Received post block broadcast request with invalid block');
                this._networkModule.applyPenaltyOnPeer({
                    peerId,
                    penalty: 100,
                });
            }
            throw error;
        }
    }
    async handleRPCGetTransactions(data = { transactionIds: [] }, peerId) {
        this._addRateLimit('getTransactions', peerId, DEFAULT_RATE_LIMIT_FREQUENCY);
        const errors = lisk_validator_1.validator.validate(schemas_1.schemas.getTransactionsRequest, data);
        if (errors.length) {
            this._logger.warn({ err: errors, peerId }, 'Received invalid transactions body');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw new lisk_validator_1.LiskValidationError(errors);
        }
        const { transactionIds } = data;
        if (!(transactionIds === null || transactionIds === void 0 ? void 0 : transactionIds.length)) {
            const transactionsBySender = this._transactionPoolModule.getProcessableTransactions();
            const transactions = transactionsBySender
                .values()
                .flat()
                .map(tx => tx.getBytes().toString('hex'));
            transactions.splice(DEFAULT_RELEASE_LIMIT);
            return {
                transactions,
            };
        }
        if (transactionIds.length > DEFAULT_RELEASE_LIMIT) {
            const error = new Error(`Requested number of transactions ${transactionIds.length} exceeds maximum allowed.`);
            this._logger.warn({ err: error, peerId }, 'Received invalid request.');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw error;
        }
        const transactionsFromQueues = [];
        const idsNotInPool = [];
        for (const idStr of transactionIds) {
            const id = Buffer.from(idStr, 'hex');
            const transaction = this._transactionPoolModule.get(id);
            if (transaction) {
                transactionsFromQueues.push(transaction.getBytes().toString('hex'));
            }
            else {
                idsNotInPool.push(id);
            }
        }
        if (idsNotInPool.length) {
            const transactionsFromDatabase = await this._chainModule.dataAccess.getTransactionsByIDs(idsNotInPool);
            return {
                transactions: transactionsFromQueues.concat(transactionsFromDatabase.map(t => t.getBytes().toString('hex'))),
            };
        }
        return {
            transactions: transactionsFromQueues,
        };
    }
    async handleEventPostTransaction(data) {
        const tx = this._chainModule.dataAccess.decodeTransaction(Buffer.from(data.transaction, 'hex'));
        const id = await this._receiveTransaction(tx);
        return {
            transactionId: id.toString('hex'),
        };
    }
    async handleEventPostTransactionsAnnouncement(data, peerId) {
        this._addRateLimit('postTransactionsAnnouncement', peerId, DEFAULT_RATE_LIMIT_FREQUENCY);
        const errors = lisk_validator_1.validator.validate(schemas_1.schemas.postTransactionsAnnouncementEvent, data);
        if (errors.length) {
            this._logger.warn({ err: errors, peerId }, 'Received invalid transactions body');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw new lisk_validator_1.LiskValidationError(errors);
        }
        const ids = data.transactionIds.map(idStr => Buffer.from(idStr, 'hex'));
        const unknownTransactionIDs = await this._obtainUnknownTransactionIDs(ids);
        if (unknownTransactionIDs.length > 0) {
            const { data: result } = (await this._networkModule.requestFromPeer({
                procedure: 'getTransactions',
                data: {
                    transactionIds: unknownTransactionIDs.map(id => id.toString('hex')),
                },
                peerId,
            }));
            try {
                for (const transaction of result.transactions) {
                    const tx = this._chainModule.dataAccess.decodeTransaction(Buffer.from(transaction, 'hex'));
                    await this._receiveTransaction(tx);
                }
            }
            catch (err) {
                this._logger.warn({ err, peerId }, 'Received invalid transactions.');
                if (err instanceof errors_1.InvalidTransactionError) {
                    this._networkModule.applyPenaltyOnPeer({
                        peerId,
                        penalty: 100,
                    });
                }
            }
        }
        return null;
    }
    async _obtainUnknownTransactionIDs(ids) {
        const unknownTransactionsIDs = ids.filter(id => !this._transactionPoolModule.contains(id));
        if (unknownTransactionsIDs.length) {
            const existingTransactions = await this._chainModule.dataAccess.getTransactionsByIDs(unknownTransactionsIDs);
            return unknownTransactionsIDs.filter(id => existingTransactions.find(existingTransaction => existingTransaction.id.equals(id)) ===
                undefined);
        }
        return unknownTransactionsIDs;
    }
    async _receiveTransaction(transaction) {
        try {
            this._processorModule.validateTransaction(transaction);
        }
        catch (err) {
            throw new errors_1.InvalidTransactionError(err.toString(), transaction.id);
        }
        if (this._transactionPoolModule.contains(transaction.id)) {
            return transaction.id;
        }
        this.handleBroadcastTransaction(transaction);
        const { error } = await this._transactionPoolModule.add(transaction);
        if (!error) {
            this._logger.info({
                id: transaction.id,
                nonce: transaction.nonce.toString(),
                senderPublicKey: transaction.senderPublicKey,
            }, 'Added transaction to pool');
            return transaction.id;
        }
        this._logger.error({ err: error }, 'Failed to add transaction to pool.');
        throw error;
    }
    _addRateLimit(procedure, peerId, limit) {
        if (this._rateTracker[procedure] === undefined) {
            this._rateTracker[procedure] = { [peerId]: 0 };
        }
        this._rateTracker[procedure][peerId] = this._rateTracker[procedure][peerId]
            ? this._rateTracker[procedure][peerId] + 1
            : 1;
        if (this._rateTracker[procedure][peerId] > limit) {
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 10,
            });
        }
    }
}
exports.Transport = Transport;
//# sourceMappingURL=transport.js.map