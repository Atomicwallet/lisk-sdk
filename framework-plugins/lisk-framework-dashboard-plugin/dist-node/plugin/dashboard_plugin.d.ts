import { ActionsDefinition, BasePlugin, BaseChannel, EventsDefinition, PluginInfo, SchemaWithDefault } from 'lisk-framework';
export declare class DashboardPlugin extends BasePlugin {
    private _options;
    private _server;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): SchemaWithDefault;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(_channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
}
