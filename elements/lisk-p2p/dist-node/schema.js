"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCustomSchema = exports.defaultRPCSchemas = exports.peerRequestResponseSchema = exports.peerInfoSchema = exports.nodeInfoSchema = void 0;
exports.nodeInfoSchema = {
    $id: '/nodeInfo',
    type: 'object',
    properties: {
        networkIdentifier: {
            dataType: 'string',
            fieldNumber: 1,
        },
        networkVersion: {
            dataType: 'string',
            fieldNumber: 2,
        },
        nonce: {
            dataType: 'string',
            fieldNumber: 3,
        },
        advertiseAddress: {
            dataType: 'boolean',
            fieldNumber: 4,
        },
    },
    required: ['networkIdentifier', 'networkVersion', 'nonce'],
};
exports.peerInfoSchema = {
    $id: '/protocolPeerInfo',
    type: 'object',
    properties: {
        ipAddress: {
            dataType: 'string',
            fieldNumber: 1,
        },
        port: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
    },
    required: ['ipAddress', 'port'],
};
exports.peerRequestResponseSchema = {
    $id: '/protocolPeerRequestResponse',
    type: 'object',
    properties: {
        peers: {
            type: 'array',
            fieldNumber: 1,
            items: {
                dataType: 'bytes',
            },
        },
    },
    required: ['peers'],
};
exports.defaultRPCSchemas = {
    peerInfo: exports.peerInfoSchema,
    nodeInfo: exports.nodeInfoSchema,
    peerRequestResponse: exports.peerRequestResponseSchema,
};
const mergeCustomSchema = (baseSchema, customSchema) => ({
    ...baseSchema,
    properties: {
        ...baseSchema.properties,
        options: {
            type: 'object',
            fieldNumber: 5,
            properties: { ...customSchema.properties },
        },
    },
});
exports.mergeCustomSchema = mergeCustomSchema;
//# sourceMappingURL=schema.js.map