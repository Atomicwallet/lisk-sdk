/// <reference types="node" />
import { p2pTypes } from '@liskhq/lisk-p2p';
import { Validator, AccountSchema as ChainAccountSchema, Transaction, GenesisBlock, Block, AccountDefaultProps, Account, BlockHeader } from '@liskhq/lisk-chain';
import { Schema } from '@liskhq/lisk-codec';
export interface SocketPaths {
    readonly pub: string;
    readonly sub: string;
    readonly rpc: string;
    readonly root: string;
}
export interface StringKeyVal {
    [key: string]: string;
}
export interface SeedPeerInfo {
    readonly ip: string;
    readonly port: number;
}
export interface P2PRequestPeerPacket extends p2pTypes.P2PRequestPacket {
    readonly peerId: string;
}
export interface RPCBlocksByIdData {
    readonly blockId: Buffer;
}
export interface EventPostBlockData {
    readonly block: Buffer;
}
export interface EventPostTransactionData {
    readonly transaction: string;
}
export interface EventPostTransactionsAnnouncementData {
    readonly transactionIds: Buffer[];
}
export interface RPCTransactionsByIdData {
    readonly transactionIds: Buffer[];
}
export interface RPCHighestCommonBlockData {
    readonly ids: Buffer[];
}
export interface PluginOptions extends Record<string, unknown> {
    readonly loadAsChildProcess?: boolean;
    readonly alias?: string;
}
export interface AppConfigForPlugin {
    readonly rootPath: string;
    readonly version: string;
    readonly networkVersion: string;
    readonly genesisConfig: GenesisConfig;
    readonly label: string;
    readonly logger: {
        readonly consoleLogLevel: string;
        readonly fileLogLevel: string;
    };
}
export interface PluginOptionsWithAppConfig extends PluginOptions {
    readonly dataPath: string;
    appConfig: AppConfigForPlugin;
}
export interface DelegateConfig {
    readonly address: string;
    readonly encryptedPassphrase: string;
    readonly hashOnion: {
        readonly count: number;
        readonly distance: number;
        readonly hashes: string[];
    };
}
export interface NetworkConfig {
    port: number;
    seedPeers: {
        ip: string;
        port: number;
    }[];
    hostIp?: string;
    blacklistedIPs?: string[];
    fixedPeers?: {
        ip: string;
        port: number;
    }[];
    whitelistedPeers?: {
        ip: string;
        port: number;
    }[];
    peerBanTime?: number;
    connectTimeout?: number;
    ackTimeout?: number;
    maxOutboundConnections?: number;
    maxInboundConnections?: number;
    sendPeerLimit?: number;
    maxPeerDiscoveryResponseLength?: number;
    maxPeerInfoSize?: number;
    wsMaxPayload?: number;
    advertiseAddress?: boolean;
    customSchema?: p2pTypes.RPCSchemas;
}
export interface GenesisConfig {
    [key: string]: unknown;
    bftThreshold: number;
    communityIdentifier: string;
    blockTime: number;
    maxPayloadLength: number;
    rewards: {
        milestones: string[];
        offset: number;
        distance: number;
    };
    minFeePerByte: number;
    baseFees: {
        moduleID: number;
        assetID: number;
        baseFee: string;
    }[];
}
export interface TransactionPoolConfig {
    readonly maxTransactions?: number;
    readonly maxTransactionsPerAccount?: number;
    readonly transactionExpiryTime?: number;
    readonly minEntranceFeePriority?: string;
    readonly minReplacementFeeDifference?: string;
}
declare type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
interface RPCConfig {
    enable: boolean;
    mode: 'ipc' | 'ws';
    port: number;
}
export interface ApplicationConfig {
    label: string;
    version: string;
    networkVersion: string;
    rootPath: string;
    forging: {
        waitThreshold: number;
        delegates: DelegateConfig[];
        force?: boolean;
        defaultPassword?: string;
    };
    network: NetworkConfig;
    logger: {
        logFileName: string;
        fileLogLevel: string;
        consoleLogLevel: string;
    };
    genesisConfig: GenesisConfig;
    plugins: {
        [key: string]: PluginOptions;
    };
    transactionPool: TransactionPoolConfig;
    rpc: RPCConfig;
}
export declare type PartialApplicationConfig = RecursivePartial<ApplicationConfig>;
export interface ActionInfoForBus {
    readonly module: string;
    readonly name: string;
}
export interface TransactionJSON {
    readonly moduleID: number;
    readonly assetID: number;
    readonly nonce: string;
    readonly fee: string;
    readonly senderPublicKey: string;
    readonly signatures: Array<Readonly<string>>;
    readonly id: string;
    readonly asset: object;
}
export interface StateStore {
    readonly account: {
        get<T = AccountDefaultProps>(address: Buffer): Promise<Account<T>>;
        getOrDefault<T = AccountDefaultProps>(address: Buffer): Promise<Account<T>>;
        set<T = AccountDefaultProps>(address: Buffer, updatedElement: Account<T>): Promise<void>;
        del(address: Buffer): Promise<void>;
    };
    readonly chain: {
        lastBlockHeaders: ReadonlyArray<BlockHeader>;
        lastBlockReward: bigint;
        networkIdentifier: Buffer;
        get(key: string): Promise<Buffer | undefined>;
        set(key: string, value: Buffer): Promise<void>;
    };
}
export interface ReducerHandler {
    invoke: <T = unknown>(name: string, params?: Record<string, unknown>) => Promise<T>;
}
export interface Reducers {
    [key: string]: (params: Record<string, unknown>, stateStore: StateStore) => Promise<unknown>;
}
export interface Actions {
    [key: string]: (params: Record<string, unknown>) => Promise<unknown>;
}
export interface TransactionApplyContext {
    transaction: Transaction;
    stateStore: StateStore;
    reducerHandler: ReducerHandler;
}
export interface AfterGenesisBlockApplyContext<T = unknown> {
    genesisBlock: GenesisBlock<T>;
    stateStore: StateStore;
    reducerHandler: ReducerHandler;
}
export interface BeforeBlockApplyContext {
    block: Block;
    stateStore: StateStore;
    reducerHandler: ReducerHandler;
}
export interface AfterBlockApplyContext extends BeforeBlockApplyContext {
    consensus: Consensus;
}
export interface ApplyAssetContext<T> {
    asset: T;
    stateStore: StateStore;
    reducerHandler: ReducerHandler;
    transaction: Transaction;
}
export interface ValidateAssetContext<T> {
    asset: T;
    transaction: Transaction;
}
export declare type Delegate = Omit<Validator, 'minActiveHeight'>;
export declare type AccountSchema = Omit<ChainAccountSchema, 'fieldNumber'>;
export interface Consensus {
    getDelegates: () => Promise<Delegate[]>;
    updateDelegates: (delegates: Delegate[]) => Promise<void>;
    getFinalizedHeight: () => number;
}
export interface BaseModuleDataAccess {
    getChainState(key: string): Promise<Buffer | undefined>;
    getAccountByAddress<T>(address: Buffer): Promise<Account<T>>;
    getLastBlockHeader(): Promise<BlockHeader>;
}
export interface RegisteredModule {
    id: number;
    name: string;
    actions: string[];
    events: string[];
    reducers: string[];
    transactionAssets: {
        id: number;
        name: string;
    }[];
}
export interface RegisteredSchema {
    account: Schema;
    block: Schema;
    blockHeader: Schema;
    blockHeadersAssets: {
        [version: number]: Schema;
    };
    transaction: Schema;
    transactionsAssets: {
        moduleID: number;
        moduleName: string;
        assetID: number;
        assetName: string;
        schema: Schema;
    }[];
}
export interface SchemaWithDefault extends Schema {
    readonly default?: Record<string, unknown>;
}
export interface ForgingStatus {
    readonly address: Buffer;
    readonly forging: boolean;
    readonly height?: number;
    readonly maxHeightPrevoted?: number;
    readonly maxHeightPreviouslyForged?: number;
}
export interface UpdateForgingStatusInput {
    readonly address: string;
    readonly password: string;
    readonly forging: boolean;
    readonly height: number;
    readonly maxHeightPreviouslyForged: number;
    readonly maxHeightPrevoted: number;
    readonly overwrite?: boolean;
}
export {};
