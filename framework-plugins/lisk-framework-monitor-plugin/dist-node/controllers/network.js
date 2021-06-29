"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkStats = void 0;
const getMajorityHeight = (peers) => {
    const heightHistogram = {};
    const majority = {
        height: 0,
        count: 0,
    };
    for (const { options } of peers) {
        const height = options.height;
        heightHistogram[height] = heightHistogram[height] + 1 || 1;
        if (heightHistogram[height] > majority.count) {
            majority.count = heightHistogram[height];
            majority.height = height;
        }
    }
    return majority;
};
const getNetworkStats = async (channel) => {
    const networkStats = await channel.invoke('app:getNetworkStats');
    const connectedPeers = await channel.invoke('app:getConnectedPeers');
    const disconnectedPeers = await channel.invoke('app:getDisconnectedPeers');
    const majorityHeight = getMajorityHeight(connectedPeers);
    const totalPeers = {
        connected: connectedPeers.length,
        disconnected: disconnectedPeers.length,
    };
    return { ...networkStats, majorityHeight, totalPeers };
};
exports.getNetworkStats = getNetworkStats;
//# sourceMappingURL=network.js.map