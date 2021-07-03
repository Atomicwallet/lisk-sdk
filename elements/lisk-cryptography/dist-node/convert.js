"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reverse = require("buffer-reverse");
const ed2curve = require("ed2curve");
const querystring = require("querystring");
const buffer_1 = require("./buffer");
const hash_1 = require("./hash");
exports.getFirstEightBytesReversed = (input) => {
    const BUFFER_SIZE = 8;
    if (typeof input === 'string') {
        return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
    }
    return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
};
exports.toAddress = (buffer) => {
    const BUFFER_SIZE = 8;
    if (!Buffer.from(buffer)
        .slice(0, BUFFER_SIZE)
        .equals(buffer)) {
        throw new Error('The buffer for Lisk addresses must not have more than 8 bytes');
    }
    return `${buffer_1.bufferToBigNumberString(buffer)}L`;
};
exports.getAddressFromPublicKey = (publicKey) => {
    const publicKeyHash = hash_1.hash(publicKey, 'hex');
    const publicKeyTransform = exports.getFirstEightBytesReversed(publicKeyHash);
    const address = exports.toAddress(publicKeyTransform);
    return address;
};
exports.convertPublicKeyEd2Curve = ed2curve.convertPublicKey;
exports.convertPrivateKeyEd2Curve = ed2curve.convertSecretKey;
exports.stringifyEncryptedPassphrase = (encryptedPassphrase) => {
    if (typeof encryptedPassphrase !== 'object' || encryptedPassphrase === null) {
        throw new Error('Encrypted passphrase to stringify must be an object.');
    }
    const objectToStringify = encryptedPassphrase.iterations
        ? encryptedPassphrase
        : {
            salt: encryptedPassphrase.salt,
            cipherText: encryptedPassphrase.cipherText,
            iv: encryptedPassphrase.iv,
            tag: encryptedPassphrase.tag,
            version: encryptedPassphrase.version,
        };
    return querystring.stringify(objectToStringify);
};
const parseIterations = (iterationsString) => {
    const iterations = iterationsString === undefined ? undefined : parseInt(iterationsString, 10);
    if (typeof iterations !== 'undefined' && Number.isNaN(iterations)) {
        throw new Error('Could not parse iterations.');
    }
    return iterations;
};
exports.parseEncryptedPassphrase = (encryptedPassphrase) => {
    if (typeof encryptedPassphrase !== 'string') {
        throw new Error('Encrypted passphrase to parse must be a string.');
    }
    const keyValuePairs = querystring.parse(encryptedPassphrase);
    const { iterations, salt, cipherText, iv, tag, version } = keyValuePairs;
    if ((typeof iterations !== 'string' && typeof iterations !== 'undefined') ||
        typeof salt !== 'string' ||
        typeof cipherText !== 'string' ||
        typeof iv !== 'string' ||
        typeof tag !== 'string' ||
        typeof version !== 'string') {
        throw new Error('Encrypted passphrase to parse must have only one value per key.');
    }
    return {
        iterations: parseIterations(iterations),
        salt,
        cipherText,
        iv,
        tag,
        version,
    };
};
//# sourceMappingURL=convert.js.map