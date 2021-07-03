"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor() {
        this._transactions = [];
        this._index = {};
    }
    get transactions() {
        return this._transactions;
    }
    get index() {
        return this._index;
    }
    dequeueUntil(condition) {
        const reduceResult = this._transactions.reduceRight(({ affected, unaffected, conditionFailedOnce }, transaction) => {
            if (conditionFailedOnce || !condition(transaction)) {
                return {
                    affected,
                    unaffected: [transaction, ...unaffected],
                    conditionFailedOnce: true,
                };
            }
            delete this._index[transaction.id];
            return {
                affected: [...affected, transaction],
                unaffected,
                conditionFailedOnce: false,
            };
        }, {
            affected: [],
            unaffected: [],
            conditionFailedOnce: false,
        });
        this._transactions = reduceResult.unaffected;
        return reduceResult.affected;
    }
    enqueueMany(transactions) {
        this._transactions = [...transactions, ...this._transactions];
        transactions.forEach((transaction) => {
            this._index[transaction.id] = transaction;
        });
    }
    enqueueOne(transaction) {
        this._transactions = [transaction, ...this._transactions];
        this._index[transaction.id] = transaction;
    }
    exists(id) {
        return !!this._index[id];
    }
    filter(condition) {
        return this._transactions.filter(condition);
    }
    peekUntil(condition) {
        const reduceResult = this._transactions.reduceRight(({ affected, unaffected, conditionFailedOnce }, transaction) => {
            if (conditionFailedOnce || !condition(transaction)) {
                return {
                    affected,
                    unaffected,
                    conditionFailedOnce: true,
                };
            }
            return {
                affected: [...affected, transaction],
                unaffected,
                conditionFailedOnce: false,
            };
        }, {
            affected: [],
            unaffected: [],
            conditionFailedOnce: false,
        });
        return reduceResult.affected;
    }
    removeFor(condition) {
        const { unaffected, affected } = this._transactions.reduce((reduceObject, transaction) => {
            if (condition(transaction)) {
                reduceObject.affected.push(transaction);
                delete this._index[transaction.id];
            }
            else {
                reduceObject.unaffected.push(transaction);
            }
            return reduceObject;
        }, { unaffected: [], affected: [] });
        this._transactions = unaffected;
        return affected;
    }
    size() {
        return this._transactions.length;
    }
    sizeBy(condition) {
        return this._transactions.filter(condition).length;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map