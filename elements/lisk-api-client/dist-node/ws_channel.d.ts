import { EventCallback } from './types';
export declare class WSChannel {
    isAlive: boolean;
    private readonly _url;
    private _ws?;
    private _requestCounter;
    private _pendingRequests;
    private readonly _emitter;
    constructor(url: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    invoke<T = Record<string, unknown>>(actionName: string, params?: Record<string, unknown>): Promise<T>;
    subscribe<T = Record<string, unknown>>(eventName: string, cb: EventCallback<T>): void;
    private _handleClose;
    private _handlePing;
    private _handleMessage;
}
