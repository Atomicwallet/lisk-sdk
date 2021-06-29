import { ListenerFn } from 'eventemitter2';
import { Logger } from '../logger';
import { SocketPaths } from '../types';
import { Action } from './action';
import { BaseChannel } from './channels/base_channel';
import { EventsDefinition } from './event';
import * as JSONRPC from './jsonrpc';
interface BusConfiguration {
    socketsPath: SocketPaths;
    rpc: {
        readonly enable: boolean;
        readonly mode: string;
        readonly port: number;
        readonly host?: string;
    };
}
interface RegisterChannelOptions {
    readonly type: string;
    readonly channel: BaseChannel;
    readonly rpcSocketPath?: string;
}
export declare class Bus {
    logger: Logger;
    private readonly config;
    private readonly actions;
    private readonly events;
    private readonly channels;
    private readonly rpcClients;
    private readonly _ipcServer;
    private readonly _emitter;
    private readonly _wsServer;
    constructor(logger: Logger, config: BusConfiguration);
    setup(): Promise<boolean>;
    registerChannel(moduleAlias: string, events: EventsDefinition, actions: {
        [key: string]: Action;
    }, options: RegisterChannelOptions): Promise<void>;
    invoke<T>(rawRequest: string | JSONRPC.RequestObject): Promise<JSONRPC.ResponseObjectWithResult<T>>;
    publish(rawRequest: string | JSONRPC.NotificationRequest): void;
    subscribe(eventName: string, cb: ListenerFn): void;
    once(eventName: string, cb: ListenerFn): this;
    getActions(): ReadonlyArray<string>;
    getEvents(): ReadonlyArray<string>;
    cleanup(): Promise<void>;
    private _setupIPCServer;
    private _setupWSServer;
}
export {};
