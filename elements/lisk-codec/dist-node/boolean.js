"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBoolean = (value) => value ? Buffer.from('01', 'hex') : Buffer.from('00', 'hex');
exports.readBoolean = (buffer, offset) => [
    buffer[offset] !== 0x00,
    1,
];
//# sourceMappingURL=boolean.js.map