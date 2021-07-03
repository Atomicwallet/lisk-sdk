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
exports.verifyTransaction = exports.secondSignTransaction = exports.signTransaction = exports.validateMultisignatures = exports.checkPublicKeySignatureUniqueness = exports.signaturesAreUnique = exports.validateSignature = exports.multiSignTransaction = void 0;
const cryptography = require("../../../lisk-cryptography");
const errors_1 = require("../errors");
const get_transaction_hash_1 = require("./get_transaction_hash");
const multiSignTransaction = (transaction, passphrase) => {
    const { signature, signSignature } = transaction, transactionToSign = __rest(transaction, ["signature", "signSignature"]);
    const transactionHash = get_transaction_hash_1.getTransactionHash(transactionToSign);
    return cryptography.signData(transactionHash, passphrase);
};
exports.multiSignTransaction = multiSignTransaction;
const validateSignature = (publicKey, signature, transactionBytes, id) => {
    const transactionHash = cryptography.hash(transactionBytes);
    const valid = cryptography.verifyData(transactionHash, signature, publicKey);
    return {
        valid,
        error: !valid
            ? new errors_1.TransactionError(`Failed to validate signature ${signature}`, id, '.signature')
            : undefined,
    };
};
exports.validateSignature = validateSignature;
const signaturesAreUnique = (signatures) => {
    const uniqueSignatures = [...new Set(signatures)];
    if (uniqueSignatures.length !== signatures.length) {
        return false;
    }
    return true;
};
exports.signaturesAreUnique = signaturesAreUnique;
const checkPublicKeySignatureUniqueness = (publicKeys, signatures, transactionBytes, id) => {
    const checkedPublicKeys = new Set();
    const validSignatures = new Set();
    publicKeys.forEach(publicKey => {
        signatures.forEach((signature) => {
            if (checkedPublicKeys.has(publicKey) || validSignatures.has(signature)) {
                return;
            }
            const { valid: signatureValid } = exports.validateSignature(publicKey, signature, transactionBytes, id);
            if (signatureValid) {
                checkedPublicKeys.add(publicKey);
                validSignatures.add(signature);
            }
        });
    });
    return validSignatures;
};
exports.checkPublicKeySignatureUniqueness = checkPublicKeySignatureUniqueness;
const validateMultisignatures = (publicKeys, signatures, minimumValidations, transactionBytes, id) => {
    if (!exports.signaturesAreUnique(signatures)) {
        return {
            valid: false,
            errors: [
                new errors_1.TransactionError('Encountered duplicate signature in transaction', id, '.signatures'),
            ],
        };
    }
    const validSignatures = exports.checkPublicKeySignatureUniqueness(publicKeys, signatures, transactionBytes, id);
    const invalidTransactionSignatures = signatures.filter(signature => !validSignatures.has(signature));
    if (signatures.length < minimumValidations) {
        return {
            valid: false,
            errors: [
                new errors_1.TransactionPendingError(`Missing signatures`, id, '.signatures'),
            ],
        };
    }
    return {
        valid: validSignatures.size >= minimumValidations &&
            invalidTransactionSignatures.length === 0,
        errors: invalidTransactionSignatures.length > 0
            ? invalidTransactionSignatures.map(signature => new errors_1.TransactionError(`Failed to validate signature ${signature}`, id, '.signatures'))
            : [],
    };
};
exports.validateMultisignatures = validateMultisignatures;
const signTransaction = (transaction, passphrase) => {
    const transactionHash = get_transaction_hash_1.getTransactionHash(transaction);
    return cryptography.signData(transactionHash, passphrase);
};
exports.signTransaction = signTransaction;
const secondSignTransaction = (transaction, secondPassphrase) => (Object.assign(Object.assign({}, transaction), { signSignature: exports.signTransaction(transaction, secondPassphrase) }));
exports.secondSignTransaction = secondSignTransaction;
const verifyTransaction = (transaction, secondPublicKey) => {
    if (!transaction.signature) {
        throw new Error('Cannot verify transaction without signature.');
    }
    if (!!transaction.signSignature && !secondPublicKey) {
        throw new Error('Cannot verify signSignature without secondPublicKey.');
    }
    const { signature, signSignature } = transaction, transactionWithoutSignatures = __rest(transaction, ["signature", "signSignature"]);
    const transactionWithoutSignature = !!transaction.signSignature
        ? Object.assign(Object.assign({}, transactionWithoutSignatures), { signature }) : transactionWithoutSignatures;
    const transactionHash = get_transaction_hash_1.getTransactionHash(transactionWithoutSignature);
    const publicKey = !!transaction.signSignature && secondPublicKey
        ? secondPublicKey
        : transaction.senderPublicKey;
    const lastSignature = transaction.signSignature
        ? transaction.signSignature
        : transaction.signature;
    const verified = cryptography.verifyData(transactionHash, lastSignature, publicKey);
    return !!transaction.signSignature
        ? verified && exports.verifyTransaction(transactionWithoutSignature)
        : verified;
};
exports.verifyTransaction = verifyTransaction;
//# sourceMappingURL=sign_and_validate.js.map