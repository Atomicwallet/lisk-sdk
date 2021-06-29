"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionAnnouncementSchema = exports.postBlockEventSchema = void 0;
exports.postBlockEventSchema = {
    $id: 'monitor/postBlockEvent',
    type: 'object',
    required: ['block'],
    properties: {
        block: {
            type: 'string',
            format: 'hex',
        },
    },
};
exports.transactionAnnouncementSchema = {
    $id: 'monitor/transactionAnnouncement',
    type: 'object',
    required: ['transactionIds'],
    properties: {
        transactionIds: {
            type: 'array',
            items: {
                type: 'string',
                format: 'hex',
            },
        },
    },
};
//# sourceMappingURL=schema.js.map