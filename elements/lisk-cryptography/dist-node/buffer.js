"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToBuffer = exports.hexToBuffer = exports.bufferToHex = exports.intToBuffer = exports.LITTLE_ENDIAN = exports.BIG_ENDIAN = void 0;
exports.BIG_ENDIAN = 'big';
exports.LITTLE_ENDIAN = 'little';
const MAX_NUMBER_BYTE_LENGTH = 6;
const intToBuffer = (value, byteLength, endianness = exports.BIG_ENDIAN, signed = false) => {
    if (![exports.BIG_ENDIAN, exports.LITTLE_ENDIAN].includes(endianness)) {
        throw new Error(`Endianness must be either ${exports.BIG_ENDIAN} or ${exports.LITTLE_ENDIAN}`);
    }
    const buffer = Buffer.alloc(byteLength);
    if (endianness === 'big') {
        if (byteLength <= MAX_NUMBER_BYTE_LENGTH) {
            if (signed) {
                buffer.writeIntBE(Number(value), 0, byteLength);
            }
            else {
                buffer.writeUIntBE(Number(value), 0, byteLength);
            }
        }
        else {
            if (signed) {
                buffer.writeBigInt64BE(BigInt(value));
            }
            else {
                buffer.writeBigUInt64BE(BigInt(value));
            }
        }
    }
    else {
        if (byteLength <= MAX_NUMBER_BYTE_LENGTH) {
            if (signed) {
                buffer.writeIntLE(Number(value), 0, byteLength);
            }
            else {
                buffer.writeUIntLE(Number(value), 0, byteLength);
            }
        }
        else {
            if (signed) {
                buffer.writeBigInt64LE(BigInt(value));
            }
            else {
                buffer.writeBigUInt64LE(BigInt(value));
            }
        }
    }
    return buffer;
};
exports.intToBuffer = intToBuffer;
const bufferToHex = (buffer) => Buffer.from(buffer).toString('hex');
exports.bufferToHex = bufferToHex;
const hexRegex = /^[0-9a-f]+/i;
const hexToBuffer = (hex, argumentName = 'Argument') => {
    var _a;
    if (typeof hex !== 'string') {
        throw new TypeError(`${argumentName} must be a string.`);
    }
    const matchedHex = ((_a = hex.match(hexRegex)) !== null && _a !== void 0 ? _a : [])[0];
    if (!matchedHex || matchedHex.length !== hex.length) {
        throw new TypeError(`${argumentName} must be a valid hex string.`);
    }
    if (matchedHex.length % 2 !== 0) {
        throw new TypeError(`${argumentName} must have a valid length of hex string.`);
    }
    return Buffer.from(matchedHex, 'hex');
};
exports.hexToBuffer = hexToBuffer;
const stringToBuffer = (str) => Buffer.from(str, 'utf8');
exports.stringToBuffer = stringToBuffer;
//# sourceMappingURL=buffer.js.map