"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToBuffer = exports.bufferToHex = exports.bufferToBigNumberString = exports.bigNumberToBuffer = void 0;
const bn_js_1 = require("bn.js");
const bigNumberToBuffer = (bignumber, size) => new bn_js_1.default(bignumber).toBuffer({ size, endian: 'big' });
exports.bigNumberToBuffer = bigNumberToBuffer;
const bufferToBigNumberString = (bigNumberBuffer) => bn_js_1.default.fromBuffer(bigNumberBuffer).toString();
exports.bufferToBigNumberString = bufferToBigNumberString;
const bufferToHex = (buffer) => Buffer.from(buffer).toString('hex');
exports.bufferToHex = bufferToHex;
const hexRegex = /^[0-9a-f]+/i;
const hexToBuffer = (hex, argumentName = 'Argument') => {
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
exports.hexToBuffer = hexToBuffer;
//# sourceMappingURL=buffer.js.map