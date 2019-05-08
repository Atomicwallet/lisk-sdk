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
var cryptography = require("@liskhq/lisk-cryptography");
var errors_1 = require("../errors");
var get_transaction_hash_1 = require("./get_transaction_hash");
exports.multiSignTransaction = function (transaction, passphrase) {
    var signature = transaction.signature, signSignature = transaction.signSignature, transactionToSign = __rest(transaction, ["signature", "signSignature"]);
    var transactionHash = get_transaction_hash_1.getTransactionHash(transactionToSign);
    return cryptography.signData(transactionHash, passphrase);
};
exports.validateSignature = function (publicKey, signature, transactionBytes, id) {
    var transactionHash = cryptography.hash(transactionBytes);
    var valid = cryptography.verifyData(transactionHash, signature, publicKey);
    return {
        valid: valid,
        error: !valid
            ? new errors_1.TransactionError("Failed to validate signature " + signature, id, '.signature')
            : undefined,
    };
};
exports.signaturesAreUnique = function (signatures) {
    var uniqueSignatures = __spread(new Set(signatures));
    if (uniqueSignatures.length !== signatures.length) {
        return false;
    }
    return true;
};
exports.checkPublicKeySignatureUniqueness = function (publicKeys, signatures, transactionBytes, id) {
    var checkedPublicKeys = new Set();
    var validSignatures = new Set();
    publicKeys.forEach(function (publicKey) {
        signatures.forEach(function (signature) {
            if (checkedPublicKeys.has(publicKey) || validSignatures.has(signature)) {
                return;
            }
            var signatureValid = exports.validateSignature(publicKey, signature, transactionBytes, id).valid;
            if (signatureValid) {
                checkedPublicKeys.add(publicKey);
                validSignatures.add(signature);
            }
        });
    });
    return validSignatures;
};
exports.validateMultisignatures = function (publicKeys, signatures, minimumValidations, transactionBytes, id) {
    if (!exports.signaturesAreUnique(signatures)) {
        return {
            valid: false,
            errors: [
                new errors_1.TransactionError('Encountered duplicate signature in transaction', id, '.signatures'),
            ],
        };
    }
    var validSignatures = exports.checkPublicKeySignatureUniqueness(publicKeys, signatures, transactionBytes, id);
    var invalidTransactionSignatures = signatures.filter(function (signature) { return !validSignatures.has(signature); });
    if (signatures.length < minimumValidations) {
        return {
            valid: false,
            errors: [
                new errors_1.TransactionPendingError("Missing signatures", id, '.signatures'),
            ],
        };
    }
    return {
        valid: validSignatures.size >= minimumValidations &&
            invalidTransactionSignatures.length === 0,
        errors: invalidTransactionSignatures.length > 0
            ? invalidTransactionSignatures.map(function (signature) {
                return new errors_1.TransactionError("Failed to validate signature " + signature, id, '.signatures');
            })
            : [],
    };
};
exports.signTransaction = function (transaction, passphrase) {
    var transactionHash = get_transaction_hash_1.getTransactionHash(transaction);
    return cryptography.signData(transactionHash, passphrase);
};
exports.secondSignTransaction = function (transaction, secondPassphrase) { return (__assign({}, transaction, { signSignature: exports.signTransaction(transaction, secondPassphrase) })); };
exports.verifyTransaction = function (transaction, secondPublicKey) {
    if (!transaction.signature) {
        throw new Error('Cannot verify transaction without signature.');
    }
    if (!!transaction.signSignature && !secondPublicKey) {
        throw new Error('Cannot verify signSignature without secondPublicKey.');
    }
    var signature = transaction.signature, signSignature = transaction.signSignature, transactionWithoutSignatures = __rest(transaction, ["signature", "signSignature"]);
    var transactionWithoutSignature = !!transaction.signSignature
        ? __assign({}, transactionWithoutSignatures, { signature: signature }) : transactionWithoutSignatures;
    var transactionHash = get_transaction_hash_1.getTransactionHash(transactionWithoutSignature);
    var publicKey = !!transaction.signSignature && secondPublicKey
        ? secondPublicKey
        : transaction.senderPublicKey;
    var lastSignature = transaction.signSignature
        ? transaction.signSignature
        : transaction.signature;
    var verified = cryptography.verifyData(transactionHash, lastSignature, publicKey);
    return !!transaction.signSignature
        ? verified && exports.verifyTransaction(transactionWithoutSignature)
        : verified;
};
//# sourceMappingURL=sign_and_validate.js.map