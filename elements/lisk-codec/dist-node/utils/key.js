"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const varint_1 = require("../varint");
exports.generateKey = (schemaProp) => {
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
//# sourceMappingURL=key.js.map