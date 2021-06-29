"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultValue = void 0;
const getDefaultValue = (dataType) => {
    switch (dataType) {
        case 'string':
            return '';
        case 'boolean':
            return false;
        case 'bytes':
            return Buffer.alloc(0);
        case 'uint32':
        case 'sint32':
            return 0;
        case 'uint64':
        case 'sint64':
            return BigInt(0);
        default:
            throw new Error('Invalid data type');
    }
};
exports.getDefaultValue = getDefaultValue;
//# sourceMappingURL=default_value.js.map