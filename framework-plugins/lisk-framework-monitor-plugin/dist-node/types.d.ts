export interface Options {
    readonly port: number;
    readonly host: string;
    readonly whiteList: ReadonlyArray<string>;
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly limits: {
        readonly max: number;
        readonly delayMs: number;
        readonly delayAfter: number;
        readonly windowMs: number;
        readonly headersTimeout: number;
        readonly serverSetTimeout: number;
    };
}
interface BlockHeader {
    blockHeader: object;
    timeReceived: number;
}
export interface TransactionPropagationStats {
    count: number;
    timeReceived: number;
}
export interface BlockPropagationStats {
    count: number;
    height: number;
}
export interface SharedState {
    forks: {
        forkEventCount: number;
        blockHeaders: Record<string, BlockHeader>;
    };
    transactions: Record<string, TransactionPropagationStats>;
    blocks: {
        [key: string]: BlockPropagationStats;
    };
}
export interface PeerInfo {
    readonly ipAddress: string;
    readonly port: number;
    readonly networkIdentifier: string;
    readonly networkVersion: string;
    readonly nonce: string;
    readonly options: {
        [key: string]: unknown;
    };
}
export {};
