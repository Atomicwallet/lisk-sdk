"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPeersForConnection = exports.selectPeersForSend = exports.selectPeersForRequest = exports.getUniquePeersbyIp = void 0;
const shuffle = require("lodash.shuffle");
const getUniquePeersbyIp = (peerList) => {
    const peerMap = new Map();
    for (const peer of peerList) {
        const tempPeer = peerMap.get(peer.ipAddress);
        if (tempPeer) {
            if (peer.height > tempPeer.height) {
                peerMap.set(peer.ipAddress, peer);
            }
        }
        else {
            peerMap.set(peer.ipAddress, peer);
        }
    }
    return [...peerMap.values()];
};
exports.getUniquePeersbyIp = getUniquePeersbyIp;
const selectPeersForRequest = (input) => {
    const { peers, nodeInfo } = input;
    const peerLimit = input.peerLimit;
    const nodeHeight = nodeInfo ? nodeInfo.height : 0;
    const filteredPeers = peers.filter((peer) => peer.height >= nodeHeight);
    if (filteredPeers.length === 0) {
        return [];
    }
    const sortedPeers = filteredPeers.sort((a, b) => b.height - a.height);
    const aggregation = 2;
    const calculatedHistogramValues = sortedPeers.reduce((histogramValues, peer) => {
        const val = Math.floor(peer.height / aggregation) * aggregation;
        histogramValues.histogram[val] =
            (histogramValues.histogram[val] ? histogramValues.histogram[val] : 0) +
                1;
        if (histogramValues.histogram[val] > histogramValues.max) {
            histogramValues.max = histogramValues.histogram[val];
            histogramValues.height = val;
        }
        return histogramValues;
    }, { height: 0, histogram: {}, max: -1 });
    const processedPeers = sortedPeers.filter(peer => peer &&
        Math.abs(calculatedHistogramValues.height - peer.height) <
            aggregation + 1);
    if (peerLimit === undefined) {
        return processedPeers;
    }
    if (peerLimit === 1) {
        const goodPeer = [
            processedPeers[Math.floor(Math.random() * processedPeers.length)],
        ];
        return goodPeer;
    }
    return shuffle(processedPeers).slice(0, peerLimit);
};
exports.selectPeersForRequest = selectPeersForRequest;
const selectPeersForSend = (input) => shuffle(input.peers).slice(0, input.peerLimit);
exports.selectPeersForSend = selectPeersForSend;
const selectPeersForConnection = (input) => input.peers;
exports.selectPeersForConnection = selectPeersForConnection;
//# sourceMappingURL=peer_selection.js.map