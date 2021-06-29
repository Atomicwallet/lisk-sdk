/// <reference types="node" />
import { APIClient } from '@liskhq/lisk-api-client';
import { Account, AccountDefaultProps } from '@liskhq/lisk-chain';
import { BaseAsset, BaseModule } from '../modules';
import { BasePlugin } from '../plugins/base_plugin';
import { GenesisConfig } from '../types';
export declare type AssetClass<T = any> = new (args?: T) => BaseAsset;
export declare type ModuleClass<T = BaseModule> = new (genesisConfig: GenesisConfig) => T;
export declare type PartialAccount<T = AccountDefaultProps> = Partial<Account<T>> & {
    address: Buffer;
};
export interface Data {
    readonly block: string;
}
export interface WaitUntilBlockHeightOptions {
    apiClient: APIClient;
    height: number;
    timeout?: number;
}
export declare type PluginClass = typeof BasePlugin;
