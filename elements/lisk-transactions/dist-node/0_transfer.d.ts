import { TransactionJSON } from './transaction_types';
export interface TransferInputs {
    readonly amount: string;
    readonly data?: string;
    readonly passphrase?: string;
    readonly recipientId?: string;
    readonly recipientPublicKey?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
}
export declare const transfer: (inputs: TransferInputs) => Partial<TransactionJSON>;
