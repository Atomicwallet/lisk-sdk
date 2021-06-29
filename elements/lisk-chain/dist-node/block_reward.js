"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDefaultReward = exports.calculateMilestone = void 0;
const calculateMilestone = (height, blockRewardArgs) => {
    const distance = Math.floor(blockRewardArgs.distance);
    const location = Math.trunc((height - blockRewardArgs.rewardOffset) / distance);
    const lastMile = blockRewardArgs.milestones[blockRewardArgs.milestones.length - 1];
    if (location > blockRewardArgs.milestones.length - 1) {
        return blockRewardArgs.milestones.lastIndexOf(lastMile);
    }
    return location;
};
exports.calculateMilestone = calculateMilestone;
const calculateDefaultReward = (height, blockRewardArgs) => {
    if (height < blockRewardArgs.rewardOffset) {
        return BigInt(0);
    }
    return blockRewardArgs.milestones[exports.calculateMilestone(height, blockRewardArgs)];
};
exports.calculateDefaultReward = calculateDefaultReward;
//# sourceMappingURL=block_reward.js.map