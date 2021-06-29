"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBit = exports.readBit = void 0;
const readBit = (buf, bit) => {
    const byteIndex = Math.floor(bit / 8);
    const bitIndex = bit % 8;
    return (buf[byteIndex] >> bitIndex) % 2 === 1;
};
exports.readBit = readBit;
const writeBit = (buf, bit, val) => {
    const byteIndex = Math.floor(bit / 8);
    const bitIndex = bit % 8;
    if (val) {
        buf[byteIndex] |= 1 << bitIndex;
    }
    else {
        buf[byteIndex] &= ~(1 << bitIndex);
    }
};
exports.writeBit = writeBit;
//# sourceMappingURL=utils.js.map