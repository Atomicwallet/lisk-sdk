export declare type ID = string | number | null;
export declare type JSONRPCResult = string | number | boolean | object;
export interface JSONRPCErrorObject {
    code: number;
    message: string;
    data?: JSONRPCResult;
}
export interface RequestObject {
    readonly id: ID;
    readonly jsonrpc: string;
    readonly method: string;
    readonly params?: object & {
        source?: string;
    };
}
export declare type NotificationRequest = Omit<RequestObject, 'id'>;
export interface ResponseObjectWithError {
    readonly id: ID;
    readonly jsonrpc: string;
    readonly error: JSONRPCErrorObject;
    readonly result?: never;
}
export interface ResponseObjectWithResult<T = JSONRPCResult> {
    readonly id: ID;
    readonly jsonrpc: string;
    readonly error?: never;
    readonly result: T;
}
export declare type ResponseObject<T = JSONRPCResult> = ResponseObjectWithError | ResponseObjectWithResult<T>;
