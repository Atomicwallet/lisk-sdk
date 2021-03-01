import { BaseChannel } from 'lisk-framework';
import { BlockPropagationStats, SharedState } from '../types';
interface BlockStats {
    readonly blocks: Record<string, BlockPropagationStats>;
    readonly averageReceivedBlocks: number;
    readonly connectedPeers: number;
}
export declare const getBlockStats: (channel: BaseChannel, state: SharedState) => Promise<BlockStats>;
export {};
