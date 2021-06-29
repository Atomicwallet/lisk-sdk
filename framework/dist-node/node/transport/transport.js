"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
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
        const data = lisk_codec_1.codec.encode(schemas_1.postBlockEventSchema, {
            block: this._chainModule.dataAccess.encode(block),
        });
        return this._networkModule.send({
            event: 'postBlock',
            data,
        });
    }
    handleRPCGetLastBlock(peerId) {
        this._addRateLimit('getLastBlock', peerId, DEFAULT_LAST_BLOCK_RATE_LIMIT_FREQUENCY);
        return this._chainModule.dataAccess.encode(this._chainModule.lastBlock);
    }
    async handleRPCGetBlocksFromId(data, peerId) {
        this._addRateLimit('getBlocksFromId', peerId, DEFAULT_BLOCKS_FROM_IDS_RATE_LIMIT_FREQUENCY);
        const decodedData = lisk_codec_1.codec.decode(schemas_1.getBlocksFromIdRequestSchema, data);
        const errors = lisk_validator_1.validator.validate(schemas_1.getBlocksFromIdRequestSchema, decodedData);
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
        const { blockId } = decodedData;
        const lastBlock = await this._chainModule.dataAccess.getBlockHeaderByID(blockId);
        const lastBlockHeight = lastBlock.height;
        const fetchUntilHeight = lastBlockHeight + 103;
        const blocks = await this._chainModule.dataAccess.getBlocksByHeightBetween(lastBlockHeight + 1, fetchUntilHeight);
        const encodedBlocks = blocks.map(block => this._chainModule.dataAccess.encode(block));
        return lisk_codec_1.codec.encode(schemas_1.getBlocksFromIdResponseSchema, { blocks: encodedBlocks });
    }
    async handleRPCGetHighestCommonBlock(data, peerId) {
        this._addRateLimit('getHighestCommonBlock', peerId, DEFAULT_COMMON_BLOCK_RATE_LIMIT_FREQUENCY);
        const blockIds = lisk_codec_1.codec.decode(schemas_1.getHighestCommonBlockRequestSchema, data);
        const errors = lisk_validator_1.validator.validate(schemas_1.getHighestCommonBlockRequestSchema, blockIds);
        if (errors.length || !lisk_utils_1.objects.bufferArrayUniqueItems(blockIds.ids)) {
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
        const commonBlockHeader = await this._chainModule.dataAccess.getHighestCommonBlockHeader(blockIds.ids);
        return commonBlockHeader
            ? this._chainModule.dataAccess.encodeBlockHeader(commonBlockHeader)
            : undefined;
    }
    async handleEventPostBlock(data, peerId) {
        if (this._synchronizerModule.isActive) {
            this._logger.debug("Client is syncing. Can't process new block at the moment.");
            return;
        }
        if (data === undefined) {
            const errorMessage = 'Received invalid post block data';
            this._logger.warn({
                errorMessage,
                module: 'transport',
                data,
            }, errorMessage);
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            return;
        }
        const decodedData = lisk_codec_1.codec.decode(schemas_1.postBlockEventSchema, data);
        const errors = lisk_validator_1.validator.validate(schemas_1.postBlockEventSchema, decodedData);
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
        const { block: blockBytes } = decodedData;
        this._channel.publish(constants_1.APP_EVENT_NETWORK_EVENT, {
            event: constants_1.EVENT_POST_BLOCK,
            data: { block: blockBytes.toString('hex') },
        });
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
    async handleRPCGetTransactions(data, peerId) {
        this._addRateLimit('getTransactions', peerId, DEFAULT_RATE_LIMIT_FREQUENCY);
        let decodedData = { transactionIds: [] };
        if (Buffer.isBuffer(data)) {
            decodedData = lisk_codec_1.codec.decode(schemas_1.transactionIdsSchema, data);
            const errors = lisk_validator_1.validator.validate(schemas_1.transactionIdsSchema, decodedData);
            if (errors.length || !lisk_utils_1.objects.bufferArrayUniqueItems(decodedData.transactionIds)) {
                this._logger.warn({ err: errors, peerId }, 'Received invalid getTransactions body');
                this._networkModule.applyPenaltyOnPeer({
                    peerId,
                    penalty: 100,
                });
                throw new lisk_validator_1.LiskValidationError(errors);
            }
        }
        const { transactionIds } = decodedData;
        if (!(transactionIds === null || transactionIds === void 0 ? void 0 : transactionIds.length)) {
            const transactionsBySender = this._transactionPoolModule.getProcessableTransactions();
            const transactions = transactionsBySender
                .values()
                .flat()
                .map(tx => tx.getBytes());
            transactions.splice(DEFAULT_RELEASE_LIMIT);
            return lisk_codec_1.codec.encode(schemas_1.transactionsSchema, {
                transactions,
            });
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
        for (const id of transactionIds) {
            const transaction = this._transactionPoolModule.get(id);
            if (transaction) {
                transactionsFromQueues.push(transaction.getBytes());
            }
            else {
                idsNotInPool.push(id);
            }
        }
        if (idsNotInPool.length) {
            const transactionsFromDatabase = await this._chainModule.dataAccess.getTransactionsByIDs(idsNotInPool);
            return lisk_codec_1.codec.encode(schemas_1.transactionsSchema, {
                transactions: transactionsFromQueues.concat(transactionsFromDatabase.map(t => t.getBytes())),
            });
        }
        return lisk_codec_1.codec.encode(schemas_1.transactionsSchema, {
            transactions: transactionsFromQueues,
        });
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
        if (data === undefined) {
            const errorMessage = 'Received invalid transaction announcement data';
            this._logger.warn({ peerId }, errorMessage);
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            return;
        }
        const decodedData = lisk_codec_1.codec.decode(schemas_1.transactionIdsSchema, data);
        const errors = lisk_validator_1.validator.validate(schemas_1.transactionIdsSchema, decodedData);
        if (errors.length) {
            this._logger.warn({ err: errors, peerId }, 'Received invalid transactions body');
            this._networkModule.applyPenaltyOnPeer({
                peerId,
                penalty: 100,
            });
            throw new lisk_validator_1.LiskValidationError(errors);
        }
        const { transactionIds } = decodedData;
        const encodedIds = transactionIds.map(id => id.toString('hex'));
        this._channel.publish(constants_1.APP_EVENT_NETWORK_EVENT, {
            event: constants_1.EVENT_POST_TRANSACTION_ANNOUNCEMENT,
            data: { transactionIds: encodedIds },
        });
        const unknownTransactionIDs = await this._obtainUnknownTransactionIDs(transactionIds);
        if (unknownTransactionIDs.length > 0) {
            const transactionIdsBuffer = lisk_codec_1.codec.encode(schemas_1.transactionIdsSchema, {
                transactionIds: unknownTransactionIDs,
            });
            const { data: encodedData } = (await this._networkModule.requestFromPeer({
                procedure: 'getTransactions',
                data: transactionIdsBuffer,
                peerId,
            }));
            const transactionsData = lisk_codec_1.codec.decode(schemas_1.transactionsSchema, encodedData);
            try {
                for (const transaction of transactionsData.transactions) {
                    const tx = this._chainModule.dataAccess.decodeTransaction(transaction);
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