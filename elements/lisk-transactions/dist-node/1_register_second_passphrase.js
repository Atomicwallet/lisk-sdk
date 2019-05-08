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
var _1_second_signature_transaction_1 = require("./1_second_signature_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var secondPassphrase = _a.secondPassphrase;
    if (typeof secondPassphrase !== 'string') {
        throw new Error('Please provide a secondPassphrase. Expected string.');
    }
};
exports.registerSecondPassphrase = function (inputs) {
    validateInputs(inputs);
    var passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase;
    var publicKey = lisk_cryptography_1.getKeys(secondPassphrase).publicKey;
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { type: 1, fee: constants_1.SIGNATURE_FEE.toString(), asset: { signature: { publicKey: publicKey } } });
    if (!passphrase) {
        return transaction;
    }
    var secondSignatureTransaction = new _1_second_signature_transaction_1.SecondSignatureTransaction(transaction);
    secondSignatureTransaction.sign(passphrase);
    return secondSignatureTransaction.toJSON();
};
//# sourceMappingURL=1_register_second_passphrase.js.map