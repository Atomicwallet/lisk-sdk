"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBoolean = exports.writeBoolean = void 0;
const writeBoolean = (value) => value ? Buffer.from('01', 'hex') : Buffer.from('00', 'hex');
exports.writeBoolean = writeBoolean;
const readBoolean = (buffer, offset) => [
    buffer[offset] !== 0x00,
    1,
];
exports.readBoolean = readBoolean;
//# sourceMappingURL=boolean.js.map