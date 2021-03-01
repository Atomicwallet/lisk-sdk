/// <reference types="node" />
import { Transaction } from './types';
export interface TransactionListOptions {
    readonly maxSize?: number;
    readonly minReplacementFeeDifference?: bigint;
}
export declare const DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE: bigint;
declare type AddStatus = {
    added: true;
    removedID?: Buffer;
    reason?: undefined;
} | {
    added: false;
    removedID?: Buffer;
    reason: string;
};
export declare class TransactionList {
    readonly address: Buffer;
    private _processable;
    private readonly _transactions;
    private readonly _nonceHeap;
    private readonly _maxSize;
    private readonly _minReplacementFeeDifference;
    constructor(address: Buffer, options?: TransactionListOptions);
    get(nonce: bigint): Transaction | undefined;
    add(incomingTx: Transaction, processable?: boolean): AddStatus;
    remove(nonce: bigint): Buffer | undefined;
    promote(txs: ReadonlyArray<Transaction>): boolean;
    get size(): number;
    getProcessable(): ReadonlyArray<Transaction>;
    getUnprocessable(): ReadonlyArray<Transaction>;
    getPromotable(): ReadonlyArray<Transaction>;
    private _demoteAfter;
    private _highestNonce;
    private _sortProcessable;
}
export {};
