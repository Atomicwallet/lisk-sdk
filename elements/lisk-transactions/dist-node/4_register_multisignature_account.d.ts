import { TransactionJSON } from './transaction_types';
export interface RegisterMultisignatureInputs {
    readonly keysgroup: ReadonlyArray<string>;
    readonly lifetime: number;
    readonly minimum: number;
    readonly passphrase?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
}
export declare const registerMultisignature: (inputs: RegisterMultisignatureInputs) => Partial<TransactionJSON>;
