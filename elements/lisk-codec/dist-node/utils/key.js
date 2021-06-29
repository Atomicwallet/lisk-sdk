"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKey = void 0;
const varint_1 = require("../varint");
const generateKey = (schemaProp) => {
    var _a;
    let wireType;
    const dataType = (_a = schemaProp.dataType) !== null && _a !== void 0 ? _a : schemaProp.type;
    switch (dataType) {
        case 'bytes':
        case 'string':
        case 'object':
        case 'array':
            wireType = 2;
            break;
        default:
            wireType = 0;
            break;
    }
    const keyAsVarInt = varint_1.writeUInt32((schemaProp.fieldNumber << 3) | wireType);
    return keyAsVarInt;
};
exports.generateKey = generateKey;
//# sourceMappingURL=key.js.map