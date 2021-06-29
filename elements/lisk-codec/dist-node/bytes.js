"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBytes = exports.writeBytes = void 0;
const varint_1 = require("./varint");
const writeBytes = (bytes) => Buffer.concat([varint_1.writeUInt32(bytes.length), bytes]);
exports.writeBytes = writeBytes;
const readBytes = (buffer, offset) => {
    const [byteLength, keySize] = varint_1.readUInt32(buffer, offset);
    return [buffer.subarray(offset + keySize, offset + keySize + byteLength), byteLength + keySize];
};
exports.readBytes = readBytes;
//# sourceMappingURL=bytes.js.map