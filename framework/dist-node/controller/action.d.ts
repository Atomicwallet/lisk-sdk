import { ID, JSONRPCErrorObject, JSONRPCResult, RequestObject, ResponseObject } from './jsonrpc';
export declare type ActionHandler = (params?: Record<string, unknown>) => unknown;
export interface ActionsDefinition {
    [key: string]: ActionHandler | {
        handler: ActionHandler;
    };
}
export declare class Action {
    readonly id: ID;
    readonly module: string;
    readonly name: string;
    readonly params?: Record<string, unknown>;
    handler?: ActionHandler;
    constructor(id: ID, name: string, params?: Record<string, unknown>, handler?: ActionHandler);
    static fromJSONRPCRequest(data: RequestObject | string): Action;
    toJSONRPCRequest(): RequestObject;
    buildJSONRPCResponse<T = JSONRPCResult>({ error, result, }: {
        error?: JSONRPCErrorObject;
        result?: T;
    }): ResponseObject<T>;
    key(): string;
}
