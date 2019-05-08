"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var check_transactions_1 = require("./check_transactions");
var job_1 = require("./job");
var queue_1 = require("./queue");
var queueCheckers = require("./queue_checkers");
var DEFAULT_PENDING_TRANSACTIONS_PROCESSING_LIMIT = 5;
var DEFAULT_EXPIRE_TRANSACTION_INTERVAL = 30000;
var DEFAULT_MAX_TRANSACTIONS_PER_QUEUE = 1000;
var DEFAULT_RECEIVED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
var DEFAULT_RECEIVED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
var DEFAULT_VALIDATED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
var DEFAULT_VALIDATED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
var DEFAULT_VERIFIED_TRANSACTIONS_PROCESSING_INTERVAL = 30000;
var DEFAULT_VERIFIED_TRANSACTIONS_LIMIT_PER_PROCESSING = 100;
exports.EVENT_ADDED_TRANSACTIONS = 'transactionsAdded';
exports.EVENT_REMOVED_TRANSACTIONS = 'transactionsRemoved';
exports.ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS = 'addVerifiedRemovedTransactions';
exports.ACTION_REMOVE_CONFIRMED_TRANSACTIONS = 'removeConfirmedTransactions';
exports.ACTION_ADD_TRANSACTIONS = 'addTransactions';
exports.ACTION_EXPIRE_TRANSACTIONS = 'expireTransactions';
exports.ACTION_PROCESS_VERIFIED_TRANSACTIONS = 'processVerifiedTransactions';
exports.ACTION_VALIDATE_RECEIVED_TRANSACTIONS = 'validateReceivedTransactions';
exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS = 'verifyValidatedTransactions';
var TransactionPool = (function (_super) {
    __extends(TransactionPool, _super);
    function TransactionPool(_a) {
        var _b = _a.expireTransactionsInterval, expireTransactionsInterval = _b === void 0 ? DEFAULT_EXPIRE_TRANSACTION_INTERVAL : _b, _c = _a.maxTransactionsPerQueue, maxTransactionsPerQueue = _c === void 0 ? DEFAULT_MAX_TRANSACTIONS_PER_QUEUE : _c, _d = _a.receivedTransactionsProcessingInterval, receivedTransactionsProcessingInterval = _d === void 0 ? DEFAULT_RECEIVED_TRANSACTIONS_PROCESSING_INTERVAL : _d, _e = _a.receivedTransactionsLimitPerProcessing, receivedTransactionsLimitPerProcessing = _e === void 0 ? DEFAULT_RECEIVED_TRANSACTIONS_LIMIT_PER_PROCESSING : _e, _f = _a.validatedTransactionsProcessingInterval, validatedTransactionsProcessingInterval = _f === void 0 ? DEFAULT_VALIDATED_TRANSACTIONS_PROCESSING_INTERVAL : _f, _g = _a.validatedTransactionsLimitPerProcessing, validatedTransactionsLimitPerProcessing = _g === void 0 ? DEFAULT_VALIDATED_TRANSACTIONS_LIMIT_PER_PROCESSING : _g, _h = _a.verifiedTransactionsProcessingInterval, verifiedTransactionsProcessingInterval = _h === void 0 ? DEFAULT_VERIFIED_TRANSACTIONS_PROCESSING_INTERVAL : _h, _j = _a.verifiedTransactionsLimitPerProcessing, verifiedTransactionsLimitPerProcessing = _j === void 0 ? DEFAULT_VERIFIED_TRANSACTIONS_LIMIT_PER_PROCESSING : _j, _k = _a.pendingTransactionsProcessingLimit, pendingTransactionsProcessingLimit = _k === void 0 ? DEFAULT_PENDING_TRANSACTIONS_PROCESSING_LIMIT : _k, validateTransactions = _a.validateTransactions, verifyTransactions = _a.verifyTransactions, processTransactions = _a.processTransactions;
        var _this = _super.call(this) || this;
        _this._maxTransactionsPerQueue = maxTransactionsPerQueue;
        _this._pendingTransactionsProcessingLimit = pendingTransactionsProcessingLimit;
        _this._queues = {
            received: new queue_1.Queue(),
            validated: new queue_1.Queue(),
            verified: new queue_1.Queue(),
            pending: new queue_1.Queue(),
            ready: new queue_1.Queue(),
        };
        _this._expireTransactionsInterval = expireTransactionsInterval;
        _this._expireTransactionsJob = new job_1.Job(_this.expireTransactions.bind(_this), _this._expireTransactionsInterval);
        _this._expireTransactionsJob.start();
        _this._receivedTransactionsProcessingInterval = receivedTransactionsProcessingInterval;
        _this._receivedTransactionsProcessingLimitPerInterval = receivedTransactionsLimitPerProcessing;
        _this._validateTransactions = validateTransactions;
        _this._validateTransactionsJob = new job_1.Job(_this.validateReceivedTransactions.bind(_this), _this._receivedTransactionsProcessingInterval);
        _this._validateTransactionsJob.start();
        _this._validatedTransactionsProcessingInterval = validatedTransactionsProcessingInterval;
        _this._validatedTransactionsProcessingLimitPerInterval = validatedTransactionsLimitPerProcessing;
        _this._verifyTransactions = verifyTransactions;
        _this._verifyTransactionsJob = new job_1.Job(_this.verifyValidatedTransactions.bind(_this), _this._validatedTransactionsProcessingInterval);
        _this._verifyTransactionsJob.start();
        _this._verifiedTransactionsProcessingInterval = verifiedTransactionsProcessingInterval;
        _this._verifiedTransactionsProcessingLimitPerInterval = verifiedTransactionsLimitPerProcessing;
        _this._processTransactions = processTransactions;
        _this._processTransactionsJob = new job_1.Job(_this.processVerifiedTransactions.bind(_this), _this._verifiedTransactionsProcessingInterval);
        _this._processTransactionsJob.start();
        return _this;
    }
    TransactionPool.prototype.cleanup = function () {
        this.removeTransactionsFromQueues(Object.keys(this.queues), queueCheckers.returnTrueUntilLimit(this._maxTransactionsPerQueue));
        this._expireTransactionsJob.stop();
        this._validateTransactionsJob.stop();
        this._verifyTransactionsJob.stop();
        this._processTransactionsJob.stop();
    };
    TransactionPool.prototype.addTransaction = function (transaction) {
        var receivedQueue = 'received';
        return this.addTransactionToQueue(receivedQueue, transaction);
    };
    TransactionPool.prototype.addPendingTransaction = function (transaction) {
        var pendingQueue = 'pending';
        return this.addTransactionToQueue(pendingQueue, transaction);
    };
    TransactionPool.prototype.addVerifiedTransaction = function (transaction) {
        var verifiedQueue = 'verified';
        return this.addTransactionToQueue(verifiedQueue, transaction);
    };
    TransactionPool.prototype.addVerifiedRemovedTransactions = function (transactions) {
        var _a = this._queues, received = _a.received, validated = _a.validated, otherQueues = __rest(_a, ["received", "validated"]);
        var removedTransactionsByRecipientIdFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForSenderIdWithRecipientIds(transactions));
        this._queues.received.enqueueMany(removedTransactionsByRecipientIdFromValidatedQueue);
        var removedTransactionsByRecipientIdFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForSenderIdWithRecipientIds(transactions));
        this._queues.validated.enqueueMany(removedTransactionsByRecipientIdFromOtherQueues);
        this._queues.verified.enqueueMany(transactions);
        this.emit(exports.EVENT_ADDED_TRANSACTIONS, {
            action: exports.ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS,
            to: 'verified',
            payload: transactions,
        });
    };
    TransactionPool.prototype.addVerifiedSignature = function (signatureObject) {
        var transaction = this.findInTransactionPool(signatureObject.transactionId);
        if (transaction) {
            return transaction.addVerifiedSignature(signatureObject.signature);
        }
        return {
            id: signatureObject.transactionId,
            status: check_transactions_1.Status.FAIL,
            errors: [new Error('Could not find transaction in transaction pool')],
        };
    };
    TransactionPool.prototype.existsInTransactionPool = function (id) {
        var _this = this;
        return Object.keys(this._queues).reduce(function (previousValue, queueName) {
            return previousValue || _this._queues[queueName].exists(id);
        }, false);
    };
    TransactionPool.prototype.findInTransactionPool = function (id) {
        var _this = this;
        return Object.keys(this._queues).reduce(function (previousValue, queueName) {
            return previousValue || _this._queues[queueName].index[id];
        }, undefined);
    };
    Object.defineProperty(TransactionPool.prototype, "queues", {
        get: function () {
            return this._queues;
        },
        enumerable: true,
        configurable: true
    });
    TransactionPool.prototype.getProcessableTransactions = function (limit) {
        return this._queues.ready.peekUntil(queueCheckers.returnTrueUntilLimit(limit));
    };
    TransactionPool.prototype.removeConfirmedTransactions = function (transactions) {
        var removedTransactions = this.removeTransactionsFromQueues(Object.keys(this._queues), queueCheckers.checkTransactionForId(transactions));
        var _a = this._queues, received = _a.received, validated = _a.validated, otherQueues = __rest(_a, ["received", "validated"]);
        var confirmedTransactionsWithUniqueData = transactions.filter(function (transaction) { return transaction.containsUniqueData; });
        var removedTransactionsBySenderPublicKeysFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForSenderPublicKey(transactions));
        var removedTransactionsByTypesFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionForTypes(confirmedTransactionsWithUniqueData));
        this._queues.received.enqueueMany(__spread(removedTransactionsBySenderPublicKeysFromValidatedQueue, removedTransactionsByTypesFromValidatedQueue));
        var removedTransactionsBySenderPublicKeysFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForSenderPublicKey(transactions));
        var removedTransactionsByTypesFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForTypes(confirmedTransactionsWithUniqueData));
        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
            action: exports.ACTION_REMOVE_CONFIRMED_TRANSACTIONS,
            payload: removedTransactions,
        });
        this._queues.validated.enqueueMany(__spread(removedTransactionsBySenderPublicKeysFromOtherQueues, removedTransactionsByTypesFromOtherQueues));
    };
    TransactionPool.prototype.reverifyTransactionsFromSenders = function (senderPublicKeys) {
        var _a = this._queues, received = _a.received, validated = _a.validated, otherQueues = __rest(_a, ["received", "validated"]);
        var senderProperty = 'senderPublicKey';
        var removedTransactionsBySenderPublicKeysFromValidatedQueue = this._queues.validated.removeFor(queueCheckers.checkTransactionPropertyForValues(senderPublicKeys, senderProperty));
        this._queues.received.enqueueMany(removedTransactionsBySenderPublicKeysFromValidatedQueue);
        var removedTransactionsBySenderPublicKeysFromOtherQueues = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionPropertyForValues(senderPublicKeys, senderProperty));
        this._queues.validated.enqueueMany(removedTransactionsBySenderPublicKeysFromOtherQueues);
    };
    TransactionPool.prototype.validateTransactionAgainstTransactionsInPool = function (transaction) {
        return transaction.verifyAgainstOtherTransactions(__spread(this.queues.ready.transactions, this.queues.pending.transactions, this.queues.verified.transactions));
    };
    TransactionPool.prototype.addTransactionToQueue = function (queueName, transaction) {
        if (this.existsInTransactionPool(transaction.id)) {
            return {
                isFull: false,
                alreadyExists: true,
                queueName: queueName,
            };
        }
        if (this._queues[queueName].size() >= this._maxTransactionsPerQueue) {
            return {
                isFull: true,
                alreadyExists: false,
                queueName: queueName,
            };
        }
        transaction.receivedAt = new Date();
        this._queues[queueName].enqueueOne(transaction);
        this.emit(exports.EVENT_ADDED_TRANSACTIONS, {
            action: exports.ACTION_ADD_TRANSACTIONS,
            to: queueName,
            payload: [transaction],
        });
        return {
            isFull: false,
            alreadyExists: false,
            queueName: queueName,
        };
    };
    TransactionPool.prototype.expireTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var expiredTransactions;
            return __generator(this, function (_a) {
                expiredTransactions = this.removeTransactionsFromQueues(Object.keys(this._queues), queueCheckers.checkTransactionForExpiry());
                this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
                    action: exports.ACTION_EXPIRE_TRANSACTIONS,
                    payload: expiredTransactions,
                });
                return [2, expiredTransactions];
            });
        });
    };
    TransactionPool.prototype.processVerifiedTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transactionsInReadyQueue, transactionsInVerifiedQueue, processableTransactionsInPendingQueue, additionalTransactionsToProcessLimit, transactionsFromPendingQueueLimit, transactionsFromPendingQueue, additionalVerifiedTransactionsToProcessLimit, transactionsFromVerifiedQueue, transactionsFromReadyQueue, toProcessTransactions, _a, passedTransactions, failedTransactions, _b, received, validated, otherQueues, removedTransactions;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        transactionsInReadyQueue = this._queues.ready.size();
                        transactionsInVerifiedQueue = this._queues.verified.size();
                        processableTransactionsInPendingQueue = this._queues.pending.sizeBy(function (transaction) { return transaction.isReady(); });
                        if (transactionsInReadyQueue >=
                            this._verifiedTransactionsProcessingLimitPerInterval ||
                            (transactionsInVerifiedQueue === 0 &&
                                processableTransactionsInPendingQueue === 0)) {
                            return [2, {
                                    passedTransactions: [],
                                    failedTransactions: [],
                                }];
                        }
                        additionalTransactionsToProcessLimit = this._verifiedTransactionsProcessingLimitPerInterval -
                            transactionsInReadyQueue;
                        transactionsFromPendingQueueLimit = Math.min(additionalTransactionsToProcessLimit, this._pendingTransactionsProcessingLimit);
                        transactionsFromPendingQueue = this._queues.pending
                            .filter(function (transaction) { return transaction.isReady(); })
                            .slice(0, transactionsFromPendingQueueLimit);
                        additionalVerifiedTransactionsToProcessLimit = additionalTransactionsToProcessLimit -
                            transactionsFromPendingQueue.length;
                        transactionsFromVerifiedQueue = this._queues.verified.peekUntil(queueCheckers.returnTrueUntilLimit(additionalVerifiedTransactionsToProcessLimit));
                        transactionsFromReadyQueue = this._queues.ready.peekUntil(queueCheckers.returnTrueUntilLimit(transactionsInReadyQueue));
                        toProcessTransactions = __spread(transactionsFromReadyQueue, transactionsFromPendingQueue, transactionsFromVerifiedQueue);
                        return [4, check_transactions_1.checkTransactionsWithPassAndFail(toProcessTransactions, this._processTransactions)];
                    case 1:
                        _a = _c.sent(), passedTransactions = _a.passedTransactions, failedTransactions = _a.failedTransactions;
                        _b = this._queues, received = _b.received, validated = _b.validated, otherQueues = __rest(_b, ["received", "validated"]);
                        removedTransactions = this.removeTransactionsFromQueues(Object.keys(otherQueues), queueCheckers.checkTransactionForId(failedTransactions));
                        this._queues.ready.enqueueMany(this._queues.ready.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
                        this._queues.ready.enqueueMany(this._queues.verified.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
                        this._queues.ready.enqueueMany(this._queues.pending.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
                        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
                            action: exports.ACTION_PROCESS_VERIFIED_TRANSACTIONS,
                            payload: removedTransactions,
                        });
                        return [2, {
                                passedTransactions: passedTransactions,
                                failedTransactions: failedTransactions,
                            }];
                }
            });
        });
    };
    TransactionPool.prototype.removeTransactionsFromQueues = function (queueNames, condition) {
        var _this = this;
        return queueNames
            .map(function (queueName) { return _this._queues[queueName].removeFor(condition); })
            .reduce(function (transactionsAccumulatedFromQueues, transactionsFromCurrentQueue) {
            return transactionsAccumulatedFromQueues.concat(transactionsFromCurrentQueue);
        }, []);
    };
    TransactionPool.prototype.validateReceivedTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toValidateTransactions, _a, passedTransactions, failedTransactions, removedTransactions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.queues.validated.size() >= this._maxTransactionsPerQueue ||
                            this.queues.received.size() === 0) {
                            return [2, {
                                    passedTransactions: [],
                                    failedTransactions: [],
                                }];
                        }
                        toValidateTransactions = this._queues.received.peekUntil(queueCheckers.returnTrueUntilLimit(this._receivedTransactionsProcessingLimitPerInterval));
                        return [4, check_transactions_1.checkTransactionsWithPassAndFail(toValidateTransactions, this._validateTransactions)];
                    case 1:
                        _a = _b.sent(), passedTransactions = _a.passedTransactions, failedTransactions = _a.failedTransactions;
                        removedTransactions = this._queues.received.removeFor(queueCheckers.checkTransactionForId(failedTransactions));
                        this._queues.validated.enqueueMany(this._queues.received.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
                        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
                            action: exports.ACTION_VALIDATE_RECEIVED_TRANSACTIONS,
                            payload: removedTransactions,
                        });
                        return [2, {
                                passedTransactions: passedTransactions,
                                failedTransactions: failedTransactions,
                            }];
                }
            });
        });
    };
    TransactionPool.prototype.verifyValidatedTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toVerifyTransactions, _a, failedTransactions, pendingTransactions, passedTransactions, removedTransactions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.queues.verified.size() >= this._maxTransactionsPerQueue ||
                            this.queues.validated.size() === 0) {
                            return [2, {
                                    passedTransactions: [],
                                    failedTransactions: [],
                                    pendingTransactions: [],
                                }];
                        }
                        toVerifyTransactions = this._queues.validated.peekUntil(queueCheckers.returnTrueUntilLimit(this._validatedTransactionsProcessingLimitPerInterval));
                        return [4, check_transactions_1.checkTransactionsWithPassFailAndPending(toVerifyTransactions, this._verifyTransactions)];
                    case 1:
                        _a = _b.sent(), failedTransactions = _a.failedTransactions, pendingTransactions = _a.pendingTransactions, passedTransactions = _a.passedTransactions;
                        removedTransactions = this._queues.validated.removeFor(queueCheckers.checkTransactionForId(failedTransactions));
                        this._queues.verified.enqueueMany(this._queues.validated.removeFor(queueCheckers.checkTransactionForId(passedTransactions)));
                        this._queues.pending.enqueueMany(this._queues.validated.removeFor(queueCheckers.checkTransactionForId(pendingTransactions)));
                        this.emit(exports.EVENT_REMOVED_TRANSACTIONS, {
                            action: exports.ACTION_VERIFY_VALIDATED_TRANSACTIONS,
                            payload: removedTransactions,
                        });
                        return [2, {
                                passedTransactions: passedTransactions,
                                failedTransactions: failedTransactions,
                                pendingTransactions: pendingTransactions,
                            }];
                }
            });
        });
    };
    return TransactionPool;
}(events_1.EventEmitter));
exports.TransactionPool = TransactionPool;
//# sourceMappingURL=transaction_pool.js.map