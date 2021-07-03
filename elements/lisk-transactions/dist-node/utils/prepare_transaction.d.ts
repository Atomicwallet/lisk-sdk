import { TransactionJSON } from '../transaction_types';
export declare const prepareTransaction: (partialTransaction: Partial<TransactionJSON>, passphrase?: string, secondPassphrase?: string, timeOffset?: number) => TransactionJSON;
