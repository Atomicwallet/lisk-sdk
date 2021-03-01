import { BasePlugin, PluginInfo } from 'lisk-framework';
import type { BaseChannel, EventsDefinition, ActionsDefinition } from 'lisk-framework';
export declare class HTTPAPIPlugin extends BasePlugin {
    private _server;
    private _app;
    private _channel;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): object;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
    private _registerMiddlewares;
    private _registerAfterMiddlewares;
    private _registerControllers;
}
