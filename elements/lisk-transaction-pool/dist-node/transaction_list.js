"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionList = exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const DEFAULT_MAX_SIZE = 64;
exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE = BigInt(10);
class TransactionList {
    constructor(address, options) {
        var _a, _b;
        this.address = address;
        this._transactions = {};
        this._nonceHeap = new lisk_utils_1.dataStructures.MinHeap();
        this._processable = [];
        this._maxSize = (_a = options === null || options === void 0 ? void 0 : options.maxSize) !== null && _a !== void 0 ? _a : DEFAULT_MAX_SIZE;
        this._minReplacementFeeDifference =
            (_b = options === null || options === void 0 ? void 0 : options.minReplacementFeeDifference) !== null && _b !== void 0 ? _b : exports.DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE;
    }
    get(nonce) {
        return this._transactions[nonce.toString()];
    }
    add(incomingTx, processable = false) {
        const existingTx = this._transactions[incomingTx.nonce.toString()];
        if (existingTx) {
            if (incomingTx.fee < existingTx.fee + this._minReplacementFeeDifference) {
                return {
                    added: false,
                    reason: 'Incoming transaction fee is not sufficient to replace existing transaction',
                };
            }
            this._demoteAfter(incomingTx.nonce);
            this._transactions[incomingTx.nonce.toString()] = incomingTx;
            return { added: true, removedID: existingTx.id };
        }
        const highestNonce = this._highestNonce();
        let removedID;
        if (this._nonceHeap.count >= this._maxSize) {
            if (incomingTx.nonce > highestNonce) {
                return {
                    added: false,
                    reason: 'Incoming transaction exceeds maximum transaction limit per account',
                };
            }
            removedID = this.remove(highestNonce);
        }
        this._transactions[incomingTx.nonce.toString()] = incomingTx;
        this._nonceHeap.push(incomingTx.nonce, undefined);
        if (processable && this._processable.length === 0) {
            this._processable.push(incomingTx.nonce);
        }
        return { added: true, removedID };
    }
    remove(nonce) {
        const removingTx = this._transactions[nonce.toString()];
        if (!removingTx) {
            return undefined;
        }
        delete this._transactions[nonce.toString()];
        const { keys } = this._nonceHeap;
        this._nonceHeap.clear();
        for (const key of keys) {
            if (key !== nonce) {
                this._nonceHeap.push(key, undefined);
            }
        }
        this._demoteAfter(nonce);
        return removingTx.id;
    }
    promote(txs) {
        const promotingNonces = [];
        for (const tx of txs) {
            const promotingTx = this._transactions[tx.nonce.toString()];
            if (!promotingTx) {
                return false;
            }
            if (tx.id !== promotingTx.id) {
                return false;
            }
            promotingNonces.push(tx.nonce);
        }
        this._processable = Array.from(new Set([...this._processable, ...promotingNonces]));
        this._sortProcessable();
        return true;
    }
    get size() {
        return this._nonceHeap.count;
    }
    getProcessable() {
        const txs = [];
        for (const nonce of this._processable) {
            txs.push(this._transactions[nonce.toString()]);
        }
        return txs;
    }
    getUnprocessable() {
        if (this._nonceHeap.count === 0) {
            return [];
        }
        if (this._processable.length === this._nonceHeap.count) {
            return [];
        }
        const clonedHeap = this._nonceHeap.clone();
        for (const _ of this._processable) {
            clonedHeap.pop();
        }
        const remainingCount = clonedHeap.count;
        const unprocessableTx = [];
        for (let i = 0; i < remainingCount; i += 1) {
            const { key } = clonedHeap.pop();
            unprocessableTx.push(this._transactions[key.toString()]);
        }
        return unprocessableTx;
    }
    getPromotable() {
        if (this._nonceHeap.count === 0) {
            return [];
        }
        if (this._processable.length === this._nonceHeap.count) {
            return [];
        }
        const clonedHeap = this._nonceHeap.clone();
        for (const _ of this._processable) {
            clonedHeap.pop();
        }
        const firstUnprocessable = clonedHeap.pop();
        if (!firstUnprocessable) {
            return [];
        }
        if (this._processable.length !== 0) {
            const highestProcessableNonce = this._processable[this._processable.length - 1];
            if (firstUnprocessable.key !== highestProcessableNonce + BigInt(1)) {
                return [];
            }
        }
        const promotableTx = [this._transactions[firstUnprocessable.key.toString()]];
        const remainingNonces = clonedHeap.count;
        let lastPromotedNonce = this._transactions[firstUnprocessable.key.toString()].nonce;
        for (let i = 0; i < remainingNonces; i += 1) {
            const { key } = clonedHeap.pop();
            if (lastPromotedNonce + BigInt(1) === key) {
                promotableTx.push(this._transactions[key.toString()]);
                lastPromotedNonce = this._transactions[key.toString()].nonce;
            }
        }
        return promotableTx;
    }
    _demoteAfter(nonce) {
        this._processable = this._processable.filter(processableNonce => processableNonce < nonce);
        this._sortProcessable();
    }
    _highestNonce() {
        const highestNonce = BigInt(-1);
        const { keys } = this._nonceHeap;
        if (!keys) {
            return highestNonce;
        }
        return keys.reduce((prev, current) => {
            if (current > prev) {
                return current;
            }
            return prev;
        }, highestNonce);
    }
    _sortProcessable() {
        this._processable.sort((a, b) => {
            if (a - b > BigInt(0)) {
                return 1;
            }
            if (a - b < BigInt(0)) {
                return -1;
            }
            return 0;
        });
    }
}
exports.TransactionList = TransactionList;
//# sourceMappingURL=transaction_list.js.map