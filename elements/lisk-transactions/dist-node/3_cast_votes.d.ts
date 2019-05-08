import { TransactionJSON } from './transaction_types';
export interface CastVoteInputs {
    readonly passphrase?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
    readonly unvotes?: ReadonlyArray<string>;
    readonly votes?: ReadonlyArray<string>;
}
export declare const castVotes: (inputs: CastVoteInputs) => Partial<TransactionJSON>;
