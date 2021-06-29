"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgerSyncSchema = exports.forgerInfoSchema = void 0;
exports.forgerInfoSchema = {
    $id: '/forger/info',
    type: 'object',
    properties: {
        totalProducedBlocks: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
        totalReceivedFees: {
            dataType: 'uint64',
            fieldNumber: 2,
        },
        totalReceivedRewards: {
            dataType: 'uint64',
            fieldNumber: 3,
        },
        votesReceived: {
            type: 'array',
            fieldNumber: 4,
            items: {
                type: 'object',
                properties: {
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    amount: {
                        dataType: 'uint64',
                        fieldNumber: 2,
                    },
                },
            },
            required: ['address', 'amount'],
        },
    },
    required: ['totalProducedBlocks', 'totalReceivedFees', 'totalReceivedRewards', 'votesReceived'],
};
exports.forgerSyncSchema = {
    $id: 'forger/sync',
    type: 'object',
    required: ['syncUptoHeight'],
    properties: {
        syncUptoHeight: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
    },
};
//# sourceMappingURL=schema.js.map