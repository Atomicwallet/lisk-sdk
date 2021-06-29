"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEncryptedPassphrase = exports.stringifyEncryptedPassphrase = exports.convertPrivateKeyEd2Curve = exports.convertPublicKeyEd2Curve = exports.getFirstEightBytesReversed = exports.convertUInt5ToBase32 = exports.convertUIntArray = void 0;
const ed2curve = require("ed2curve");
const querystring = require("querystring");
const reverse = require("buffer-reverse");
const CHARSET = 'zxvcpmbn3465o978uyrtkqew2adsjhfg';
const convertUIntArray = (uintArray, fromBits, toBits) => {
    const maxValue = (1 << toBits) - 1;
    let accumulator = 0;
    let bits = 0;
    const result = [];
    for (let p = 0; p < uintArray.length; p += 1) {
        const byte = uintArray[p];
        if (byte < 0 || byte >> fromBits !== 0) {
            return [];
        }
        accumulator = (accumulator << fromBits) | byte;
        bits += fromBits;
        while (bits >= toBits) {
            bits -= toBits;
            result.push((accumulator >> bits) & maxValue);
        }
    }
    return result;
};
exports.convertUIntArray = convertUIntArray;
const convertUInt5ToBase32 = (uint5Array) => uint5Array.map((val) => CHARSET[val]).join('');
exports.convertUInt5ToBase32 = convertUInt5ToBase32;
const getFirstEightBytesReversed = (input) => {
    const BUFFER_SIZE = 8;
    if (typeof input === 'string') {
        return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
    }
    return reverse(Buffer.from(input).slice(0, BUFFER_SIZE));
};
exports.getFirstEightBytesReversed = getFirstEightBytesReversed;
exports.convertPublicKeyEd2Curve = ed2curve.convertPublicKey;
exports.convertPrivateKeyEd2Curve = ed2curve.convertSecretKey;
const stringifyEncryptedPassphrase = (encryptedPassphrase) => {
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
exports.stringifyEncryptedPassphrase = stringifyEncryptedPassphrase;
const parseIterations = (iterationsString) => {
    const iterations = iterationsString === undefined ? undefined : parseInt(iterationsString, 10);
    if (typeof iterations !== 'undefined' && Number.isNaN(iterations)) {
        throw new Error('Could not parse iterations.');
    }
    return iterations;
};
const parseEncryptedPassphrase = (encryptedPassphrase) => {
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
exports.parseEncryptedPassphrase = parseEncryptedPassphrase;
//# sourceMappingURL=convert.js.map