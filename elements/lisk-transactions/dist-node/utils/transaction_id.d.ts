import { TransactionError } from '../errors';
import { TransactionJSON } from '../transaction_types';
export declare const getId: (transactionBytes: Buffer) => string;
export declare const validateTransactionId: (id: string, bytes: Buffer) => TransactionError;
export declare const getTransactionId: (transaction: TransactionJSON) => string;
