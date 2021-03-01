"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            fieldNumber: 4,
        },
        advertiseAddress: {
            dataType: 'boolean',
            fieldNumber: 5,
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
exports.defaultRPCSchemas = {
    peerInfo: exports.peerInfoSchema,
    nodeInfo: exports.nodeInfoSchema,
};
exports.mergeCustomSchema = (baseSchema, customSchema) => ({
    ...baseSchema,
    properties: {
        ...baseSchema.properties,
        options: {
            type: 'object',
            properties: { ...customSchema.properties },
        },
    },
});
//# sourceMappingURL=schema.js.map