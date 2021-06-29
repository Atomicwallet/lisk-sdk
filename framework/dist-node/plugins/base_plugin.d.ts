/// <reference types="node" />
import { RawBlock } from '@liskhq/lisk-chain';
import { ActionsDefinition } from '../controller/action';
import { BaseChannel } from '../controller/channels';
import { EventsDefinition } from '../controller/event';
import { Logger } from '../logger';
import { PluginOptionsWithAppConfig, RegisteredSchema, SchemaWithDefault, TransactionJSON } from '../types';
interface DefaultAccountJSON {
    [name: string]: {
        [key: string]: unknown;
    } | undefined;
}
declare type AccountJSON<T = DefaultAccountJSON> = T & {
    address: string;
};
interface BlockJSON {
    readonly header: BlockHeaderJSON;
    readonly payload: ReadonlyArray<TransactionJSON>;
}
interface BaseBlockHeaderJSON {
    readonly id: string;
    readonly version: number;
    readonly timestamp: number;
    readonly height: number;
    readonly previousBlockID: string;
    readonly transactionRoot: string;
    readonly generatorPublicKey: string;
    readonly reward: string;
    readonly signature: string;
    readonly asset: string;
}
export declare type BlockHeaderJSON = Omit<BaseBlockHeaderJSON, 'asset'> & {
    asset: BlockAssetJSON;
};
interface BlockAssetJSON {
    readonly seedReveal: string;
    readonly maxHeightPreviouslyForged: number;
    readonly maxHeightPrevoted: number;
}
export interface PluginInfo {
    readonly author: string;
    readonly version: string;
    readonly name: string;
    readonly exportPath?: string;
}
declare type ExtractPluginOptions<P> = P extends BasePlugin<infer T> ? T : PluginOptionsWithAppConfig;
export interface InstantiablePlugin<T extends BasePlugin = BasePlugin> {
    alias: string;
    info: PluginInfo;
    new (args: ExtractPluginOptions<T>): T;
}
export interface PluginCodec {
    decodeAccount: <T = DefaultAccountJSON>(data: Buffer | string) => AccountJSON<T>;
    decodeBlock: (data: Buffer | string) => BlockJSON;
    decodeRawBlock: (data: Buffer | string) => RawBlock;
    decodeTransaction: (data: Buffer | string) => TransactionJSON;
    encodeTransaction: (transaction: TransactionJSON) => string;
}
export declare abstract class BasePlugin<T extends PluginOptionsWithAppConfig = PluginOptionsWithAppConfig> {
    readonly options: T;
    schemas: RegisteredSchema;
    codec: PluginCodec;
    protected _logger: Logger;
    constructor(options: T);
    init(channel: BaseChannel): Promise<void>;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): SchemaWithDefault | object | undefined;
    abstract get events(): EventsDefinition;
    abstract get actions(): ActionsDefinition;
    abstract load(channel: BaseChannel): Promise<void>;
    abstract unload(): Promise<void>;
}
export declare const getPluginExportPath: (pluginKlass: InstantiablePlugin, strict?: boolean) => string | undefined;
export declare const validatePluginSpec: (PluginKlass: InstantiablePlugin, options?: Record<string, unknown>) => void;
export {};
