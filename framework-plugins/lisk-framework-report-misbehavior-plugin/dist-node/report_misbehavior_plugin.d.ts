import { ActionsDefinition, BasePlugin, BaseChannel, EventsDefinition, PluginInfo } from 'lisk-framework';
export declare class ReportMisbehaviorPlugin extends BasePlugin {
    private _pluginDB;
    private _options;
    private readonly _state;
    private _channel;
    private _clearBlockHeadersInterval;
    private _clearBlockHeadersIntervalId;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): Record<string, unknown>;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
    private _subscribeToChannel;
    private _createPoMTransaction;
}
