/// <reference types="node" />
import { BlockHeader } from '@liskhq/lisk-chain';
export interface RegisteredDelegate {
    readonly username: string;
    readonly address: Buffer;
}
export interface RegisteredDelegates {
    registeredDelegates: RegisteredDelegate[];
}
export interface DelegatePersistedUsernames {
    readonly registeredDelegates: RegisteredDelegate[];
}
export interface UnlockingAccountAsset {
    readonly delegateAddress: Buffer;
    readonly amount: bigint;
    readonly unvoteHeight: number;
}
export interface UnlockingInfoJSON {
    readonly delegateAddress: string;
    readonly amount: string;
    readonly unvoteHeight: number;
    readonly minUnlockHeight: number;
}
export interface VoteAccountAsset {
    readonly delegateAddress: Buffer;
    amount: bigint;
}
export interface DPOSAccountProps {
    dpos: {
        delegate: {
            username: string;
            pomHeights: number[];
            consecutiveMissedBlocks: number;
            lastForgedHeight: number;
            isBanned: boolean;
            totalVotesReceived: bigint;
        };
        sentVotes: VoteAccountAsset[];
        unlocking: UnlockingAccountAsset[];
    };
}
export interface UnlockTransactionAssetContext {
    readonly unlockObjects: ReadonlyArray<UnlockingAccountAsset>;
}
export interface RegisterTransactionAssetContext {
    readonly username: string;
}
export interface VoteTransactionAssetContext {
    readonly votes: ReadonlyArray<VoteAccountAsset>;
}
export interface BlockHeaderAssetForDPOS {
    readonly seedReveal: Buffer;
    readonly maxHeightPreviouslyForged: number;
    readonly maxHeightPrevoted: number;
}
export interface PomTransactionAssetContext {
    readonly header1: BlockHeader<BlockHeaderAssetForDPOS>;
    readonly header2: BlockHeader<BlockHeaderAssetForDPOS>;
}
export interface DelegateWeight {
    readonly address: Buffer;
    readonly voteWeight: bigint;
}
export interface VoteWeight {
    readonly round: number;
    readonly delegates: ReadonlyArray<DelegateWeight>;
}
export declare type VoteWeights = VoteWeight[];
export interface DecodedVoteWeights {
    voteWeights: VoteWeights;
}
declare type Grow<T, A extends T[]> = ((x: T, ...xs: A) => void) extends (...a: infer X) => void ? X : never;
declare type GrowToSize<T, A extends T[], N extends number> = {
    readonly 0: A;
    readonly 1: GrowToSize<T, Grow<T, A>, N>;
}[A['length'] extends N ? 0 : 1];
export declare type FixedLengthArray<T, N extends number> = GrowToSize<T, [], N>;
export declare type RandomSeed = Buffer;
export {};
