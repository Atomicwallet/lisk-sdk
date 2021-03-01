"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const varint_1 = require("./varint");
exports.writeBytes = (bytes) => Buffer.concat([varint_1.writeUInt32(bytes.length), bytes]);
exports.readBytes = (buffer, offset) => {
    const [byteLength, keySize] = varint_1.readUInt32(buffer, offset);
    return [buffer.subarray(offset + keySize, offset + keySize + byteLength), byteLength + keySize];
};
//# sourceMappingURL=bytes.js.map