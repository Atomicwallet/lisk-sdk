"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInt = (num) => {
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
        buf.writeUInt32BE(num);
    }
    return buf.toString('binary');
};
exports.getFirstPrefix = (prefix) => `${prefix}\x00`;
exports.getLastPrefix = (prefix) => `${prefix}\xFF`;
exports.isASCIIChar = (val) => /^[\x21-\x7F]*$/.test(val);
exports.smartConvert = (message, delimiter, format) => message
    .split(delimiter)
    .map(s => {
    if (exports.isASCIIChar(s)) {
        return s;
    }
    return Buffer.from(s, 'binary').toString(format);
})
    .join(delimiter);
//# sourceMappingURL=utils.js.map