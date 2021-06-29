"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readString = exports.writeString = void 0;
const bytes_1 = require("./bytes");
const writeString = (value) => {
    const stringBuffer = Buffer.from(value, 'utf8');
    return bytes_1.writeBytes(stringBuffer);
};
exports.writeString = writeString;
const readString = (buffer, offset) => {
    const [value, size] = bytes_1.readBytes(buffer, offset);
    return [value.toString('utf8'), size];
};
exports.readString = readString;
//# sourceMappingURL=string.js.map