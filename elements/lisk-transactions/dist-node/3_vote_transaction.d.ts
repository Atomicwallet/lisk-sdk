import { BaseTransaction, StateStore, StateStorePrepare } from './base_transaction';
import { TransactionError } from './errors';
import { TransactionJSON } from './transaction_types';
import { CreateBaseTransactionInput } from './utils';
export interface VoteAsset {
    readonly votes: ReadonlyArray<string>;
}
export interface CreateVoteAssetInput {
    readonly unvotes?: ReadonlyArray<string>;
    readonly votes?: ReadonlyArray<string>;
}
export declare type CastVoteInput = CreateBaseTransactionInput & CreateVoteAssetInput;
export declare const voteAssetFormatSchema: {
    type: string;
    required: string[];
    properties: {
        votes: {
            type: string;
            minItems: number;
            maxItems: number;
            items: {
                type: string;
                format: string;
            };
            uniqueSignedPublicKeys: boolean;
        };
    };
};
export declare class VoteTransaction extends BaseTransaction {
    readonly containsUniqueData: boolean;
    readonly asset: VoteAsset;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): object;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(transactions: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected assetFromSync(raw: any): object | undefined;
}
