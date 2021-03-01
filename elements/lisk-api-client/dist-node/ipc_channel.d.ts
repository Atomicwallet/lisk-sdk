/// <reference path="../external_types/pm2-axon/index.d.ts" />
/// <reference path="../external_types/pm2-axon-rpc/index.d.ts" />
import { Channel, EventCallback } from './types';
export declare class IPCChannel implements Channel {
    private readonly _events;
    private readonly _rpcClient;
    private readonly _pubSocket;
    private readonly _subSocket;
    private readonly _eventPubSocketPath;
    private readonly _eventSubSocketPath;
    private readonly _rpcServerSocketPath;
    private _id;
    constructor(dataPath: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    invoke<T = Record<string, unknown>>(actionName: string, params?: Record<string, unknown>): Promise<T>;
    subscribe<T = Record<string, unknown>>(eventName: string, cb: EventCallback<T>): void;
}
