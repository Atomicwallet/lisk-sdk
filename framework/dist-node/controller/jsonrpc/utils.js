"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCError = exports.parseError = exports.internalError = exports.invalidParams = exports.methodNotFound = exports.invalidRequest = exports.errorResponse = exports.successResponse = exports.notificationRequest = exports.validateJSONRPCNotification = exports.validateJSONRPCRequest = exports.VERSION = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
exports.VERSION = '2.0';
const requestSchema = {
    $id: 'jsonRPCRequestSchema',
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
    $id: 'jsonRPCRequestSchema',
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
const validateJSONRPCRequest = (data) => {
    const errors = lisk_validator_1.validator.validate(requestSchema, data);
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError(errors);
    }
};
exports.validateJSONRPCRequest = validateJSONRPCRequest;
const validateJSONRPCNotification = (data) => {
    const errors = lisk_validator_1.validator.validate(notificationSchema, data);
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError(errors);
    }
};
exports.validateJSONRPCNotification = validateJSONRPCNotification;
const notificationRequest = (method, params) => ({
    jsonrpc: exports.VERSION,
    method,
    params,
});
exports.notificationRequest = notificationRequest;
const successResponse = (id, result) => ({
    jsonrpc: exports.VERSION,
    id,
    result,
});
exports.successResponse = successResponse;
const errorResponse = (id, error) => ({
    jsonrpc: exports.VERSION,
    id,
    error,
});
exports.errorResponse = errorResponse;
const invalidRequest = () => ({
    message: 'Invalid request',
    code: -32600,
});
exports.invalidRequest = invalidRequest;
const methodNotFound = () => ({
    message: 'Method not found',
    code: -32601,
});
exports.methodNotFound = methodNotFound;
const invalidParams = () => ({
    message: 'Invalid params',
    code: -32602,
});
exports.invalidParams = invalidParams;
const internalError = (data) => {
    if (data) {
        return { message: 'Internal error', code: -32603, data };
    }
    return { message: 'Internal error', code: -32603 };
};
exports.internalError = internalError;
const parseError = () => ({ message: 'Parse error', code: -32700 });
exports.parseError = parseError;
class JSONRPCError extends Error {
    constructor(message, error) {
        super(message);
        this.response = error;
    }
}
exports.JSONRPCError = JSONRPCError;
//# sourceMappingURL=utils.js.map