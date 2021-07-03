import { BaseTransaction, StateStore, StateStorePrepare } from './base_transaction';
import { TransactionError } from './errors';
import { TransactionJSON } from './transaction_types';
export interface TransferAsset {
    readonly data: string;
}
export declare const transferAssetFormatSchema: {
    type: string;
    properties: {
        data: {
            type: string;
            format: string;
            maxLength: number;
        };
    };
};
export declare class TransferTransaction extends BaseTransaction {
    readonly asset: TransferAsset;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): TransferAsset;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(_: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected assetFromSync(raw: any): object | undefined;
}
