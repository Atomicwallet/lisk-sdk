import { Transaction } from './transaction_pool';
interface QueueIndex {
    [index: string]: Transaction | undefined;
}
export declare class Queue {
    private readonly _index;
    private _transactions;
    readonly transactions: ReadonlyArray<Transaction>;
    readonly index: QueueIndex;
    constructor();
    dequeueUntil(condition: (transaction: Transaction) => boolean): ReadonlyArray<Transaction>;
    enqueueMany(transactions: ReadonlyArray<Transaction>): void;
    enqueueOne(transaction: Transaction): void;
    exists(id: string): boolean;
    filter(condition: (transaction: Transaction) => boolean): ReadonlyArray<Transaction>;
    peekUntil(condition: (transaction: Transaction) => boolean): ReadonlyArray<Transaction>;
    removeFor(condition: (transaction: Transaction) => boolean): ReadonlyArray<Transaction>;
    size(): number;
    sizeBy(condition: (transaction: Transaction) => boolean): number;
}
export {};
