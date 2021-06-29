"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcRequestSchema = exports.protocolMessageSchema = exports.packetSchema = void 0;
exports.packetSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        event: {
            type: 'string',
        },
        cid: {
            type: 'integer',
        },
        rid: {
            type: 'integer',
        },
        data: {
            type: 'object',
        },
        error: {
            type: 'object',
        },
    },
};
exports.protocolMessageSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['event'],
    properties: {
        event: {
            type: 'string',
        },
        data: {
            type: 'string',
        },
    },
};
exports.rpcRequestSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['procedure'],
    properties: {
        procedure: {
            type: 'string',
        },
        data: {
            type: 'string',
        },
    },
};
//# sourceMappingURL=schemas.js.map