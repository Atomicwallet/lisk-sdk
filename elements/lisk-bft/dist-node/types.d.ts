import { BlockHeader } from '@liskhq/lisk-chain';
export declare enum ForkStatus {
    IDENTICAL_BLOCK = 1,
    VALID_BLOCK = 2,
    DOUBLE_FORGING = 3,
    TIE_BREAK = 4,
    DIFFERENT_CHAIN = 5,
    DISCARD = 6
}
export declare class BFTError extends Error {
}
export declare class BFTInvalidAttributeError extends BFTError {
}
export interface BFTPersistedValues {
    readonly finalizedHeight: number;
}
export declare type BlockHeaderWithReceivedAt = BlockHeader & {
    receivedAt?: number;
};
