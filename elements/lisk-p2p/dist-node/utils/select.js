"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPeersForConnection = exports.selectPeersForSend = exports.selectPeersForRequest = void 0;
const constants_1 = require("../constants");
const shuffle = require("lodash.shuffle");
const _removeCommonIPsFromLists = (peerList) => {
    const peerMap = new Map();
    for (const peer of peerList) {
        const { internalState } = peer;
        const peerReputation = internalState ? internalState.reputation : 0;
        const tempPeer = peerMap.get(peer.ipAddress);
        if (tempPeer) {
            const { internalState: tempInternalState } = tempPeer;
            const tempPeerReputation = tempInternalState ? tempInternalState.reputation : 0;
            if (peerReputation > tempPeerReputation) {
                peerMap.set(peer.ipAddress, peer);
            }
        }
        else {
            peerMap.set(peer.ipAddress, peer);
        }
    }
    return [...peerMap.values()];
};
const selectPeersForRequest = (input) => {
    const { peers } = input;
    const { peerLimit } = input;
    if (peers.length === 0) {
        return [];
    }
    if (peerLimit === undefined) {
        return shuffle(peers);
    }
    return shuffle(peers).slice(0, peerLimit);
};
exports.selectPeersForRequest = selectPeersForRequest;
const selectPeersForSend = (input) => {
    const shuffledPeers = shuffle(input.peers);
    const peerLimit = input.peerLimit;
    const halfPeerLimit = Math.round(peerLimit / 2);
    const outboundPeers = shuffledPeers.filter((peerInfo) => peerInfo.internalState
        ? peerInfo.internalState.connectionKind === constants_1.ConnectionKind.OUTBOUND
        : false);
    const inboundPeers = shuffledPeers.filter((peerInfo) => peerInfo.internalState
        ? peerInfo.internalState.connectionKind === constants_1.ConnectionKind.INBOUND
        : false);
    const fixedPeers = shuffledPeers.filter((peerInfo) => peerInfo.internalState ? peerInfo.internalState.peerKind === constants_1.PeerKind.FIXED_PEER : false);
    let shortestPeersList;
    let longestPeersList;
    if (outboundPeers.length < inboundPeers.length) {
        shortestPeersList = outboundPeers;
        longestPeersList = inboundPeers;
    }
    else {
        shortestPeersList = inboundPeers;
        longestPeersList = outboundPeers;
    }
    const selectedFirstKindPeers = shortestPeersList.slice(0, halfPeerLimit);
    const remainingPeerLimit = peerLimit - selectedFirstKindPeers.length;
    const selectedSecondKindPeers = longestPeersList.slice(0, remainingPeerLimit);
    const selectedPeers = selectedFirstKindPeers.concat(selectedSecondKindPeers).concat(fixedPeers);
    const uniquePeerIds = [...new Set(selectedPeers.map(p => p.peerId))];
    const uniquePeers = uniquePeerIds.map(peerId => selectedPeers.find(p => p.peerId === peerId));
    return uniquePeers;
};
exports.selectPeersForSend = selectPeersForSend;
const selectPeersForConnection = (input) => {
    if ((input.peerLimit && input.peerLimit < 0) ||
        (input.triedPeers.length === 0 && input.newPeers.length === 0)) {
        return [];
    }
    if (input.peerLimit === undefined ||
        input.peerLimit >= input.triedPeers.length + input.newPeers.length) {
        return _removeCommonIPsFromLists([...input.newPeers, ...input.triedPeers]);
    }
    const minimumProbability = 0.5;
    const x = input.triedPeers.length < 100
        ? minimumProbability
        : input.triedPeers.length / (input.triedPeers.length + input.newPeers.length);
    const r = Math.max(x, minimumProbability);
    const shuffledTriedPeers = shuffle(input.triedPeers);
    const shuffledNewPeers = shuffle(input.newPeers);
    const peerList = [...new Array(input.peerLimit)].map(() => {
        if (shuffledTriedPeers.length !== 0) {
            if (Math.random() < r) {
                return shuffledTriedPeers.pop();
            }
        }
        if (shuffledNewPeers.length !== 0) {
            return shuffledNewPeers.pop();
        }
        return shuffledTriedPeers.pop();
    });
    return _removeCommonIPsFromLists(peerList);
};
exports.selectPeersForConnection = selectPeersForConnection;
//# sourceMappingURL=select.js.map