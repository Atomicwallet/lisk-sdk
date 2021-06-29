import { Logger } from '../logger';
import { InstantiablePlugin } from '../plugins/base_plugin';
import { PluginOptionsWithAppConfig, SocketPaths } from '../types';
import { Bus } from './bus';
import { InMemoryChannel } from './channels/in_memory_channel';
export interface ControllerOptions {
    readonly appLabel: string;
    readonly config: {
        readonly rootPath: string;
        readonly rpc: {
            readonly enable: boolean;
            readonly mode: string;
            readonly port: number;
        };
    };
    readonly logger: Logger;
    readonly channel: InMemoryChannel;
}
interface ControllerConfig {
    readonly dataPath: string;
    readonly socketsPath: SocketPaths;
    readonly dirs: {
        readonly dataPath: string;
        readonly data: string;
        readonly tmp: string;
        readonly logs: string;
        readonly sockets: string;
        readonly pids: string;
    };
    rpc: {
        readonly enable: boolean;
        readonly mode: string;
        readonly port: number;
    };
}
interface PluginsObject {
    readonly [key: string]: InstantiablePlugin;
}
export declare class Controller {
    readonly logger: Logger;
    readonly appLabel: string;
    readonly channel: InMemoryChannel;
    readonly config: ControllerConfig;
    bus: Bus;
    private readonly _childProcesses;
    private readonly _inMemoryPlugins;
    constructor(options: ControllerOptions);
    load(): Promise<void>;
    loadPlugins(plugins: PluginsObject, pluginOptions: {
        [key: string]: PluginOptionsWithAppConfig;
    }): Promise<void>;
    unloadPlugins(plugins?: string[]): Promise<void>;
    cleanup(_code?: number, reason?: string): Promise<void>;
    private _setupBus;
    private _loadInMemoryPlugin;
    private _loadChildProcessPlugin;
    private _unloadInMemoryPlugin;
    private _unloadChildProcessPlugin;
}
export {};
