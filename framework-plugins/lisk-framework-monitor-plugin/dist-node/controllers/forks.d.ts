import { SharedState } from '../types';
interface BlockHeader {
    blockHeader: object;
    timeReceived: number;
}
interface ForkStats {
    readonly forkEventCount: number;
    blockHeaders: Record<string, BlockHeader>;
}
export declare const getForkStats: (state: SharedState) => ForkStats;
export {};
