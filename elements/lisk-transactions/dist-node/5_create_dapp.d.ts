import { TransactionJSON } from './transaction_types';
export interface DappOptions {
    readonly category: number;
    readonly description: string;
    readonly icon: string;
    readonly link: string;
    readonly name: string;
    readonly tags: string;
    readonly type: number;
}
export interface DappInputs {
    readonly options: DappOptions;
    readonly passphrase?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
}
export declare const createDapp: (inputs: DappInputs) => Partial<TransactionJSON>;
