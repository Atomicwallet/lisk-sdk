"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTransactionSchema = void 0;
exports.baseTransactionSchema = {
    $id: 'lisk/base-transaction',
    type: 'object',
    required: ['moduleID', 'assetID', 'nonce', 'fee', 'senderPublicKey', 'asset'],
    properties: {
        moduleID: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
        assetID: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
        nonce: {
            dataType: 'uint64',
            fieldNumber: 3,
        },
        fee: {
            dataType: 'uint64',
            fieldNumber: 4,
        },
        senderPublicKey: {
            dataType: 'bytes',
            fieldNumber: 5,
        },
        asset: {
            dataType: 'bytes',
            fieldNumber: 6,
        },
        signatures: {
            type: 'array',
            items: {
                dataType: 'bytes',
            },
            fieldNumber: 7,
        },
    },
};
//# sourceMappingURL=schema.js.map