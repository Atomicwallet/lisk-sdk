"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
exports.bigNumberToBuffer = (bignumber, size) => new BN(bignumber).toBuffer({ size, endian: 'big' });
exports.bufferToBigNumberString = (bigNumberBuffer) => BN.fromBuffer(bigNumberBuffer).toString();
exports.bufferToHex = (buffer) => Buffer.from(buffer).toString('hex');
const hexRegex = /^[0-9a-f]+/i;
exports.hexToBuffer = (hex, argumentName = 'Argument') => {
    if (typeof hex !== 'string') {
        throw new TypeError(`${argumentName} must be a string.`);
    }
    const matchedHex = (hex.match(hexRegex) || [])[0];
    if (!matchedHex || matchedHex.length !== hex.length) {
        throw new TypeError(`${argumentName} must be a valid hex string.`);
    }
    if (matchedHex.length % 2 !== 0) {
        throw new TypeError(`${argumentName} must have a valid length of hex string.`);
    }
    return Buffer.from(matchedHex, 'hex');
};
//# sourceMappingURL=buffer.js.map