"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPool = exports.events = exports.DEFAULT_REORGANIZE_TIME = exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE = exports.DEFAULT_EXPIRE_INTERVAL = exports.DEFAULT_EXPIRY_TIME = exports.DEFAULT_MIN_ENTRANCE_FEE_PRIORITY = exports.DEFAULT_MAX_TRANSACTIONS_PER_ACCOUNT = exports.DEFAULT_MAX_TRANSACTIONS = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const createDebug = require("debug");
const events_1 = require("events");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const errors_1 = require("./errors");
const job_1 = require("./job");
const transaction_list_1 = require("./transaction_list");
const types_1 = require("./types");
const debug = createDebug('lisk:transaction_pool');
exports.DEFAULT_MAX_TRANSACTIONS = 4096;
exports.DEFAULT_MAX_TRANSACTIONS_PER_ACCOUNT = 64;
exports.DEFAULT_MIN_ENTRANCE_FEE_PRIORITY = BigInt(0);
exports.DEFAULT_EXPIRY_TIME = 3 * 60 * 60 * 1000;
exports.DEFAULT_EXPIRE_INTERVAL = 60 * 60 * 1000;
exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE = BigInt(10);
exports.DEFAULT_REORGANIZE_TIME = 500;
exports.events = {
    EVENT_TRANSACTION_REMOVED: 'EVENT_TRANSACTION_REMOVED',
};
const ERR_NONCE_OUT_OF_BOUNDS_CODE = 'ERR_NONCE_OUT_OF_BOUNDS';
const ERR_TRANSACTION_VERIFICATION_FAIL = 'ERR_TRANSACTION_VERIFICATION_FAIL';
class TransactionPool {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f;
        this.events = new events_1.EventEmitter();
        this._feePriorityQueue = new lisk_utils_1.dataStructures.MinHeap();
        this._allTransactions = new lisk_utils_1.dataStructures.BufferMap();
        this._transactionList = new lisk_utils_1.dataStructures.BufferMap();
        this._applyFunction = config.applyTransactions;
        this._maxTransactions = (_a = config.maxTransactions) !== null && _a !== void 0 ? _a : exports.DEFAULT_MAX_TRANSACTIONS;
        this._maxTransactionsPerAccount =
            (_b = config.maxTransactionsPerAccount) !== null && _b !== void 0 ? _b : exports.DEFAULT_MAX_TRANSACTIONS_PER_ACCOUNT;
        this._transactionExpiryTime = (_c = config.transactionExpiryTime) !== null && _c !== void 0 ? _c : exports.DEFAULT_EXPIRY_TIME;
        this._minEntranceFeePriority =
            (_d = config.minEntranceFeePriority) !== null && _d !== void 0 ? _d : exports.DEFAULT_MIN_ENTRANCE_FEE_PRIORITY;
        this._transactionReorganizationInterval =
            (_e = config.transactionReorganizationInterval) !== null && _e !== void 0 ? _e : exports.DEFAULT_REORGANIZE_TIME;
        this._minReplacementFeeDifference =
            (_f = config.minReplacementFeeDifference) !== null && _f !== void 0 ? _f : exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE;
        this._baseFees = config.baseFees;
        this._minFeePerByte = config.minFeePerByte;
        this._reorganizeJob = new job_1.Job(async () => this._reorganize(), this._transactionReorganizationInterval);
        this._expireJob = new job_1.Job(async () => this._expire(), exports.DEFAULT_EXPIRE_INTERVAL);
    }
    async start() {
        this._reorganizeJob.start();
        this._expireJob.start();
    }
    stop() {
        this._reorganizeJob.stop();
        this._expireJob.stop();
    }
    getAll() {
        return this._allTransactions.values();
    }
    get(id) {
        return this._allTransactions.get(id);
    }
    contains(id) {
        return this._allTransactions.has(id);
    }
    async add(incomingTx) {
        if (this._allTransactions.has(incomingTx.id)) {
            debug('Received duplicate transaction', incomingTx.id);
            return { status: types_1.Status.OK };
        }
        incomingTx.feePriority = this._calculateFeePriority(incomingTx);
        if (incomingTx.feePriority < this._minEntranceFeePriority) {
            const error = new errors_1.TransactionPoolError('Rejecting transaction due to failed minimum entrance fee priority requirement.', incomingTx.id, '.fee', incomingTx.feePriority.toString(), this._minEntranceFeePriority.toString());
            return { status: types_1.Status.FAIL, error };
        }
        const lowestFeePriorityTrx = this._feePriorityQueue.peek();
        if (this._allTransactions.size >= this._maxTransactions &&
            lowestFeePriorityTrx &&
            incomingTx.feePriority <= lowestFeePriorityTrx.key) {
            const error = new errors_1.TransactionPoolError('Rejecting transaction due to fee priority when the pool is full.', incomingTx.id, '.fee', incomingTx.feePriority.toString(), lowestFeePriorityTrx.key.toString());
            return { status: types_1.Status.FAIL, error };
        }
        const incomingTxAddress = lisk_cryptography_1.getAddressFromPublicKey(incomingTx.senderPublicKey);
        let txStatus;
        try {
            await this._applyFunction([incomingTx]);
            txStatus = types_1.TransactionStatus.PROCESSABLE;
        }
        catch (err) {
            txStatus = this._getStatus(err);
            if (txStatus === types_1.TransactionStatus.INVALID) {
                return {
                    status: types_1.Status.FAIL,
                    error: err,
                };
            }
        }
        const exceededTransactionsCount = this._allTransactions.size - this._maxTransactions;
        if (exceededTransactionsCount >= 0) {
            const isEvicted = this._evictUnprocessable();
            if (!isEvicted) {
                this._evictProcessable();
            }
        }
        if (!this._transactionList.has(incomingTxAddress)) {
            this._transactionList.set(incomingTxAddress, new transaction_list_1.TransactionList(incomingTxAddress, {
                maxSize: this._maxTransactionsPerAccount,
                minReplacementFeeDifference: this._minReplacementFeeDifference,
            }));
        }
        const { added, removedID, reason } = this._transactionList.get(incomingTxAddress).add(incomingTx, txStatus === types_1.TransactionStatus.PROCESSABLE);
        if (!added) {
            return {
                status: types_1.Status.FAIL,
                error: new errors_1.TransactionPoolError(reason, incomingTx.id),
            };
        }
        if (removedID) {
            debug('Removing from transaction pool with id', removedID);
            const removedTx = this._allTransactions.get(removedID);
            this._allTransactions.delete(removedID);
            this.events.emit(exports.events.EVENT_TRANSACTION_REMOVED, {
                id: removedTx.id,
                nonce: removedTx.nonce.toString(),
                senderPublicKey: removedTx.senderPublicKey,
                reason: 'Transaction List executed remove',
            });
        }
        incomingTx.receivedAt = new Date();
        this._allTransactions.set(incomingTx.id, incomingTx);
        this._feePriorityQueue.push(this._calculateFeePriority(incomingTx), incomingTx.id);
        return { status: types_1.Status.OK };
    }
    remove(tx) {
        var _a;
        const foundTx = this._allTransactions.get(tx.id);
        if (!foundTx) {
            return false;
        }
        this._allTransactions.delete(tx.id);
        debug('Removing from transaction pool with id', tx.id);
        const senderId = lisk_cryptography_1.getAddressFromPublicKey(foundTx.senderPublicKey);
        this._transactionList.get(senderId).remove(tx.nonce);
        if (this._transactionList.get(senderId).size === 0) {
            this._transactionList.delete(senderId);
        }
        this._feePriorityQueue.clear();
        for (const txObject of this.getAll()) {
            this._feePriorityQueue.push((_a = txObject.feePriority) !== null && _a !== void 0 ? _a : this._calculateFeePriority(txObject), txObject.id);
        }
        return true;
    }
    getProcessableTransactions() {
        const processableTransactions = new lisk_utils_1.dataStructures.BufferMap();
        for (const list of this._transactionList.values()) {
            const transactions = list.getProcessable();
            if (transactions.length !== 0) {
                processableTransactions.set(list.address, [...transactions]);
            }
        }
        return processableTransactions;
    }
    _calculateFeePriority(trx) {
        return (trx.fee - this._calculateMinFee(trx)) / BigInt(trx.getBytes().length);
    }
    _calculateMinFee(trx) {
        var _a;
        const foundBaseFee = this._baseFees.find(f => f.moduleID === trx.moduleID && f.assetID === trx.assetID);
        return (BigInt((_a = foundBaseFee === null || foundBaseFee === void 0 ? void 0 : foundBaseFee.baseFee) !== null && _a !== void 0 ? _a : BigInt(0)) +
            BigInt(this._minFeePerByte * trx.getBytes().length));
    }
    _getStatus(errorResponse) {
        if (errorResponse.code === ERR_TRANSACTION_VERIFICATION_FAIL &&
            errorResponse.transactionError.code === ERR_NONCE_OUT_OF_BOUNDS_CODE) {
            debug('Received UNPROCESSABLE transaction');
            return types_1.TransactionStatus.UNPROCESSABLE;
        }
        debug('Received INVALID transaction');
        return types_1.TransactionStatus.INVALID;
    }
    _evictUnprocessable() {
        const unprocessableFeePriorityHeap = new lisk_utils_1.dataStructures.MinHeap();
        for (const txList of this._transactionList.values()) {
            const unprocessableTransactions = txList.getUnprocessable();
            for (const unprocessableTx of unprocessableTransactions) {
                unprocessableFeePriorityHeap.push(unprocessableTx.feePriority, unprocessableTx);
            }
        }
        if (unprocessableFeePriorityHeap.count < 1) {
            return false;
        }
        const evictedTransaction = unprocessableFeePriorityHeap.pop();
        if (!evictedTransaction) {
            return false;
        }
        this.events.emit(exports.events.EVENT_TRANSACTION_REMOVED, {
            id: evictedTransaction.value.id,
            nonce: evictedTransaction.value.nonce.toString(),
            senderPublicKey: evictedTransaction.value.senderPublicKey,
            reason: 'Pool exceeded the size limit',
        });
        return this.remove(evictedTransaction.value);
    }
    _evictProcessable() {
        const processableFeePriorityHeap = new lisk_utils_1.dataStructures.MinHeap();
        for (const txList of this._transactionList.values()) {
            const processableTransactions = txList.getProcessable();
            if (processableTransactions.length) {
                const processableTransactionWithHighestNonce = processableTransactions[processableTransactions.length - 1];
                processableFeePriorityHeap.push(processableTransactionWithHighestNonce.feePriority, processableTransactionWithHighestNonce);
            }
        }
        if (processableFeePriorityHeap.count < 1) {
            return false;
        }
        const evictedTransaction = processableFeePriorityHeap.pop();
        if (!evictedTransaction) {
            return false;
        }
        this.events.emit(exports.events.EVENT_TRANSACTION_REMOVED, {
            id: evictedTransaction.value.id,
            nonce: evictedTransaction.value.nonce.toString(),
            senderPublicKey: evictedTransaction.value.senderPublicKey,
            reason: 'Pool exceeded the size limit',
        });
        return this.remove(evictedTransaction.value);
    }
    async _reorganize() {
        for (const txList of this._transactionList.values()) {
            const promotableTransactions = txList.getPromotable();
            if (!promotableTransactions.length) {
                continue;
            }
            const processableTransactions = txList.getProcessable();
            const allTransactions = [...processableTransactions, ...promotableTransactions];
            let firstInvalidTransaction;
            try {
                await this._applyFunction(allTransactions);
            }
            catch (error) {
                const failedStatus = this._getStatus(error);
                firstInvalidTransaction = {
                    id: error.id,
                    status: failedStatus,
                };
            }
            const successfulTransactionIds = [];
            for (const tx of allTransactions) {
                if (firstInvalidTransaction && tx.id.equals(firstInvalidTransaction.id)) {
                    break;
                }
                successfulTransactionIds.push(tx.id);
            }
            txList.promote(promotableTransactions.filter(tx => successfulTransactionIds.includes(tx.id)));
            const invalidTransaction = firstInvalidTransaction && firstInvalidTransaction.status === types_1.TransactionStatus.INVALID
                ? allTransactions.find(tx => tx.id.equals(firstInvalidTransaction === null || firstInvalidTransaction === void 0 ? void 0 : firstInvalidTransaction.id))
                : undefined;
            if (invalidTransaction) {
                for (const tx of allTransactions) {
                    if (tx.nonce >= invalidTransaction.nonce) {
                        this.events.emit(exports.events.EVENT_TRANSACTION_REMOVED, {
                            id: tx.id,
                            nonce: tx.nonce.toString(),
                            senderPublicKey: tx.senderPublicKey,
                            reason: `Invalid transaction ${invalidTransaction.id.toString('binary')}`,
                        });
                        this.remove(tx);
                    }
                }
            }
        }
    }
    async _expire() {
        for (const transaction of this._allTransactions.values()) {
            const timeDifference = Math.round(Math.abs(transaction.receivedAt.getTime() - new Date().getTime()));
            if (timeDifference > this._transactionExpiryTime) {
                this.events.emit(exports.events.EVENT_TRANSACTION_REMOVED, {
                    id: transaction.id,
                    nonce: transaction.nonce.toString(),
                    senderPublicKey: transaction.senderPublicKey,
                    reason: 'Transaction exceeded the expiry time',
                });
                this.remove(transaction);
            }
        }
    }
}
exports.TransactionPool = TransactionPool;
//# sourceMappingURL=transaction_pool.js.map