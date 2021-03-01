import { BlockHeaderWithReceivedAt as BlockHeader } from './types';
export declare const forgingSlot: (slots: import("@liskhq/lisk-chain").Slots, block: BlockHeader) => number;
export declare const isBlockReceivedWithinForgingSlot: (slots: import("@liskhq/lisk-chain").Slots, { timestamp, receivedAt }: BlockHeader) => boolean;
export declare const isLastAppliedBlockReceivedWithinForgingSlot: (slots: import("@liskhq/lisk-chain").Slots, lastAppliedBlock: BlockHeader) => boolean;
export declare const isValidBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isIdenticalBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isDuplicateBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isDoubleForging: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isTieBreak: ({ slots, lastAppliedBlock, receivedBlock, }: {
    readonly slots: import("@liskhq/lisk-chain").Slots;
    readonly lastAppliedBlock: BlockHeader;
    readonly receivedBlock: BlockHeader;
}) => boolean;
export declare const isDifferentChain: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
