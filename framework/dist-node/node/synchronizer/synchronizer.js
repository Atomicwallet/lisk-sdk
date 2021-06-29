"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Synchronizer = void 0;
const assert = require("assert");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const schemas_1 = require("../transport/schemas");
const utils = require("./utils");
class Synchronizer {
    constructor({ channel, logger, chainModule, bftModule, processorModule, transactionPoolModule, mechanisms = [], networkModule, }) {
        assert(Array.isArray(mechanisms), 'mechanisms should be an array of mechanisms');
        this.mechanisms = mechanisms;
        this.channel = channel;
        this.logger = logger;
        this.chainModule = chainModule;
        this.bftModule = bftModule;
        this.processorModule = processorModule;
        this.transactionPoolModule = transactionPoolModule;
        this._networkModule = networkModule;
        this.loadTransactionsRetries = 5;
        this._checkMechanismsInterfaces();
        this._mutex = new lisk_utils_1.jobHandlers.Mutex();
    }
    async init() {
        const isEmpty = await this.chainModule.dataAccess.isTempBlockEmpty();
        if (!isEmpty) {
            try {
                await utils.restoreBlocksUponStartup(this.logger, this.chainModule, this.bftModule, this.processorModule);
            }
            catch (err) {
                this.logger.error({ err: err }, 'Failed to restore blocks from temp table upon startup');
            }
        }
    }
    async run(receivedBlock, peerId) {
        if (this._mutex.isLocked()) {
            this.logger.debug('Synchronizer is already running.');
            return;
        }
        await this._mutex.runExclusive(async () => {
            assert(receivedBlock, 'A block must be provided to the Synchronizer in order to run');
            this.logger.info({
                blockId: receivedBlock.header.id,
                height: receivedBlock.header.height,
            }, 'Starting synchronizer');
            this.processorModule.validate(receivedBlock);
            const validMechanism = await this._determineSyncMechanism(receivedBlock, peerId);
            if (!validMechanism) {
                this.logger.info({ blockId: receivedBlock.header.id }, 'Syncing mechanism could not be determined for the given block');
                return;
            }
            this.logger.info(`Triggering: ${validMechanism.constructor.name}`);
            await validMechanism.run(receivedBlock, peerId);
            this.logger.info({
                lastBlockHeight: this.chainModule.lastBlock.header.height,
                lastBlockID: this.chainModule.lastBlock.header.id,
                mechanism: validMechanism.constructor.name,
            }, 'Synchronization finished.');
        });
    }
    get isActive() {
        return this._mutex.isLocked();
    }
    async stop() {
        for (const mechanism of this.mechanisms) {
            mechanism.stop();
        }
        await this._mutex.acquire();
    }
    async loadUnconfirmedTransactions() {
        for (let retry = 0; retry < this.loadTransactionsRetries; retry += 1) {
            try {
                await this._getUnconfirmedTransactionsFromNetwork();
                break;
            }
            catch (err) {
                if (err && retry === this.loadTransactionsRetries - 1) {
                    this.logger.error({ err: err }, `Failed to get transactions from network after ${this.loadTransactionsRetries} retries`);
                }
            }
        }
    }
    async _determineSyncMechanism(receivedBlock, peerId) {
        for (const mechanism of this.mechanisms) {
            if (await mechanism.isValidFor(receivedBlock, peerId)) {
                return mechanism;
            }
        }
        return undefined;
    }
    async _getUnconfirmedTransactionsFromNetwork() {
        this.logger.info('Loading transactions from the network');
        const { data } = (await this._networkModule.request({
            procedure: 'getTransactions',
        }));
        const encodedData = lisk_codec_1.codec.decode(schemas_1.transactionsSchema, data);
        const validatorErrors = lisk_validator_1.validator.validate(schemas_1.transactionsSchema, encodedData);
        if (validatorErrors.length) {
            throw new lisk_validator_1.LiskValidationError(validatorErrors);
        }
        const transactions = encodedData.transactions.map(transaction => this.chainModule.dataAccess.decodeTransaction(transaction));
        for (const transaction of transactions) {
            this.processorModule.validateTransaction(transaction);
        }
        const transactionCount = transactions.length;
        for (let i = 0; i < transactionCount; i += 1) {
            const { error } = await this.transactionPoolModule.add(transactions[i]);
            if (error) {
                this.logger.error({ err: error }, 'Failed to add transaction to pool.');
                throw error;
            }
        }
    }
    _checkMechanismsInterfaces() {
        for (const mechanism of this.mechanisms) {
            assert(typeof mechanism.isValidFor === 'function', `Mechanism ${mechanism.constructor.name} should implement "isValidFor" method`);
            assert(typeof mechanism.run === 'function', `Mechanism ${mechanism.constructor.name} should implement "run" method`);
        }
    }
}
exports.Synchronizer = Synchronizer;
//# sourceMappingURL=synchronizer.js.map