"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bytes_1 = require("./bytes");
exports.writeString = (value) => {
    const stringBuffer = Buffer.from(value, 'utf8');
    return bytes_1.writeBytes(stringBuffer);
};
exports.readString = (buffer, offset) => {
    const [value, size] = bytes_1.readBytes(buffer, offset);
    return [value.toString('utf8'), size];
};
//# sourceMappingURL=string.js.map