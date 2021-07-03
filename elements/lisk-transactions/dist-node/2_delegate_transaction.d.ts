/// <reference types="node" />
import { BaseTransaction, StateStore, StateStorePrepare } from './base_transaction';
import { TransactionError } from './errors';
import { TransactionJSON } from './transaction_types';
export interface DelegateAsset {
    readonly delegate: {
        readonly username: string;
    };
}
export declare const delegateAssetFormatSchema: {
    type: string;
    required: string[];
    properties: {
        delegate: {
            type: string;
            required: string[];
            properties: {
                username: {
                    type: string;
                    minLength: number;
                    maxLength: number;
                    format: string;
                };
            };
        };
    };
};
export declare class DelegateTransaction extends BaseTransaction {
    readonly asset: DelegateAsset;
    readonly containsUniqueData: boolean;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): DelegateAsset;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(transactions: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected assetFromSync(raw: any): object | undefined;
}
