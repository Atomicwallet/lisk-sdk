"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockStats = void 0;
const getAverageReceivedBlocks = (blocks) => {
    let totalCount = 0;
    for (const blockStat of Object.values(blocks)) {
        totalCount += blockStat.count;
    }
    return Object.keys(blocks).length ? totalCount / Object.keys(blocks).length : 0;
};
const getBlockStats = async (channel, state) => {
    const connectedPeers = await channel.invoke('app:getConnectedPeers');
    return {
        blocks: state.blocks,
        averageReceivedBlocks: getAverageReceivedBlocks(state.blocks),
        connectedPeers: connectedPeers.length,
    };
};
exports.getBlockStats = getBlockStats;
//# sourceMappingURL=blocks.js.map