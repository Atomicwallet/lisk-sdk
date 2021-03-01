import { ActionsDefinition, BaseChannel, BasePlugin, EventsDefinition, PluginInfo } from 'lisk-framework';
import { SharedState } from './types';
export declare class MonitorPlugin extends BasePlugin {
    private _server;
    private _app;
    private _channel;
    private _state;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): Record<string, unknown>;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
    get state(): SharedState;
    private _registerMiddlewares;
    private _registerAfterMiddlewares;
    private _registerControllers;
    private _subscribeToEvents;
    private _handlePostTransactionAnnounce;
    private _cleanUpTransactionStats;
    private _handleFork;
    private _handlePostBlock;
}
