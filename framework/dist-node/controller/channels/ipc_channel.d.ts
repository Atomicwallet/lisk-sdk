/// <reference path="../../../external_types/pm2-axon/index.d.ts" />
/// <reference path="../../../external_types/pm2-axon-rpc/index.d.ts" />
import { ListenerFn } from 'eventemitter2';
import { ActionsDefinition } from '../action';
import { BaseChannel, BaseChannelOptions } from './base_channel';
import { SocketPaths } from '../../types';
interface ChildProcessOptions extends BaseChannelOptions {
    socketsPath: SocketPaths;
}
export declare class IPCChannel extends BaseChannel {
    private readonly _emitter;
    private readonly _ipcClient;
    constructor(moduleAlias: string, events: ReadonlyArray<string>, actions: ActionsDefinition, options: ChildProcessOptions);
    startAndListen(): Promise<void>;
    registerToBus(): Promise<void>;
    subscribe(eventName: string, cb: ListenerFn): void;
    once(eventName: string, cb: ListenerFn): void;
    publish(eventName: string, data?: Record<string, unknown>): void;
    invoke<T>(actionName: string, params?: Record<string, unknown>): Promise<T>;
    cleanup(_status?: number, _message?: string): void;
    private get _rpcServer();
    private get _rpcClient();
    private get _pubSocket();
    private get _subSocket();
}
export {};
