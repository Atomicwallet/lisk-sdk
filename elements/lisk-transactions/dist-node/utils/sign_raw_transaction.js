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
var prepare_transaction_1 = require("./prepare_transaction");
var time_1 = require("./time");
exports.signRawTransaction = function (_a) {
    var transaction = _a.transaction, passphrase = _a.passphrase, secondPassphrase = _a.secondPassphrase, timeOffset = _a.timeOffset;
    var _b = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase), publicKey = _b.publicKey, address = _b.address;
    var senderSecondPublicKey = secondPassphrase
        ? cryptography.getPrivateAndPublicKeyFromPassphrase(secondPassphrase)
            .publicKey
        : undefined;
    var propertiesToAdd = {
        senderPublicKey: publicKey,
        senderSecondPublicKey: senderSecondPublicKey,
        senderId: address,
        timestamp: time_1.getTimeWithOffset(timeOffset),
    };
    var transactionWithProperties = __assign({}, transaction, propertiesToAdd);
    return prepare_transaction_1.prepareTransaction(transactionWithProperties, passphrase, secondPassphrase);
};
//# sourceMappingURL=sign_raw_transaction.js.map