import { TransactionJSON } from '../transaction_types';
export interface SignRawTransactionInput {
    readonly passphrase: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
    readonly transaction: TransactionJSON;
}
export declare const signRawTransaction: ({ transaction, passphrase, secondPassphrase, timeOffset, }: SignRawTransactionInput) => TransactionJSON;
