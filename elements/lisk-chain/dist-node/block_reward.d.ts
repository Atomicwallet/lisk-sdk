import { BlockRewardOptions } from './types';
export declare const calculateMilestone: (height: number, blockRewardArgs: BlockRewardOptions) => number;
export declare const calculateDefaultReward: (height: number, blockRewardArgs: BlockRewardOptions) => bigint;
