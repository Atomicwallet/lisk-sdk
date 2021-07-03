/// <reference types="node" />
import { EventEmitter } from 'events';
import { CheckerFunction, TransactionResponse } from './check_transactions';
import { Queue } from './queue';
export interface TransactionObject {
    readonly id: string;
    receivedAt?: Date;
    readonly recipientId: string;
    readonly senderPublicKey: string;
    signatures?: ReadonlyArray<string>;
    readonly type: number;
    readonly senderId: string;
    containsUniqueData?: boolean;
    verifiedOnce?: boolean;
}
export interface SignatureObject {
    transactionId: string;
    signature: string;
    publicKey: string;
}
export interface TransactionFunctions {
    isExpired(date: Date): boolean;
    verifyAgainstOtherTransactions(otherTransactions: ReadonlyArray<Transaction>): boolean;
    addVerifiedSignature(signature: string): TransactionResponse;
    isReady(): boolean;
}
export interface TransactionPoolConfiguration {
    readonly expireTransactionsInterval: number;
    readonly maxTransactionsPerQueue: number;
    readonly receivedTransactionsLimitPerProcessing: number;
    readonly receivedTransactionsProcessingInterval: number;
    readonly validatedTransactionsLimitPerProcessing: number;
    readonly validatedTransactionsProcessingInterval: number;
    readonly verifiedTransactionsLimitPerProcessing: number;
    readonly verifiedTransactionsProcessingInterval: number;
    readonly pendingTransactionsProcessingLimit: number;
}
export interface AddTransactionResult {
    readonly alreadyExists: boolean;
    readonly isFull: boolean;
    readonly queueName: QueueNames;
}
interface TransactionPoolDependencies {
    processTransactions: CheckerFunction;
    validateTransactions: CheckerFunction;
    verifyTransactions: CheckerFunction;
}
declare type TransactionPoolOptions = TransactionPoolConfiguration & TransactionPoolDependencies;
export declare type Transaction = TransactionObject & TransactionFunctions;
export declare type QueueNames = 'received' | 'validated' | 'verified' | 'pending' | 'ready';
interface Queues {
    readonly [queue: string]: Queue;
}
export declare const EVENT_ADDED_TRANSACTIONS = "transactionsAdded";
export declare const EVENT_REMOVED_TRANSACTIONS = "transactionsRemoved";
export declare const EVENT_VERIFIED_TRANSACTION_ONCE = "transactionVerifiedOnce";
export declare const ACTION_ADD_VERIFIED_REMOVED_TRANSACTIONS = "addVerifiedRemovedTransactions";
export declare const ACTION_REMOVE_CONFIRMED_TRANSACTIONS = "removeConfirmedTransactions";
export declare const ACTION_ADD_TRANSACTIONS = "addTransactions";
export declare const ACTION_EXPIRE_TRANSACTIONS = "expireTransactions";
export declare const ACTION_PROCESS_VERIFIED_TRANSACTIONS = "processVerifiedTransactions";
export declare const ACTION_VALIDATE_RECEIVED_TRANSACTIONS = "validateReceivedTransactions";
export declare const ACTION_VERIFY_VALIDATED_TRANSACTIONS = "verifyValidatedTransactions";
export declare const ACTION_ADD_VERIFIED_TRANSACTIONS = "addVerifiedTransactions";
export declare const ACTION_ADD_PENDING_TRANSACTIONS = "addPendingTransactions";
export declare class TransactionPool extends EventEmitter {
    private readonly _pendingTransactionsProcessingLimit;
    private readonly _expireTransactionsInterval;
    private readonly _expireTransactionsJob;
    private readonly _maxTransactionsPerQueue;
    private readonly _queues;
    private readonly _receivedTransactionsProcessingInterval;
    private readonly _receivedTransactionsProcessingLimitPerInterval;
    private readonly _validatedTransactionsProcessingInterval;
    private readonly _validatedTransactionsProcessingLimitPerInterval;
    private readonly _verifiedTransactionsProcessingInterval;
    private readonly _verifiedTransactionsProcessingLimitPerInterval;
    private readonly _validateTransactions;
    private readonly _validateTransactionsJob;
    private readonly _verifyTransactions;
    private readonly _verifyTransactionsJob;
    private readonly _processTransactions;
    private readonly _processTransactionsJob;
    constructor({ expireTransactionsInterval, maxTransactionsPerQueue, receivedTransactionsProcessingInterval, receivedTransactionsLimitPerProcessing, validatedTransactionsProcessingInterval, validatedTransactionsLimitPerProcessing, verifiedTransactionsProcessingInterval, verifiedTransactionsLimitPerProcessing, pendingTransactionsProcessingLimit, validateTransactions, verifyTransactions, processTransactions, }: TransactionPoolOptions);
    cleanup(): void;
    addTransaction(transaction: Transaction): AddTransactionResult;
    addPendingTransaction(transaction: Transaction): AddTransactionResult;
    addVerifiedTransaction(transaction: Transaction): AddTransactionResult;
    addVerifiedRemovedTransactions(transactions: ReadonlyArray<Transaction>): void;
    addVerifiedSignature(signatureObject: SignatureObject): TransactionResponse;
    existsInTransactionPool(id: string): boolean;
    findInTransactionPool(id: string): Transaction | undefined;
    get queues(): Queues;
    getProcessableTransactions(limit: number): ReadonlyArray<Transaction>;
    removeConfirmedTransactions(transactions: ReadonlyArray<Transaction>): void;
    reverifyTransactionsFromSenders(senderPublicKeys: ReadonlyArray<string>): void;
    validateTransactionAgainstTransactionsInPool(transaction: Transaction): boolean;
    private addTransactionToQueue;
    private expireTransactions;
    private processVerifiedTransactions;
    private removeTransactionsFromQueues;
    private validateReceivedTransactions;
    private verifyValidatedTransactions;
}
export {};
