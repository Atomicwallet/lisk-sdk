"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postBlockEventSchema = exports.transactionsSchema = exports.transactionIdsSchema = exports.getHighestCommonBlockRequestSchema = exports.getBlocksFromIdResponseSchema = exports.getBlocksFromIdRequestSchema = void 0;
exports.getBlocksFromIdRequestSchema = {
    $id: 'lisk/getBlocksFromIdRequest',
    title: 'Get Blocks From Id Request',
    type: 'object',
    required: ['blockId'],
    properties: {
        blockId: {
            fieldNumber: 1,
            dataType: 'bytes',
        },
    },
};
exports.getBlocksFromIdResponseSchema = {
    $id: 'lisk/getBlocksFromIdResponse',
    title: 'Get Blocks From Id Response',
    type: 'object',
    required: ['blocks'],
    properties: {
        blocks: {
            type: 'array',
            fieldNumber: 1,
            items: {
                dataType: 'bytes',
            },
        },
    },
};
exports.getHighestCommonBlockRequestSchema = {
    $id: 'lisk/getHighestCommonBlockRequest',
    title: 'Get Highest Common Block Request',
    type: 'object',
    required: ['ids'],
    properties: {
        ids: {
            type: 'array',
            fieldNumber: 1,
            minItems: 1,
            items: {
                dataType: 'bytes',
            },
        },
    },
};
exports.transactionIdsSchema = {
    $id: 'lisk/transactionIds',
    title: 'Broadcast Transactions',
    type: 'object',
    required: ['transactionIds'],
    properties: {
        transactionIds: {
            type: 'array',
            fieldNumber: 1,
            minItems: 1,
            maxItems: 100,
            items: {
                dataType: 'bytes',
            },
        },
    },
};
exports.transactionsSchema = {
    $id: 'lisk/transactions',
    title: 'Transactions',
    type: 'object',
    required: ['transactions'],
    properties: {
        transactions: {
            type: 'array',
            fieldNumber: 1,
            items: {
                dataType: 'bytes',
            },
        },
    },
};
exports.postBlockEventSchema = {
    $id: 'lisk/postBlockEvent',
    title: 'Post Block Event',
    type: 'object',
    required: ['block'],
    properties: {
        block: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
    },
};
//# sourceMappingURL=schemas.js.map