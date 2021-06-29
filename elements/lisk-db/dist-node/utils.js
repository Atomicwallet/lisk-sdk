"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartConvert = exports.isASCIIChar = exports.getLastPrefix = exports.getFirstPrefix = exports.formatInt = void 0;
const formatInt = (num) => {
    let buf;
    if (typeof num === 'bigint') {
        if (num < BigInt(0)) {
            throw new Error('Negative number cannot be formatted');
        }
        buf = Buffer.alloc(8);
        buf.writeBigUInt64BE(num);
    }
    else {
        if (num < 0) {
            throw new Error('Negative number cannot be formatted');
        }
        buf = Buffer.alloc(4);
        buf.writeUInt32BE(num, 0);
    }
    return buf.toString('binary');
};
exports.formatInt = formatInt;
const getFirstPrefix = (prefix) => `${prefix}\x00`;
exports.getFirstPrefix = getFirstPrefix;
const getLastPrefix = (prefix) => `${prefix}\xFF`;
exports.getLastPrefix = getLastPrefix;
const isASCIIChar = (val) => /^[\x21-\x7F]*$/.test(val);
exports.isASCIIChar = isASCIIChar;
const smartConvert = (message, delimiter, format) => message
    .split(delimiter)
    .map(s => {
    if (exports.isASCIIChar(s)) {
        return s;
    }
    return Buffer.from(s, 'binary').toString(format);
})
    .join(delimiter);
exports.smartConvert = smartConvert;
//# sourceMappingURL=utils.js.map