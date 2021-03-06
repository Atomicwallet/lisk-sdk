/// <reference types="node" />
import { BasePlugin } from './plugins/base_plugin';
import { Logger } from './logger';
import { ApplicationConfig, PluginOptions, RegisteredSchema, RegisteredModule, PartialApplicationConfig } from './types';
import { BaseModule } from './modules';
export declare class Application {
    config: ApplicationConfig;
    logger: Logger;
    private readonly _node;
    private _controller;
    private _plugins;
    private _channel;
    private readonly _genesisBlock;
    private _blockchainDB;
    private _nodeDB;
    private _forgerDB;
    private readonly _mutex;
    constructor(genesisBlock: Record<string, unknown>, config?: PartialApplicationConfig);
    get networkIdentifier(): Buffer;
    static defaultApplication(genesisBlock: Record<string, unknown>, config?: PartialApplicationConfig): Application;
    registerPlugin(pluginKlass: typeof BasePlugin, options?: PluginOptions): void;
    overridePluginOptions(alias: string, options?: PluginOptions): void;
    registerModule(Module: typeof BaseModule): void;
    getSchema(): RegisteredSchema;
    getDefaultAccount(): Record<string, unknown>;
    getRegisteredModules(): RegisteredModule[];
    run(): Promise<void>;
    shutdown(errorCode?: number, message?: string): Promise<void>;
    private _registerModule;
    private _loadPlugins;
    private _initLogger;
    private _initChannel;
    private _initController;
    private _setupDirectories;
    private _emptySocketsDirectory;
    private _validatePidFile;
    private _clearControllerPidFile;
    private _getDBInstance;
}
