"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readKey = void 0;
const WIRE_TYPE_TWO = 2;
const WIRE_TYPE_ZERO = 0;
const readKey = (value) => {
    const wireType = value & 7;
    if (wireType === WIRE_TYPE_TWO || wireType === WIRE_TYPE_ZERO) {
        const fieldNumber = value >>> 3;
        return [fieldNumber, wireType];
    }
    throw new Error('Value yields unsupported wireType');
};
exports.readKey = readKey;
//# sourceMappingURL=keys.js.map