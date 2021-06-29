import { ActionsDefinition, BasePlugin, BaseChannel, EventsDefinition, PluginInfo, SchemaWithDefault } from 'lisk-framework';
export declare class FaucetPlugin extends BasePlugin {
    private _options;
    private _channel;
    private _client;
    private _server;
    private readonly _state;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): SchemaWithDefault;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
    private _transferFunds;
}
