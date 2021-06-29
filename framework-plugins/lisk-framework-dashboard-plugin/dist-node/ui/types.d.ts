export interface Account {
    base32Address: string;
    binaryAddress: string;
    publicKey: string;
    passphrase?: string;
}
export interface GenesisConfig {
    [key: string]: unknown;
    readonly bftThreshold: number;
    readonly communityIdentifier: string;
    readonly blockTime: number;
    readonly maxPayloadLength: number;
    readonly rewards: {
        readonly milestones: string[];
        readonly offset: number;
        readonly distance: number;
    };
    readonly minFeePerByte: number;
    readonly baseFees: {
        readonly moduleID: number;
        readonly assetID: number;
        readonly baseFee: string;
    }[];
}
export interface NodeInfo {
    readonly version: string;
    readonly networkVersion: string;
    readonly networkIdentifier: string;
    readonly lastBlockID: string;
    readonly height: number;
    readonly finalizedHeight: number;
    readonly syncing: boolean;
    readonly unconfirmedTransactions: number;
    readonly genesisConfig: GenesisConfig;
    readonly registeredModules: RegisteredModule[];
}
export interface Fee {
    moduleId: number;
    assetId: number;
    baseFee: number;
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
export interface BlockHeader {
    id: string;
    generatorPublicKey: string;
    height: number;
}
export interface Block {
    header: BlockHeader;
    payload: Transaction[];
}
export interface Transaction {
    id: string;
    senderPublicKey: string;
    moduleID: number;
    assetID: number;
    fee: number;
}
export interface EventData {
    name: string;
    data: Record<string, unknown>;
}
export interface SendTransactionOptions {
    moduleID: number;
    assetID: number;
    asset: Record<string, unknown>;
    passphrase: string;
}
export interface CallActionOptions {
    name: string;
    params: Record<string, unknown>;
}
