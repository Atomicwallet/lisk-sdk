"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var _0_transfer_transaction_1 = require("./0_transfer_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var amount = _a.amount, recipientId = _a.recipientId, recipientPublicKey = _a.recipientPublicKey, data = _a.data;
    if (!utils_1.validateTransferAmount(amount)) {
        throw new Error('Amount must be a valid number in string format.');
    }
    if (!recipientId && !recipientPublicKey) {
        throw new Error('Either recipientId or recipientPublicKey must be provided.');
    }
    if (typeof recipientId !== 'undefined') {
        utils_1.validateAddress(recipientId);
    }
    if (typeof recipientPublicKey !== 'undefined') {
        utils_1.validatePublicKey(recipientPublicKey);
    }
    if (recipientId &&
        recipientPublicKey &&
        recipientId !== lisk_cryptography_1.getAddressFromPublicKey(recipientPublicKey)) {
        throw new Error('recipientId does not match recipientPublicKey.');
    }
    if (data && data.length > 0) {
        if (typeof data !== 'string') {
            throw new Error('Invalid encoding in transaction data. Data must be utf-8 encoded string.');
        }
        if (data.length > constants_1.BYTESIZES.DATA) {
            throw new Error('Transaction data field cannot exceed 64 bytes.');
        }
    }
};
exports.transfer = function (inputs) {
    validateInputs(inputs);
    var data = inputs.data, amount = inputs.amount, recipientPublicKey = inputs.recipientPublicKey, passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase;
    var recipientIdFromPublicKey = recipientPublicKey
        ? lisk_cryptography_1.getAddressFromPublicKey(recipientPublicKey)
        : undefined;
    var recipientId = inputs.recipientId
        ? inputs.recipientId
        : recipientIdFromPublicKey;
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { asset: data ? { data: data } : {}, amount: amount, fee: constants_1.TRANSFER_FEE.toString(), recipientId: recipientId, recipientPublicKey: recipientPublicKey, type: 0 });
    if (!passphrase) {
        return transaction;
    }
    var transactionWithSenderInfo = __assign({}, transaction, { recipientId: recipientId, senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey });
    var transferTransaction = new _0_transfer_transaction_1.TransferTransaction(transactionWithSenderInfo);
    transferTransaction.sign(passphrase, secondPassphrase);
    return transferTransaction.toJSON();
};
//# sourceMappingURL=0_transfer.js.map