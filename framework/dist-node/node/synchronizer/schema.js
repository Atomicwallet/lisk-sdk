"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonBlock = {
    id: 'CommonBlock',
    type: 'string',
    format: 'hex',
};
exports.WSBlocksList = {
    id: 'WSBlocksList',
    type: 'array',
    items: {
        type: 'string',
        format: 'hex',
    },
};
exports.WSTransactionsResponse = {
    id: 'WSTransactionsResponse',
    type: 'object',
    required: ['transactions'],
    properties: {
        transactions: {
            type: 'array',
            uniqueItems: true,
            maxItems: 100,
            items: {
                type: 'string',
                format: 'hex',
            },
        },
    },
};
//# sourceMappingURL=schema.js.map