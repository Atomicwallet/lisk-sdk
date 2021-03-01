import { JSONRPCErrorObject, JSONRPCResult, ResponseObjectWithResult, ResponseObjectWithError } from './types';
export declare const VERSION = "2.0";
export declare const validateJSONRPCRequest: (data: Record<string, unknown>) => void;
export declare const validateJSONRPCNotification: (data: Record<string, unknown>) => void;
export declare const notificationRequest: (method: string, params?: Record<string, unknown> | undefined) => Pick<import("./types").RequestObject, "jsonrpc" | "method" | "params">;
export declare const successResponse: (id: string | number | null, result: JSONRPCResult) => ResponseObjectWithResult<JSONRPCResult>;
export declare const errorResponse: (id: string | number | null, error: JSONRPCErrorObject) => ResponseObjectWithError;
export declare const invalidRequest: () => JSONRPCErrorObject;
export declare const methodNotFound: () => JSONRPCErrorObject;
export declare const invalidParams: () => JSONRPCErrorObject;
export declare const internalError: (data?: string | number | boolean | object | undefined) => JSONRPCErrorObject;
export declare const parseError: () => JSONRPCErrorObject;
export declare class JSONRPCError extends Error {
    response: ResponseObjectWithError;
    constructor(message: string, error: ResponseObjectWithError);
}
