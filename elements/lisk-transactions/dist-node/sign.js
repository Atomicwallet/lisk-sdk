"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signMultiSignatureTransaction = exports.signTransaction = exports.getBytes = exports.getSigningBytes = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const validate_1 = require("./validate");
const schema_1 = require("./schema");
const constants_1 = require("./constants");
const getSigningBytes = (assetSchema, transactionObject) => {
    const validationErrors = validate_1.validateTransaction(assetSchema, transactionObject);
    if (validationErrors) {
        throw validationErrors;
    }
    if (typeof transactionObject.asset !== 'object' || transactionObject.asset === null) {
        throw new Error('Asset must be of type object and not null');
    }
    const assetBytes = lisk_codec_1.codec.encode(assetSchema, transactionObject.asset);
    const transactionBytes = lisk_codec_1.codec.encode(schema_1.baseTransactionSchema, {
        ...transactionObject,
        asset: assetBytes,
        signatures: [],
    });
    return transactionBytes;
};
exports.getSigningBytes = getSigningBytes;
const getBytes = (assetSchema, transactionObject) => {
    if (typeof transactionObject.asset !== 'object' || transactionObject.asset === null) {
        throw new Error('Asset must be of type object and not null');
    }
    const assetBytes = lisk_codec_1.codec.encode(assetSchema, transactionObject.asset);
    const transactionBytes = lisk_codec_1.codec.encode(schema_1.baseTransactionSchema, {
        ...transactionObject,
        asset: assetBytes,
    });
    return transactionBytes;
};
exports.getBytes = getBytes;
const signTransaction = (assetSchema, transactionObject, networkIdentifier, passphrase) => {
    if (!networkIdentifier.length) {
        throw new Error('Network identifier is required to sign a transaction');
    }
    if (!passphrase) {
        throw new Error('Passphrase is required to sign a transaction');
    }
    const validationErrors = validate_1.validateTransaction(assetSchema, transactionObject);
    if (validationErrors) {
        throw validationErrors;
    }
    const { publicKey } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase);
    if (!Buffer.isBuffer(transactionObject.senderPublicKey) ||
        !transactionObject.senderPublicKey.equals(publicKey)) {
        throw new Error('Transaction senderPublicKey does not match public key from passphrase');
    }
    const signature = lisk_cryptography_1.signData(constants_1.TAG_TRANSACTION, networkIdentifier, exports.getSigningBytes(assetSchema, transactionObject), passphrase);
    transactionObject.signatures = [signature];
    return { ...transactionObject, id: lisk_cryptography_1.hash(exports.getBytes(assetSchema, transactionObject)) };
};
exports.signTransaction = signTransaction;
const sanitizeSignaturesArray = (transactionObject, keys, includeSenderSignature) => {
    const numberOfSignatures = (includeSenderSignature ? 1 : 0) + keys.mandatoryKeys.length + keys.optionalKeys.length;
    for (let i = 0; i < numberOfSignatures; i += 1) {
        if (Array.isArray(transactionObject.signatures) &&
            transactionObject.signatures[i] === undefined) {
            transactionObject.signatures[i] = Buffer.alloc(0);
        }
    }
};
const signMultiSignatureTransaction = (assetSchema, transactionObject, networkIdentifier, passphrase, keys, includeSenderSignature = false) => {
    if (!networkIdentifier.length) {
        throw new Error('Network identifier is required to sign a transaction');
    }
    if (!passphrase) {
        throw new Error('Passphrase is required to sign a transaction');
    }
    if (!Array.isArray(transactionObject.signatures)) {
        throw new Error('Signatures must be of type array');
    }
    const validationErrors = validate_1.validateTransaction(assetSchema, transactionObject);
    if (validationErrors) {
        throw validationErrors;
    }
    keys.mandatoryKeys.sort((publicKeyA, publicKeyB) => publicKeyA.compare(publicKeyB));
    keys.optionalKeys.sort((publicKeyA, publicKeyB) => publicKeyA.compare(publicKeyB));
    const { publicKey } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase);
    const signature = lisk_cryptography_1.signData(constants_1.TAG_TRANSACTION, networkIdentifier, exports.getSigningBytes(assetSchema, transactionObject), passphrase);
    if (includeSenderSignature &&
        Buffer.isBuffer(transactionObject.senderPublicKey) &&
        publicKey.equals(transactionObject.senderPublicKey)) {
        transactionObject.signatures[0] = signature;
    }
    const mandatoryKeyIndex = keys.mandatoryKeys.findIndex(aPublicKey => aPublicKey.equals(publicKey));
    const optionalKeyIndex = keys.optionalKeys.findIndex(aPublicKey => aPublicKey.equals(publicKey));
    if (mandatoryKeyIndex !== -1) {
        const signatureOffset = includeSenderSignature ? 1 : 0;
        transactionObject.signatures[mandatoryKeyIndex + signatureOffset] = signature;
    }
    if (optionalKeyIndex !== -1) {
        const signatureOffset = includeSenderSignature ? 1 : 0;
        transactionObject.signatures[keys.mandatoryKeys.length + optionalKeyIndex + signatureOffset] = signature;
    }
    sanitizeSignaturesArray(transactionObject, keys, includeSenderSignature);
    return { ...transactionObject, id: lisk_cryptography_1.hash(exports.getBytes(assetSchema, transactionObject)) };
};
exports.signMultiSignatureTransaction = signMultiSignatureTransaction;
//# sourceMappingURL=sign.js.map