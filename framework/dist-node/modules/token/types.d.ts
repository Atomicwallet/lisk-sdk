/// <reference types="node" />
export interface Asset {
    readonly amount: bigint;
    readonly recipientAddress: Buffer;
    readonly data: string;
}
export interface TokenAccount {
    token: {
        balance: bigint;
    };
}
