"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = {
    getBlocksFromIdRequest: {
        id: 'getBlocksFromIdRequest',
        type: 'object',
        required: ['blockId'],
        properties: {
            blockId: {
                type: 'string',
                format: 'hex',
            },
        },
    },
    getTransactionsRequest: {
        id: 'getTransactionsRequest',
        type: 'object',
        properties: {
            transactionIds: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'hex',
                },
            },
        },
    },
    postBlockEvent: {
        id: 'postBlockEvent',
        type: 'object',
        required: ['block'],
        properties: {
            block: {
                type: 'string',
                format: 'hex',
            },
        },
    },
    postTransactionsAnnouncementEvent: {
        id: 'postTransactionsAnnouncementEvent',
        type: 'object',
        required: ['transactionIds'],
        properties: {
            transactionIds: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'hex',
                },
                minItems: 1,
                maxItems: 100,
            },
        },
    },
    getHighestCommonBlockRequest: {
        id: 'getHighestCommonBlockRequest',
        type: 'object',
        required: ['ids'],
        properties: {
            ids: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'hex',
                },
                uniqueItems: true,
                minItems: 1,
            },
        },
    },
};
//# sourceMappingURL=schemas.js.map