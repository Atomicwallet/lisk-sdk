import { BaseTransaction, StateStore, StateStorePrepare, TransactionError, TransactionJSON } from '@liskhq/lisk-transactions';
export interface DappAsset {
    readonly dapp: {
        readonly category: number;
        readonly link: string;
        readonly name: string;
        readonly type: number;
        description?: string;
        icon?: string;
        tags?: string;
    };
}
export declare const dappAssetFormatSchema: {
    type: string;
    required: string[];
    properties: {
        dapp: {
            type: string;
            required: string[];
            properties: {
                icon: {
                    type: string;
                    format: string;
                    maxLength: number;
                };
                category: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                type: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                link: {
                    type: string;
                    format: string;
                    minLength: number;
                    maxLength: number;
                };
                tags: {
                    type: string;
                    format: string;
                    maxLength: number;
                };
                description: {
                    type: string;
                    format: string;
                    maxLength: number;
                };
                name: {
                    type: string;
                    format: string;
                    minLength: number;
                    maxLength: number;
                };
            };
        };
    };
};
export declare class DappTransaction extends BaseTransaction {
    readonly containsUniqueData: boolean;
    readonly asset: DappAsset;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): object;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(transactions: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(_: StateStore): ReadonlyArray<TransactionError>;
}
