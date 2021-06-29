"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLargestSubsetMaxBy = exports.computeBlockHeightsList = exports.restoreBlocksUponStartup = exports.deleteBlocksAfterHeight = exports.clearBlocksTempTable = exports.restoreBlocks = void 0;
const lisk_bft_1 = require("@liskhq/lisk-bft");
const restoreBlocks = async (chainModule, processorModule) => {
    const tempBlocks = await chainModule.dataAccess.getTempBlocks();
    if (tempBlocks.length === 0) {
        return false;
    }
    for (const tempBlock of tempBlocks.reverse()) {
        await processorModule.processValidated(tempBlock, {
            removeFromTempTable: true,
        });
    }
    return true;
};
exports.restoreBlocks = restoreBlocks;
const clearBlocksTempTable = async (chainModule) => chainModule.dataAccess.clearTempBlocks();
exports.clearBlocksTempTable = clearBlocksTempTable;
const deleteBlocksAfterHeight = async (processorModule, chainModule, logger, desiredHeight, backup = false) => {
    let { height: currentHeight } = chainModule.lastBlock.header;
    logger.debug({ desiredHeight, lastBlockHeight: currentHeight }, 'Deleting blocks after height');
    while (desiredHeight < currentHeight) {
        logger.trace({
            height: chainModule.lastBlock.header.height,
            blockId: chainModule.lastBlock.header.id,
        }, 'Deleting block and backing it up to temporary table');
        await processorModule.deleteLastBlock({
            saveTempBlock: backup,
        });
        currentHeight = chainModule.lastBlock.header.height;
    }
};
exports.deleteBlocksAfterHeight = deleteBlocksAfterHeight;
const restoreBlocksUponStartup = async (logger, chainModule, bftModule, processorModule) => {
    const tempBlocks = await chainModule.dataAccess.getTempBlocks();
    const blockLowestHeight = tempBlocks[tempBlocks.length - 1];
    const blockHighestHeight = tempBlocks[0];
    const forkStatus = bftModule.forkChoice(blockHighestHeight.header, chainModule.lastBlock.header);
    const blockHasPriority = forkStatus === lisk_bft_1.ForkStatus.DIFFERENT_CHAIN || forkStatus === lisk_bft_1.ForkStatus.VALID_BLOCK;
    if (blockHasPriority) {
        logger.info('Restoring blocks from temporary table');
        await exports.deleteBlocksAfterHeight(processorModule, chainModule, logger, blockLowestHeight.header.height - 1, false);
        await exports.restoreBlocks(chainModule, processorModule);
        logger.info('Chain successfully restored');
    }
    else {
        await exports.clearBlocksTempTable(chainModule);
    }
};
exports.restoreBlocksUponStartup = restoreBlocksUponStartup;
const computeBlockHeightsList = (finalizedHeight, activeDelegates, listSizeLimit, currentRound) => {
    const startingHeight = Math.max((currentRound - 1) * activeDelegates, 0);
    const heightList = new Array(listSizeLimit)
        .fill(0)
        .map((_, i) => startingHeight - i * activeDelegates)
        .filter(height => height >= 0);
    const heightListAfterFinalized = heightList.filter(height => height > finalizedHeight);
    return heightList.length !== heightListAfterFinalized.length
        ? [...heightListAfterFinalized, finalizedHeight]
        : heightListAfterFinalized;
};
exports.computeBlockHeightsList = computeBlockHeightsList;
const computeLargestSubsetMaxBy = (arrayOfObjects, propertySelectorFunc) => {
    const comparableValues = arrayOfObjects.map(propertySelectorFunc);
    const absoluteMax = Math.max(...comparableValues);
    const largestSubset = [];
    for (const item of arrayOfObjects) {
        if (propertySelectorFunc(item) === absoluteMax) {
            largestSubset.push(item);
        }
    }
    return largestSubset;
};
exports.computeLargestSubsetMaxBy = computeLargestSubsetMaxBy;
//# sourceMappingURL=utils.js.map