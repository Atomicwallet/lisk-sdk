import { TransactionJSON } from './transaction_types';
export interface RegisterDelegateInputs {
    readonly passphrase?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
    readonly username: string;
}
export declare const registerDelegate: (inputs: RegisterDelegateInputs) => Partial<TransactionJSON>;
