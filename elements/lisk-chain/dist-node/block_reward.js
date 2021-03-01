"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMilestone = (height, blockRewardArgs) => {
    const distance = Math.floor(blockRewardArgs.distance);
    const location = Math.trunc((height - blockRewardArgs.rewardOffset) / distance);
    const lastMile = blockRewardArgs.milestones[blockRewardArgs.milestones.length - 1];
    if (location > blockRewardArgs.milestones.length - 1) {
        return blockRewardArgs.milestones.lastIndexOf(lastMile);
    }
    return location;
};
exports.calculateDefaultReward = (height, blockRewardArgs) => {
    if (height < blockRewardArgs.rewardOffset) {
        return BigInt(0);
    }
    return blockRewardArgs.milestones[exports.calculateMilestone(height, blockRewardArgs)];
};
//# sourceMappingURL=block_reward.js.map