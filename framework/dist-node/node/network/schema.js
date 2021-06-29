"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customNodeInfoSchema = void 0;
exports.customNodeInfoSchema = {
    $id: '/nodeInfo/custom',
    type: 'object',
    properties: {
        height: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
        maxHeightPrevoted: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
        blockVersion: {
            dataType: 'uint32',
            fieldNumber: 3,
        },
        lastBlockID: {
            dataType: 'bytes',
            fieldNumber: 4,
        },
    },
};
//# sourceMappingURL=schema.js.map