import { TransactionJSON } from './transaction_types';
export interface SecondPassphraseInputs {
    readonly passphrase?: string;
    readonly secondPassphrase: string;
    readonly timeOffset?: number;
}
export declare const registerSecondPassphrase: (inputs: SecondPassphraseInputs) => Partial<TransactionJSON>;
