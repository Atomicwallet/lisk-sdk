"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyReadableString = exports.keyString = void 0;
const keyString = (key) => key.toString('binary');
exports.keyString = keyString;
const keyReadableString = (key) => key.toString('hex');
exports.keyReadableString = keyReadableString;
//# sourceMappingURL=buffer_string.js.map