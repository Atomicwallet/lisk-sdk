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
var cryptography = require("@liskhq/lisk-cryptography");
var sign_and_validate_1 = require("./sign_and_validate");
var time_1 = require("./time");
var transaction_id_1 = require("./transaction_id");
var validTransaction = function (partial) { return partial.type !== undefined; };
exports.prepareTransaction = function (partialTransaction, passphrase, secondPassphrase, timeOffset) {
    var senderPublicKey = passphrase
        ? cryptography.getKeys(passphrase).publicKey
        : undefined;
    var timestamp = time_1.getTimeWithOffset(timeOffset);
    var transaction = __assign({ amount: '0', recipientId: '', senderPublicKey: senderPublicKey,
        timestamp: timestamp }, partialTransaction);
    if (!validTransaction(transaction)) {
        throw new Error('Invalid transaction to process');
    }
    if (!passphrase) {
        return transaction;
    }
    var singleSignedTransaction = __assign({}, transaction, { signature: sign_and_validate_1.signTransaction(transaction, passphrase) });
    var signedTransaction = typeof secondPassphrase === 'string' && transaction.type !== 1
        ? sign_and_validate_1.secondSignTransaction(singleSignedTransaction, secondPassphrase)
        : singleSignedTransaction;
    var transactionWithId = __assign({}, signedTransaction, { id: transaction_id_1.getTransactionId(signedTransaction) });
    return transactionWithId;
};
//# sourceMappingURL=prepare_transaction.js.map