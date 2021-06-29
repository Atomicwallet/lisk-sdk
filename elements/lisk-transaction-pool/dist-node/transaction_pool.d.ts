/// <reference types="node" />
import { EventEmitter } from 'events';
import { dataStructures } from '@liskhq/lisk-utils';
import { Status, Transaction } from './types';
interface BaseFee {
    readonly moduleID: number;
    readonly assetID: number;
    readonly baseFee: bigint;
}
export interface TransactionPoolConfig {
    readonly maxTransactions?: number;
    readonly maxTransactionsPerAccount?: number;
    readonly transactionExpiryTime?: number;
    readonly minEntranceFeePriority?: bigint;
    readonly transactionReorganizationInterval?: number;
    readonly minReplacementFeeDifference?: bigint;
    readonly minFeePerByte: number;
    readonly baseFees: BaseFee[];
    applyTransactions(transactions: ReadonlyArray<Transaction>): Promise<void>;
}
interface AddTransactionResponse {
    readonly status: Status;
    readonly error?: Error;
}
export declare const DEFAULT_MAX_TRANSACTIONS = 4096;
export declare const DEFAULT_MAX_TRANSACTIONS_PER_ACCOUNT = 64;
export declare const DEFAULT_MIN_ENTRANCE_FEE_PRIORITY: bigint;
export declare const DEFAULT_EXPIRY_TIME: number;
export declare const DEFAULT_EXPIRE_INTERVAL: number;
export declare const DEFAULT_MINIMUM_REPLACEMENT_FEE_DIFFERENCE: bigint;
export declare const DEFAULT_REORGANIZE_TIME = 500;
export declare const events: {
    EVENT_TRANSACTION_REMOVED: string;
};
export declare class TransactionPool {
    events: EventEmitter;
    private readonly _allTransactions;
    private readonly _transactionList;
    private readonly _applyFunction;
    private readonly _maxTransactions;
    private readonly _maxTransactionsPerAccount;
    private readonly _transactionExpiryTime;
    private readonly _minEntranceFeePriority;
    private readonly _transactionReorganizationInterval;
    private readonly _minReplacementFeeDifference;
    private readonly _minFeePerByte;
    private readonly _baseFees;
    private readonly _reorganizeJob;
    private readonly _feePriorityQueue;
    private readonly _expireJob;
    constructor(config: TransactionPoolConfig);
    start(): Promise<void>;
    stop(): void;
    getAll(): ReadonlyArray<Transaction>;
    get(id: Buffer): Transaction | undefined;
    contains(id: Buffer): boolean;
    add(incomingTx: Transaction): Promise<AddTransactionResponse>;
    remove(tx: Transaction): boolean;
    getProcessableTransactions(): dataStructures.BufferMap<Transaction[]>;
    private _calculateFeePriority;
    private _calculateMinFee;
    private _getStatus;
    private _evictUnprocessable;
    private _evictProcessable;
    private _reorganize;
    private _expire;
}
export {};
