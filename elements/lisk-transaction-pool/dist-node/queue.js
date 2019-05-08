"use strict";
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
var Queue = (function () {
    function Queue() {
        this._transactions = [];
        this._index = {};
    }
    Object.defineProperty(Queue.prototype, "transactions", {
        get: function () {
            return this._transactions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Queue.prototype, "index", {
        get: function () {
            return this._index;
        },
        enumerable: true,
        configurable: true
    });
    Queue.prototype.dequeueUntil = function (condition) {
        var _this = this;
        var reduceResult = this._transactions.reduceRight(function (_a, transaction) {
            var affected = _a.affected, unaffected = _a.unaffected, conditionFailedOnce = _a.conditionFailedOnce;
            if (conditionFailedOnce || !condition(transaction)) {
                return {
                    affected: affected,
                    unaffected: __spread([transaction], unaffected),
                    conditionFailedOnce: true,
                };
            }
            delete _this._index[transaction.id];
            return {
                affected: __spread(affected, [transaction]),
                unaffected: unaffected,
                conditionFailedOnce: false,
            };
        }, {
            affected: [],
            unaffected: [],
            conditionFailedOnce: false,
        });
        this._transactions = reduceResult.unaffected;
        return reduceResult.affected;
    };
    Queue.prototype.enqueueMany = function (transactions) {
        var _this = this;
        this._transactions = __spread(transactions, this._transactions);
        transactions.forEach(function (transaction) {
            _this._index[transaction.id] = transaction;
        });
    };
    Queue.prototype.enqueueOne = function (transaction) {
        this._transactions = __spread([transaction], this._transactions);
        this._index[transaction.id] = transaction;
    };
    Queue.prototype.exists = function (id) {
        return !!this._index[id];
    };
    Queue.prototype.filter = function (condition) {
        return this._transactions.filter(condition);
    };
    Queue.prototype.peekUntil = function (condition) {
        var reduceResult = this._transactions.reduceRight(function (_a, transaction) {
            var affected = _a.affected, unaffected = _a.unaffected, conditionFailedOnce = _a.conditionFailedOnce;
            if (conditionFailedOnce || !condition(transaction)) {
                return {
                    affected: affected,
                    unaffected: unaffected,
                    conditionFailedOnce: true,
                };
            }
            return {
                affected: __spread(affected, [transaction]),
                unaffected: unaffected,
                conditionFailedOnce: false,
            };
        }, {
            affected: [],
            unaffected: [],
            conditionFailedOnce: false,
        });
        return reduceResult.affected;
    };
    Queue.prototype.removeFor = function (condition) {
        var _this = this;
        var _a = this._transactions.reduce(function (reduceObject, transaction) {
            if (condition(transaction)) {
                reduceObject.affected.push(transaction);
                delete _this._index[transaction.id];
            }
            else {
                reduceObject.unaffected.push(transaction);
            }
            return reduceObject;
        }, { unaffected: [], affected: [] }), unaffected = _a.unaffected, affected = _a.affected;
        this._transactions = unaffected;
        return affected;
    };
    Queue.prototype.size = function () {
        return this._transactions.length;
    };
    Queue.prototype.sizeBy = function (condition) {
        return this._transactions.filter(condition).length;
    };
    return Queue;
}());
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map