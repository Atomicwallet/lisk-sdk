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
exports.DelegateTransaction = exports.delegateAssetFormatSchema = void 0;
const base_transaction_1 = require("./base_transaction");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const TRANSACTION_DELEGATE_TYPE = 2;
exports.delegateAssetFormatSchema = {
    type: 'object',
    required: ['delegate'],
    properties: {
        delegate: {
            type: 'object',
            required: ['username'],
            properties: {
                username: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 20,
                    format: 'username',
                },
            },
        },
    },
};
class DelegateTransaction extends base_transaction_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.asset = (tx.asset || { delegate: {} });
        this.containsUniqueData = true;
    }
    assetToBytes() {
        const { delegate: { username }, } = this.asset;
        return Buffer.from(username, 'utf8');
    }
    assetToJSON() {
        return this.asset;
    }
    async prepare(store) {
        await store.account.cache([
            {
                address: this.senderId,
            },
            {
                username: this.asset.delegate.username,
            },
        ]);
    }
    verifyAgainstTransactions(transactions) {
        return transactions
            .filter(tx => tx.type === this.type && tx.senderPublicKey === this.senderPublicKey)
            .map(tx => new errors_1.TransactionError('Register delegate only allowed once per account.', tx.id, '.asset.delegate'));
    }
    validateAsset() {
        utils_1.validator.validate(exports.delegateAssetFormatSchema, this.asset);
        const errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_DELEGATE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_DELEGATE_TYPE));
        }
        if (!this.amount.eq(0)) {
            errors.push(new errors_1.TransactionError('Amount must be zero for delegate registration transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (!this.fee.eq(constants_1.DELEGATE_FEE)) {
            errors.push(new errors_1.TransactionError(`Fee must be equal to ${constants_1.DELEGATE_FEE}`, this.id, '.fee', this.fee.toString(), constants_1.DELEGATE_FEE));
        }
        if (this.recipientId) {
            errors.push(new errors_1.TransactionError('RecipientId is expected to be undefined', this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey) {
            errors.push(new errors_1.TransactionError('Invalid recipientPublicKey', this.id, '.recipientPublicKey'));
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        const usernameExists = store.account.find((account) => account.username === this.asset.delegate.username);
        if (usernameExists) {
            errors.push(new errors_1.TransactionError(`Username is not unique.`, this.id, '.asset.delegate.username'));
        }
        if (sender.isDelegate || sender.username) {
            errors.push(new errors_1.TransactionError('Account is already a delegate', this.id, '.asset.delegate.username'));
        }
        const updatedSender = Object.assign(Object.assign({}, sender), { username: this.asset.delegate.username, vote: 0, isDelegate: 1 });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    }
    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        const { username } = sender, strippedSender = __rest(sender, ["username"]);
        const resetSender = Object.assign(Object.assign({}, sender), { username: null, vote: 0, isDelegate: 0 });
        store.account.set(strippedSender.address, resetSender);
        return [];
    }
    assetFromSync(raw) {
        if (!raw.d_username) {
            return undefined;
        }
        const delegate = {
            username: raw.d_username,
            publicKey: raw.t_senderPublicKey,
            address: raw.t_senderId,
        };
        return { delegate };
    }
}
exports.DelegateTransaction = DelegateTransaction;
//# sourceMappingURL=2_delegate_transaction.js.map