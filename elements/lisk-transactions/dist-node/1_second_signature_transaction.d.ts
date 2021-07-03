import { BaseTransaction, StateStore, StateStorePrepare } from './base_transaction';
import { TransactionError } from './errors';
import { TransactionJSON } from './transaction_types';
export interface SecondSignatureAsset {
    readonly signature: {
        readonly publicKey: string;
    };
}
export declare const secondSignatureAssetFormatSchema: {
    type: string;
    required: string[];
    properties: {
        signature: {
            type: string;
            required: string[];
            properties: {
                publicKey: {
                    type: string;
                    format: string;
                };
            };
        };
    };
};
export declare class SecondSignatureTransaction extends BaseTransaction {
    readonly asset: SecondSignatureAsset;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): object;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(transactions: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
    sign(passphrase: string): void;
    protected assetFromSync(raw: any): object | undefined;
}
