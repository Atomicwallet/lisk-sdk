"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var base_transaction_1 = require("../base_transaction");
var errors_1 = require("../errors");
var format_1 = require("../utils/format");
var sign_and_validate_1 = require("./sign_and_validate");
exports.verifySenderPublicKey = function (id, sender, publicKey) {
    return sender.publicKey && sender.publicKey !== publicKey
        ? new errors_1.TransactionError('Invalid sender publicKey', id, '.senderPublicKey', publicKey, sender.publicKey)
        : undefined;
};
exports.verifySenderId = function (id, sender, address) {
    return sender.address.toUpperCase() !== address.toUpperCase()
        ? new errors_1.TransactionError('Invalid sender address', id, '.senderId', address.toUpperCase(), sender.address.toUpperCase())
        : undefined;
};
exports.verifyBalance = function (id, account, amount) {
    return new BigNum(account.balance).lt(new BigNum(amount))
        ? new errors_1.TransactionError("Account does not have enough LSK: " + account.address + ", balance: " + format_1.convertBeddowsToLSK(account.balance.toString()), id, '.balance', account.balance, format_1.convertBeddowsToLSK(account.balance.toString()))
        : undefined;
};
exports.verifyAmountBalance = function (id, account, amount, fee) {
    var balance = new BigNum(account.balance);
    if (balance.gte(0) && balance.lt(new BigNum(amount))) {
        return new errors_1.TransactionError("Account does not have enough LSK: " + account.address + ", balance: " + format_1.convertBeddowsToLSK(balance.plus(fee).toString()), id, '.balance');
    }
    return undefined;
};
exports.verifySecondSignature = function (id, sender, signSignature, transactionBytes) {
    if (!sender.secondPublicKey && signSignature) {
        return new errors_1.TransactionError('Sender does not have a secondPublicKey', id, '.signSignature');
    }
    if (!sender.secondPublicKey) {
        return undefined;
    }
    if (!signSignature) {
        return new errors_1.TransactionError('Missing signSignature', id, '.signSignature');
    }
    var _a = sign_and_validate_1.validateSignature(sender.secondPublicKey, signSignature, transactionBytes, id), valid = _a.valid, error = _a.error;
    if (valid) {
        return undefined;
    }
    return error;
};
var isMultisignatureAccount = function (account) {
    return !!(account.membersPublicKeys &&
        account.membersPublicKeys.length > 0 &&
        account.multiMin);
};
exports.verifyMultiSignatures = function (id, sender, signatures, transactionBytes) {
    if (!isMultisignatureAccount(sender) && signatures.length > 0) {
        return {
            status: base_transaction_1.MultisignatureStatus.FAIL,
            errors: [
                new errors_1.TransactionError('Sender is not a multisignature account', id, '.signatures'),
            ],
        };
    }
    if (!isMultisignatureAccount(sender)) {
        return {
            status: base_transaction_1.MultisignatureStatus.NONMULTISIGNATURE,
            errors: [],
        };
    }
    var _a = sign_and_validate_1.validateMultisignatures(sender.membersPublicKeys, signatures, sender.multiMin, transactionBytes, id), valid = _a.valid, errors = _a.errors;
    if (valid) {
        return {
            status: base_transaction_1.MultisignatureStatus.READY,
            errors: [],
        };
    }
    if (errors &&
        errors.length === 1 &&
        errors[0] instanceof errors_1.TransactionPendingError) {
        return {
            status: base_transaction_1.MultisignatureStatus.PENDING,
            errors: errors,
        };
    }
    return {
        status: base_transaction_1.MultisignatureStatus.FAIL,
        errors: errors || [],
    };
};
//# sourceMappingURL=verify.js.map