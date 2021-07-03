"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPool = exports.ACTION_ADD_PENDING_TRANSACTIONS = exports.ACTION_ADD_VERIFIED_TRANSACTIONS = exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS = exports.ACTION_VALIDATE_RECEIVED_TRANSACTIONS = exports.ACTION_PROCESS_VERIFIED_TRANSACTIONS = exports.ACTION_EXPIRE_TRANSACTIONS = exports.ACTION_ADD_TRANSACTIONS = exports.ACTION_REMOVE_CONFIRMED_TRANSACTIONS = exports.ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS = exports.EVENT_VERIFIED_TRANSACTION_ONCE = exports.EVENT_REMOVED_TRANSACTIONS = exports.EVENT_ADDED_TRANSACTIONS = void 0;
const events_1 = require("events");
const check_transactions_1 = require("./check_transactions");
const job_1 = require("./job");
const queue_1 = require("./queue");
const queueCheckers = require("./queue_checkers");
const DEFAULT_PENDING_TRANSACTIONS_PROCESSING_LIMIT = 5;
const DEFAULT_EXPIRE_TRANSACTION_INTERVAL = 30000;
const DEFAULT_MAX_TRANSACTIONS_PER_QUEUE = 1000;
const DEFAULT_RECEIVED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
const DEFAULT_RECEIVED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
const DEFAULT_VALIDATED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
const DEFAULT_VALIDATED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
const DEFAULT_VERIFIED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
const DEFAULT_VERIFIED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
exports.EVENT_ADDED_TRANSACTIONS = 'transactionsAdded';
exports.EVENT_REMOVED_TRANSACTIONS = 'transactionsRemoved';
exports.EVENT_VERIFIED_TRANSACTION_ONCE = 'transactionVerifiedOnce';
exports.ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS = 'addVerifiedRemovedTransactions';
exports.ACTION_REMOVE_CONFIRMED_TRANSACTIONS = 'removeConfirmedTransactions';
exports.ACTION_ADD_TRANSACTIONS = 'addTransactions';
exports.ACTION_EXPIRE_TRANSACTIONS = 'expireTransactions';
exports.ACTION_PROCESS_VERIFIED_TRANSACTIONS = 'processVerifiedTransactions';
exports.ACTION_VALIDATE_RECEIVED_TRANSACTIONS = 'validateReceivedTransactions';
exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS = 'verifyValidatedTransactions';
exports.ACTION_ADD_VERIFIED_TRANSACTIONS = 'addVerifiedTransactions';
exports.ACTION_ADD_PENDING_TRANSACTIONS = 'addPendingTransactions';
class TransactionPool extends events_1.EventEmitter {
    constructor({ expireTransactionsInterval = DEFAULT_EXPIRE_TRANSACTION_INTERVAL, maxTransactionsPerQueue = DEFAULT_MAX_TRANSACTIONS_PER_QUEUE, receivedTransactionsProcessingInterval = DEFAULT_RECEIVED_TRANSACTIONS_PROCESSING_INTERVAL, receivedTransactionsLimitPerProcessing = DEFAULT_RECEIVED_TRANSACTIONS_LIMIT_PER_PROCESSING, validatedTransactionsProcessingInterval = DEFAULT_VALIDATED_TRANSACTIONS_PROCESSING_INTERVAL, validatedTransactionsLimitPerProcessing = DEFAULT_VALIDATED_TRANSACTIONS_LIMIT_PER_PROCESSING, verifiedTransactionsProcessingInterval = DEFAULT_VERIFIED_TRANSACTIONS_PROCESSING_INTERVAL, verifiedTransactionsLimitPerProcessing = DEFAULT_VERIFIED_TRANSACTIONS_LIMIT_PER_PROCESSING, pendingTransactionsProcessingLimit = DEFAULT_PENDING_TRANSACTIONS_PROCESSING_LIMIT, validateTransactions, verifyTransactions, processTransactions, }) {
        super();
        this._maxTransactionsPerQueue = maxTransactionsPerQueue;
        this._pendingTransactionsProcessingLimit = pendingTransactionsProcessingLimit;
        this._queues = {
            received: new queue_1.Queue(),
            validated: new queue_1.Queue(),
            verified: new queue_1.Queue(),
            pending: new queue_1.Queue(),
            ready: new queue_1.Queue(),
        };
        this._expireTransactionsInterval = expireTransactionsInterval;
        this._expireTransactionsJob = new job_1.Job(this.expireTransactions.bind(this), this._expireTransactionsInterval);
        this._expireTransactionsJob.start();
        this._receivedTransactionsProcessingInterval = receivedTransactionsProcessingInterval;
        this._receivedTransactionsProcessingLimitPerInterval = receivedTransactionsLimitPerProcessing;
        this._validateTransactions = validateTransactions;
        this._validateTransactionsJob = new job_1.Job(this.validateReceivedTransactions.bind(this), this._receivedTransactionsProcessingInterval);
        this._validateTransactionsJob.start();
        this._validatedTransactionsProcessingInterval = validatedTransactionsProcessingInterval;
        this._validatedTransactionsProcessingLimitPerInterval = validatedTransactionsLimitPerProcessing;
        this._verifyTransactions = verifyTransactions;
        this._verifyTransactionsJob = new job_1.Job(this.verifyValidatedTransactions.bind(this), this._validatedTransactionsProcessingInterval);
        this._verifyTransactionsJob.start();
        this._verifiedTransactionsProcessingInterval = verifiedTransactionsProcessingInterval;
        this._verifiedTransactionsProcessingLimitPerInterval = verifiedTransactionsLimitPerProcessing;
        this._processTransactions = processTransactions;
        this._processTransactionsJob = new job_1.Job(this.processVerifiedTransactions.bind(this), this._verifiedTransactionsProcessingInterval);
        this._processTransactionsJob.start();
    }
    cleanup() {
        this.removeTransactionsFromQueues(Object.keys(this.queues), queueCheckers.returnTrueUntilLimit(this._maxTransactionsPerQueue));
        this._expireTransactionsJob.stop();
        this._validateTransactionsJob.stop();
        this._verifyTransactionsJob.stop();
        this._processTransactionsJob.stop();
    }
    addTransaction(transaction) {
        const receivedQueue = 'received';
        transaction.verifiedOnce = false;
        return this.addTransactionToQueue(receivedQueue, transaction);
    }
    addPendingTransaction(transaction) {
        const pendingQueue = 'pending';
        return this.addTransactionToQueue(pendingQueue, transaction);
    }
    addVerifiedTransaction(transaction) {
        const verifiedQueue = 'verified';
        return this.addTransactionToQueue(verifiedQueue, transaction);
    }
    addVerifiedRemovedTransactions(transactions) {
        const _a = this._queues, { received, validated } = _a, otherQueues = __rest(_a, ["received", "validated"]);
        const removedTransactionsByRecipientIdFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForSenderIdWithRecipientIds(transactions));
        this._queues.received.enqueueMany(removedTransactionsByRecipientIdFromValidatedQueue);
        const removedTransactionsByRecipientIdFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForSenderIdWithRecipientIds(transactions));
        this._queues.validated.enqueueMany(removedTransactionsByRecipientIdFromOtherQueues);
        this._queues.verified.enqueueMany(transactions);
        this.emit(exports.EVENT_ADDED_TRANSACTIONS, {
            action: exports.ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS,
            to: 'verified',
            payload: transactions,
        });
    }
    addVerifiedSignature(signatureObject) {
        const transaction = this.findInTransactionPool(signatureObject.transactionId);
        if (transaction) {
            return transaction.addVerifiedSignature(signatureObject.signature);
        }
        return {
            id: signatureObject.transactionId,
            status: check_transactions_1.Status.FAIL,
            errors: [new Error('Could not find transaction in transaction pool')],
        };
    }
    existsInTransactionPool(id) {
        return Object.keys(this._queues).reduce((previousValue, queueName) => previousValue || this._queues[queueName].exists(id), false);
    }
    findInTransactionPool(id) {
        return Object.keys(this._queues).reduce((previousValue, queueName) => previousValue || this._queues[queueName].index[id], undefined);
    }
    get queues() {
        return this._queues;
    }
    getProcessableTransactions(limit) {
        return this._queues.ready.peekUntil(queueCheckers.returnTrueUntilLimit(limit));
    }
    removeConfirmedTransactions(transactions) {
        const removedTransactions = this.removeTransactionsFromQueues(Object.keys(this._queues), queueCheckers.checkTransactionForId(transactions));
        const _a = this._queues, { received, validated } = _a, otherQueues = __rest(_a, ["received", "validated"]);
        const confirmedTransactionsWithUniqueData = transactions.filter((transaction) => transaction.containsUniqueData);
        const removedTransactionsBySenderPublicKeysFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForSenderPublicKey(transactions));
        const removedTransactionsByTypesFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForTypes(confirmedTransactionsWithUniqueData));
        this._queues.received.enqueueMany([
            ...removedTransactionsBySenderPublicKeysFromValidatedQueue,
            ...removedTransactionsByTypesFromValidatedQueue,
        ]);
        const removedTransactionsBySenderPublicKeysFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForSenderPublicKey(transactions));
        const removedTransactionsByTypesFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForTypes(confirmedTransactionsWithUniqueData));
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_REMOVE_CONFIRMED_TRANSACTIONS,
            payload: removedTransactions,
        });
        this._queues.validated.enqueueMany([
            ...removedTransactionsBySenderPublicKeysFromOtherQueues,
            ...removedTransactionsByTypesFromOtherQueues,
        ]);
    }
    reverifyTransactionsFromSenders(senderPublicKeys) {
        const _a = this._queues, { received, validated } = _a, otherQueues = __rest(_a, ["received", "validated"]);
        const senderProperty = 'senderPublicKey';
        const removedTransactionsBySenderPublicKeysFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionPropertyForValues(senderPublicKeys, senderProperty));
        this._queues.received.enqueueMany(removedTransactionsBySenderPublicKeysFromValidatedQueue);
        const removedTransactionsBySenderPublicKeysFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionPropertyForValues(senderPublicKeys, senderProperty));
        this._queues.validated.enqueueMany(removedTransactionsBySenderPublicKeysFromOtherQueues);
    }
    validateTransactionAgainstTransactionsInPool(transaction) {
        return transaction.verifyAgainstOtherTransactions([
            ...this.queues.ready.transactions,
            ...this.queues.pending.transactions,
            ...this.queues.verified.transactions,
        ]);
    }
    addTransactionToQueue(queueName, transaction) {
        if (this.existsInTransactionPool(transaction.id)) {
            return {
                isFull: false,
                alreadyExists: true,
                queueName,
            };
        }
        if (this._queues[queueName].size() >= this._maxTransactionsPerQueue) {
            return {
                isFull: true,
                alreadyExists: false,
                queueName,
            };
        }
        transaction.receivedAt = new Date();
        this._queues[queueName].enqueueOne(transaction);
        this.emit(exports.EVENT_ADDED_TRANSACTIONS, {
            action: exports.ACTION_ADD_TRANSACTIONS,
            to: queueName,
            payload: [transaction],
        });
        if (queueName === 'verified' || queueName === 'pending') {
            this.emit(exports.EVENT_VERIFIED_TRANSACTION_ONCE, {
                action: queueName === 'verified'
                    ? exports.ACTION_ADD_VERIFIED_TRANSACTIONS
                    : exports.ACTION_ADD_PENDING_TRANSACTIONS,
                payload: [transaction],
            });
        }
        return {
            isFull: false,
            alreadyExists: false,
            queueName,
        };
    }
    async expireTransactions() {
        const expiredTransactions = this.removeTransactionsFromQueues(Object.keys(this._queues), queueCheckers.checkTransactionForExpiry());
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_EXPIRE_TRANSACTIONS,
            payload: expiredTransactions,
        });
        return expiredTransactions;
    }
    async processVerifiedTransactions() {
        const transactionsInReadyQueue = this._queues.ready.size();
        const transactionsInVerifiedQueue = this._queues.verified.size();
        const processableTransactionsInPendingQueue = this._queues.pending.sizeBy(transaction => transaction.isReady());
        if (transactionsInReadyQueue >=
            this._verifiedTransactionsProcessingLimitPerInterval ||
            (transactionsInVerifiedQueue === 0 &&
                processableTransactionsInPendingQueue === 0)) {
            return {
                passedTransactions: [],
                failedTransactions: [],
            };
        }
        const additionalTransactionsToProcessLimit = this._verifiedTransactionsProcessingLimitPerInterval -
            transactionsInReadyQueue;
        const transactionsFromPendingQueueLimit = Math.min(additionalTransactionsToProcessLimit, this._pendingTransactionsProcessingLimit);
        const transactionsFromPendingQueue = this._queues.pending
            .filter(transaction => transaction.isReady())
            .slice(0, transactionsFromPendingQueueLimit);
        const additionalVerifiedTransactionsToProcessLimit = additionalTransactionsToProcessLimit -
            transactionsFromPendingQueue.length;
        const transactionsFromVerifiedQueue = this._queues.verified.peekUntil(queueCheckers.returnTrueUntilLimit(additionalVerifiedTransactionsToProcessLimit));
        const transactionsFromReadyQueue = this._queues.ready.peekUntil(queueCheckers.returnTrueUntilLimit(transactionsInReadyQueue));
        const toProcessTransactions = [
            ...transactionsFromReadyQueue,
            ...transactionsFromPendingQueue,
            ...transactionsFromVerifiedQueue,
        ];
        const { passedTransactions, failedTransactions, } = await check_transactions_1.checkTransactionsWithPassAndFail(toProcessTransactions, this._processTransactions);
        const _a = this._queues, { received, validated } = _a, otherQueues = __rest(_a, ["received", "validated"]);
        const removedTransactions = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForId(failedTransactions));
        this._queues.ready.enqueueMany(this._queues.ready.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
        this._queues.ready.enqueueMany(this._queues.verified.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
        this._queues.ready.enqueueMany(this._queues.pending.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_PROCESS_VERIFIED_TRANSACTIONS,
            payload: removedTransactions,
        });
        return {
            passedTransactions,
            failedTransactions,
        };
    }
    removeTransactionsFromQueues(queueNames, condition) {
        return queueNames
            .map(queueName => this._queues[queueName].removeFor(condition))
            .reduce((transactionsAccumulatedFromQueues, transactionsFromCurrentQueue) => transactionsAccumulatedFromQueues.concat(transactionsFromCurrentQueue), []);
    }
    async validateReceivedTransactions() {
        if (this.queues.validated.size() >= this._maxTransactionsPerQueue ||
            this.queues.received.size() === 0) {
            return {
                passedTransactions: [],
                failedTransactions: [],
            };
        }
        const toValidateTransactions = this._queues.received.peekUntil(queueCheckers.returnTrueUntilLimit(this._receivedTransactionsProcessingLimitPerInterval));
        const { passedTransactions, failedTransactions, } = await check_transactions_1.checkTransactionsWithPassAndFail(toValidateTransactions, this._validateTransactions);
        const removedTransactions = this._queues.received.removeFor(queueCheckers.checkTransactionForId(failedTransactions));
        this._queues.validated.enqueueMany(this._queues.received.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_VALIDATE_RECEIVED_TRANSACTIONS,
            payload: removedTransactions,
        });
        return {
            passedTransactions,
            failedTransactions,
        };
    }
    async verifyValidatedTransactions() {
        if (this.queues.verified.size() >= this._maxTransactionsPerQueue ||
            this.queues.validated.size() === 0) {
            return {
                passedTransactions: [],
                failedTransactions: [],
                pendingTransactions: [],
            };
        }
        const toVerifyTransactions = this._queues.validated.peekUntil(queueCheckers.returnTrueUntilLimit(this._validatedTransactionsProcessingLimitPerInterval));
        const { failedTransactions, pendingTransactions, passedTransactions, } = await check_transactions_1.checkTransactionsWithPassFailAndPending(toVerifyTransactions, this._verifyTransactions);
        const removedTransactions = this._queues.validated.removeFor(queueCheckers.checkTransactionForId(failedTransactions));
        this._queues.verified.enqueueMany(this._queues.validated.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
        this._queues.pending.enqueueMany(this._queues.validated.removeFor(queueCheckers.checkTransactionForId(pendingTransactions)));
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS,
            payload: removedTransactions,
        });
        const transactionsVerifiedForFirstTime = [
            ...pendingTransactions,
            ...passedTransactions,
        ].filter(transaction => transaction.verifiedOnce === false);
        transactionsVerifiedForFirstTime.forEach(transaction => delete transaction.verifiedOnce);
        this.emit(exports.EVENT_VERIFIED_TRANSACTION_ONCE, {
            action: exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS,
            payload: transactionsVerifiedForFirstTime,
        });
        return {
            passedTransactions,
            failedTransactions,
            pendingTransactions,
        };
    }
}
exports.TransactionPool = TransactionPool;
//# sourceMappingURL=transaction_pool.js.map