"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WIRE_TYPE_TWO = 2;
const WIRE_TYPE_ZERO = 0;
exports.readKey = (value) => {
    const wireType = value & 7;
    if (wireType === WIRE_TYPE_TWO || wireType === WIRE_TYPE_ZERO) {
        const fieldNumber = value >>> 3;
        return [fieldNumber, wireType];
    }
    throw new Error('Value yields unsupported wireType');
};
//# sourceMappingURL=keys.js.map