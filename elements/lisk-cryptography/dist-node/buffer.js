"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
exports.bigNumberToBuffer = function (bignumber, size) {
    return new BigNum(bignumber).toBuffer({ size: size, endian: 'big' });
};
exports.bufferToBigNumberString = function (bigNumberBuffer) {
    return BigNum.fromBuffer(bigNumberBuffer).toString();
};
exports.bufferToHex = function (buffer) {
    return Buffer.from(buffer).toString('hex');
};
var hexRegex = /^[0-9a-f]+/i;
exports.hexToBuffer = function (hex, argumentName) {
    if (argumentName === void 0) { argumentName = 'Argument'; }
    if (typeof hex !== 'string') {
        throw new TypeError(argumentName + " must be a string.");
    }
    var matchedHex = (hex.match(hexRegex) || [])[0];
    if (!matchedHex || matchedHex.length !== hex.length) {
        throw new TypeError(argumentName + " must be a valid hex string.");
    }
    if (matchedHex.length % 2 !== 0) {
        throw new TypeError(argumentName + " must have a valid length of hex string.");
    }
    return Buffer.from(matchedHex, 'hex');
};
//# sourceMappingURL=buffer.js.map