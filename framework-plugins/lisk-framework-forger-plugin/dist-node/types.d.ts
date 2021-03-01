/// <reference types="node" />
export interface Options {
    version: string;
    readonly dataPath: string;
    readonly webhook: ReadonlyArray<Webhook>;
    readonly port: number;
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
export interface Webhook {
    readonly url: string;
    readonly events: ReadonlyArray<string>;
}
export interface Forger {
    readonly forging: boolean;
    readonly address: string;
}
export interface ForgerInfo {
    totalProducedBlocks: number;
    totalReceivedFees: bigint;
    totalReceivedRewards: bigint;
    votesReceived: Voters[];
}
export interface Voters {
    address: Buffer;
    amount: bigint;
}
export interface TransactionFees {
    readonly minFeePerByte: number;
    readonly baseFees: {
        readonly moduleID: number;
        readonly assetID: number;
        readonly baseFee: string;
    }[];
}
export interface Fees {
    readonly baseFee: string;
    readonly minFeePerByte: string;
}
export interface ForgetSyncInfo {
    syncUptoHeight: number;
}
export interface DPoSAccountJSON {
    dpos: {
        delegate: {
            username: string;
            totalVotesReceived: string;
            consecutiveMissedBlocks: number;
        };
    };
}
