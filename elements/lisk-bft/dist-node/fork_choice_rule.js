"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDifferentChain = exports.isTieBreak = exports.isDoubleForging = exports.isDuplicateBlock = exports.isIdenticalBlock = exports.isValidBlock = exports.isLastAppliedBlockReceivedWithinForgingSlot = exports.isBlockReceivedWithinForgingSlot = exports.forgingSlot = void 0;
const forgingSlot = (slots, block) => slots.getSlotNumber(block.timestamp);
exports.forgingSlot = forgingSlot;
const isBlockReceivedWithinForgingSlot = (slots, { timestamp, receivedAt }) => slots.isWithinTimeslot(slots.getSlotNumber(timestamp), receivedAt);
exports.isBlockReceivedWithinForgingSlot = isBlockReceivedWithinForgingSlot;
const isLastAppliedBlockReceivedWithinForgingSlot = (slots, lastAppliedBlock) => {
    if (!lastAppliedBlock.receivedAt) {
        return true;
    }
    return exports.isBlockReceivedWithinForgingSlot(slots, lastAppliedBlock);
};
exports.isLastAppliedBlockReceivedWithinForgingSlot = isLastAppliedBlockReceivedWithinForgingSlot;
const isValidBlock = (lastBlock, currentBlock) => lastBlock.height + 1 === currentBlock.height && lastBlock.id.equals(currentBlock.previousBlockID);
exports.isValidBlock = isValidBlock;
const isIdenticalBlock = (lastBlock, currentBlock) => lastBlock.id.equals(currentBlock.id);
exports.isIdenticalBlock = isIdenticalBlock;
const isDuplicateBlock = (lastBlock, currentBlock) => lastBlock.height === currentBlock.height &&
    lastBlock.asset.maxHeightPrevoted === currentBlock.asset.maxHeightPrevoted &&
    lastBlock.previousBlockID.equals(currentBlock.previousBlockID);
exports.isDuplicateBlock = isDuplicateBlock;
const isDoubleForging = (lastBlock, currentBlock) => exports.isDuplicateBlock(lastBlock, currentBlock) &&
    lastBlock.generatorPublicKey.equals(currentBlock.generatorPublicKey);
exports.isDoubleForging = isDoubleForging;
const isTieBreak = ({ slots, lastAppliedBlock, receivedBlock, }) => exports.isDuplicateBlock(lastAppliedBlock, receivedBlock) &&
    exports.forgingSlot(slots, lastAppliedBlock) < exports.forgingSlot(slots, receivedBlock) &&
    !exports.isLastAppliedBlockReceivedWithinForgingSlot(slots, lastAppliedBlock) &&
    exports.isBlockReceivedWithinForgingSlot(slots, receivedBlock);
exports.isTieBreak = isTieBreak;
const isDifferentChain = (lastBlock, currentBlock) => {
    const maxHeightPrevoted = lastBlock.asset.maxHeightPrevoted || 0;
    return (maxHeightPrevoted < currentBlock.asset.maxHeightPrevoted ||
        (lastBlock.height < currentBlock.height &&
            maxHeightPrevoted === currentBlock.asset.maxHeightPrevoted));
};
exports.isDifferentChain = isDifferentChain;
//# sourceMappingURL=fork_choice_rule.js.map