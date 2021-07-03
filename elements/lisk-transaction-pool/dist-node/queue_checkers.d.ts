import { Transaction } from './transaction_pool';
export declare type TransactionFilterableKeys = 'id' | 'recipientId' | 'senderPublicKey' | 'senderId' | 'type';
export declare const checkTransactionPropertyForValues: (values: ReadonlyArray<string | number>, propertyName: TransactionFilterableKeys) => (transaction: Transaction) => boolean;
export declare const returnTrueUntilLimit: (limit: number) => (transaction: Transaction) => boolean;
export declare const checkTransactionForExpiry: () => (transaction: Transaction) => boolean;
export declare const checkTransactionForSenderPublicKey: (transactions: ReadonlyArray<Transaction>) => (transaction: Transaction) => boolean;
export declare const checkTransactionForId: (transactions: ReadonlyArray<Transaction>) => (transaction: Transaction) => boolean;
export declare const checkTransactionForSenderIdWithRecipientIds: (transactions: ReadonlyArray<Transaction>) => (transaction: Transaction) => boolean;
export declare const checkTransactionForTypes: (transactions: ReadonlyArray<Transaction>) => (transaction: Transaction) => boolean;
