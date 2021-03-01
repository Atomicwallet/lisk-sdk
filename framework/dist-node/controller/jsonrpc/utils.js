"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_validator_1 = require("@liskhq/lisk-validator");
exports.VERSION = '2.0';
const requestSchema = {
    id: 'jsonRPCRequestSchema',
    type: 'object',
    required: ['jsonrpc', 'method', 'id'],
    properties: {
        jsonrpc: {
            type: 'string',
            const: '2.0',
        },
        method: {
            type: 'string',
        },
        id: {
            type: ['number', 'string', 'null'],
        },
        params: {
            type: 'object',
        },
    },
    additionalProperties: false,
};
const notificationSchema = {
    id: 'jsonRPCRequestSchema',
    type: 'object',
    required: ['jsonrpc', 'method'],
    properties: {
        jsonrpc: {
            type: 'string',
            const: '2.0',
        },
        method: {
            type: 'string',
        },
        params: {
            type: 'object',
        },
    },
    additionalProperties: false,
};
exports.validateJSONRPCRequest = (data) => {
    const errors = lisk_validator_1.validator.validate(requestSchema, data);
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError(errors);
    }
};
exports.validateJSONRPCNotification = (data) => {
    const errors = lisk_validator_1.validator.validate(notificationSchema, data);
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError(errors);
    }
};
exports.notificationRequest = (method, params) => ({
    jsonrpc: exports.VERSION,
    method,
    params,
});
exports.successResponse = (id, result) => ({
    jsonrpc: exports.VERSION,
    id,
    result,
});
exports.errorResponse = (id, error) => ({
    jsonrpc: exports.VERSION,
    id,
    error,
});
exports.invalidRequest = () => ({
    message: 'Invalid request',
    code: -32600,
});
exports.methodNotFound = () => ({
    message: 'Method not found',
    code: -32601,
});
exports.invalidParams = () => ({
    message: 'Invalid params',
    code: -32602,
});
exports.internalError = (data) => {
    if (data) {
        return { message: 'Internal error', code: -32603, data };
    }
    return { message: 'Internal error', code: -32603 };
};
exports.parseError = () => ({ message: 'Parse error', code: -32700 });
class JSONRPCError extends Error {
    constructor(message, error) {
        super(message);
        this.response = error;
    }
}
exports.JSONRPCError = JSONRPCError;
//# sourceMappingURL=utils.js.map