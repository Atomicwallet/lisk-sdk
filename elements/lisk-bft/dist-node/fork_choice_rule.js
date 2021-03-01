"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgingSlot = (slots, block) => slots.getSlotNumber(block.timestamp);
exports.isBlockReceivedWithinForgingSlot = (slots, { timestamp, receivedAt }) => slots.isWithinTimeslot(slots.getSlotNumber(timestamp), receivedAt);
exports.isLastAppliedBlockReceivedWithinForgingSlot = (slots, lastAppliedBlock) => {
    if (!lastAppliedBlock.receivedAt) {
        return true;
    }
    return exports.isBlockReceivedWithinForgingSlot(slots, lastAppliedBlock);
};
exports.isValidBlock = (lastBlock, currentBlock) => lastBlock.height + 1 === currentBlock.height && lastBlock.id.equals(currentBlock.previousBlockID);
exports.isIdenticalBlock = (lastBlock, currentBlock) => lastBlock.id.equals(currentBlock.id);
exports.isDuplicateBlock = (lastBlock, currentBlock) => lastBlock.height === currentBlock.height &&
    lastBlock.asset.maxHeightPrevoted === currentBlock.asset.maxHeightPrevoted &&
    lastBlock.previousBlockID.equals(currentBlock.previousBlockID);
exports.isDoubleForging = (lastBlock, currentBlock) => exports.isDuplicateBlock(lastBlock, currentBlock) &&
    lastBlock.generatorPublicKey.equals(currentBlock.generatorPublicKey);
exports.isTieBreak = ({ slots, lastAppliedBlock, receivedBlock, }) => exports.isDuplicateBlock(lastAppliedBlock, receivedBlock) &&
    exports.forgingSlot(slots, lastAppliedBlock) < exports.forgingSlot(slots, receivedBlock) &&
    !exports.isLastAppliedBlockReceivedWithinForgingSlot(slots, lastAppliedBlock) &&
    exports.isBlockReceivedWithinForgingSlot(slots, receivedBlock);
exports.isDifferentChain = (lastBlock, currentBlock) => {
    const maxHeightPrevoted = lastBlock.asset.maxHeightPrevoted || 0;
    return (maxHeightPrevoted < currentBlock.asset.maxHeightPrevoted ||
        (lastBlock.height < currentBlock.height &&
            maxHeightPrevoted === currentBlock.asset.maxHeightPrevoted));
};
//# sourceMappingURL=fork_choice_rule.js.map