/// <reference types="node" />
import { APIClient } from '@liskhq/lisk-api-client';
import { Block } from '@liskhq/lisk-chain';
import { ModuleClass } from './types';
import { PartialApplicationConfig } from '../types';
import { Application } from '../application';
import { InstantiablePlugin } from '../plugins/base_plugin';
interface ApplicationEnvConfig {
    modules: ModuleClass[];
    plugins?: InstantiablePlugin[];
    config?: PartialApplicationConfig;
    genesisBlockJSON?: Record<string, unknown>;
}
export declare class ApplicationEnv {
    private _application;
    private _dataPath;
    private _ipcClient;
    constructor(appConfig: ApplicationEnvConfig);
    get application(): Application;
    get ipcClient(): APIClient;
    get dataPath(): string;
    get networkIdentifier(): Buffer;
    get lastBlock(): Block;
    startApplication(): Promise<void>;
    stopApplication(options?: {
        clearDB: boolean;
    }): Promise<void>;
    waitNBlocks(n?: number): Promise<void>;
    private _initApplication;
}
export declare const createDefaultApplicationEnv: (appEnvConfig: Partial<ApplicationEnvConfig>) => ApplicationEnv;
export {};
