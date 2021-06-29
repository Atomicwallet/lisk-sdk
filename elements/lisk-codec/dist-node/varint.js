"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSInt64 = exports.readSInt32 = exports.readUInt64 = exports.readUInt32 = exports.writeSInt64 = exports.writeUInt64 = exports.writeSInt32 = exports.writeUInt32 = void 0;
const msg = 0x80;
const rest = 0x7f;
const writeUInt32 = (value) => {
    const result = [];
    let index = 0;
    while (value > rest) {
        result[index] = msg | ((value & rest) >>> 0);
        value = (value >>> 7) >>> 0;
        index += 1;
    }
    result[index] = value;
    return Buffer.from(result);
};
exports.writeUInt32 = writeUInt32;
const writeSInt32 = (value) => {
    if (value >= 0) {
        return exports.writeUInt32(2 * value);
    }
    return exports.writeUInt32(-2 * value - 1);
};
exports.writeSInt32 = writeSInt32;
const writeUInt64 = (value) => {
    const result = [];
    let index = 0;
    while (value > BigInt(rest)) {
        result[index] = Number(BigInt(msg) | (value & BigInt(rest)));
        value >>= BigInt(7);
        index += 1;
    }
    result[Number(index)] = Number(value);
    return Buffer.from(result);
};
exports.writeUInt64 = writeUInt64;
const writeSInt64 = (value) => {
    if (value >= BigInt(0)) {
        return exports.writeUInt64(BigInt(2) * value);
    }
    return exports.writeUInt64(BigInt(-2) * value - BigInt(1));
};
exports.writeSInt64 = writeSInt64;
const readUInt32 = (buffer, offset) => {
    let result = 0;
    let index = offset;
    for (let shift = 0; shift < 32; shift += 7) {
        if (index >= buffer.length) {
            throw new Error('Invalid buffer length');
        }
        const bit = buffer[index];
        index += 1;
        if (index === offset + 5 && bit > 0x0f) {
            throw new Error('Value out of range of uint32');
        }
        result = (result | ((bit & rest) << shift)) >>> 0;
        if ((bit & msg) === 0) {
            return [result, index - offset];
        }
    }
    throw new Error('Terminating bit not found');
};
exports.readUInt32 = readUInt32;
const readUInt64 = (buffer, offset) => {
    let result = BigInt(0);
    let index = offset;
    for (let shift = BigInt(0); shift < BigInt(64); shift += BigInt(7)) {
        if (index >= buffer.length) {
            throw new Error('Invalid buffer length');
        }
        const bit = BigInt(buffer[index]);
        index += 1;
        if (index === 10 + offset && bit > 0x01) {
            throw new Error('Value out of range of uint64');
        }
        result |= (bit & BigInt(rest)) << shift;
        if ((bit & BigInt(msg)) === BigInt(0)) {
            return [result, index - offset];
        }
    }
    throw new Error('Terminating bit not found');
};
exports.readUInt64 = readUInt64;
const readSInt32 = (buffer, offset) => {
    const [varInt, size] = exports.readUInt32(buffer, offset);
    if (varInt % 2 === 0) {
        return [varInt / 2, size];
    }
    return [-(varInt + 1) / 2, size];
};
exports.readSInt32 = readSInt32;
const readSInt64 = (buffer, offset) => {
    const [varInt, size] = exports.readUInt64(buffer, offset);
    if (varInt % BigInt(2) === BigInt(0)) {
        return [varInt / BigInt(2), size];
    }
    return [-(varInt + BigInt(1)) / BigInt(2), size];
};
exports.readSInt64 = readSInt64;
//# sourceMappingURL=varint.js.map