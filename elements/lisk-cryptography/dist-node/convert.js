"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reverse = require("buffer-reverse");
var ed2curve = require("ed2curve");
var querystring = require("querystring");
var buffer_1 = require("./buffer");
var hash_1 = require("./hash");
exports.getFirstEightBytesReversed = function (input) {
    var BUFFER_SIZE = 8;
    if (typeof input === 'string') {
        return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
    }
    return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
};
exports.toAddress = function (buffer) {
    var BUFFER_SIZE = 8;
    if (!Buffer.from(buffer)
        .slice(0, BUFFER_SIZE)
        .equals(buffer)) {
        throw new Error('The buffer for Lisk addresses must not have more than 8 bytes');
    }
    return buffer_1.bufferToBigNumberString(buffer) + "L";
};
exports.getAddressFromPublicKey = function (publicKey) {
    var publicKeyHash = hash_1.hash(publicKey, 'hex');
    var publicKeyTransform = exports.getFirstEightBytesReversed(publicKeyHash);
    var address = exports.toAddress(publicKeyTransform);
    return address;
};
exports.convertPublicKeyEd2Curve = ed2curve.convertPublicKey;
exports.convertPrivateKeyEd2Curve = ed2curve.convertSecretKey;
exports.stringifyEncryptedPassphrase = function (encryptedPassphrase) {
    if (typeof encryptedPassphrase !== 'object' || encryptedPassphrase === null) {
        throw new Error('Encrypted passphrase to stringify must be an object.');
    }
    var objectToStringify = encryptedPassphrase.iterations
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
var parseIterations = function (iterationsString) {
    var iterations = iterationsString === undefined ? undefined : parseInt(iterationsString, 10);
    if (typeof iterations !== 'undefined' && Number.isNaN(iterations)) {
        throw new Error('Could not parse iterations.');
    }
    return iterations;
};
exports.parseEncryptedPassphrase = function (encryptedPassphrase) {
    if (typeof encryptedPassphrase !== 'string') {
        throw new Error('Encrypted passphrase to parse must be a string.');
    }
    var keyValuePairs = querystring.parse(encryptedPassphrase);
    var iterations = keyValuePairs.iterations, salt = keyValuePairs.salt, cipherText = keyValuePairs.cipherText, iv = keyValuePairs.iv, tag = keyValuePairs.tag, version = keyValuePairs.version;
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
        salt: salt,
        cipherText: cipherText,
        iv: iv,
        tag: tag,
        version: version,
    };
};
//# sourceMappingURL=convert.js.map