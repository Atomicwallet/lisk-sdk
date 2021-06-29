import { Chain } from '@liskhq/lisk-chain';
import { BlockHeaderWithReceivedAt as BlockHeader } from './types';
declare type Slots = Chain['slots'];
export declare const forgingSlot: (slots: Slots, block: BlockHeader) => number;
export declare const isBlockReceivedWithinForgingSlot: (slots: Slots, { timestamp, receivedAt }: BlockHeader) => boolean;
export declare const isLastAppliedBlockReceivedWithinForgingSlot: (slots: Slots, lastAppliedBlock: BlockHeader) => boolean;
export declare const isValidBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isIdenticalBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isDuplicateBlock: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isDoubleForging: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export declare const isTieBreak: ({ slots, lastAppliedBlock, receivedBlock, }: {
    readonly slots: Slots;
    readonly lastAppliedBlock: BlockHeader;
    readonly receivedBlock: BlockHeader;
}) => boolean;
export declare const isDifferentChain: (lastBlock: BlockHeader, currentBlock: BlockHeader) => boolean;
export {};
