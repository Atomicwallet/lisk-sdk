/// <reference types="node" />
export declare type Transaction = TransactionObject & TransactionFunctions;
export interface TransactionObject {
    readonly id: Buffer;
    readonly moduleID: number;
    readonly assetID: number;
    readonly nonce: bigint;
    readonly fee: bigint;
    readonly senderPublicKey: Buffer;
    receivedAt?: Date;
    feePriority?: bigint;
}
export interface TransactionFunctions {
    getBytes: () => Buffer;
}
export declare enum Status {
    FAIL = 0,
    OK = 1
}
export declare enum TransactionStatus {
    INVALID = 0,
    UNPROCESSABLE = 1,
    PROCESSABLE = 2
}
