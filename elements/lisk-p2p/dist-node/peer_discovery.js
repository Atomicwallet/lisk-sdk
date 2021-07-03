"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverPeers = void 0;
const peer_1 = require("./peer");
const discoverPeers = async (knownPeers, filterPeerOptions = { blacklist: [] }) => {
    const peersOfPeer = await Promise.all(knownPeers.map(async (peer) => {
        try {
            return await peer.fetchPeers();
        }
        catch (error) {
            return [];
        }
    }));
    const peersOfPeerFlat = peersOfPeer.reduce((flattenedPeersList, peersList) => Array.isArray(peersList)
        ? [...flattenedPeersList, ...peersList]
        : flattenedPeersList, []);
    const discoveredPeers = peersOfPeerFlat.reduce((uniquePeersArray, peer) => {
        const found = uniquePeersArray.find(findPeer => peer_1.constructPeerIdFromPeerInfo(findPeer) ===
            peer_1.constructPeerIdFromPeerInfo(peer));
        return found ? uniquePeersArray : [...uniquePeersArray, peer];
    }, []);
    if (filterPeerOptions.blacklist.length === 0) {
        return discoveredPeers;
    }
    const discoveredPeersFiltered = discoveredPeers.filter((peer) => !filterPeerOptions.blacklist.includes(peer.ipAddress));
    return discoveredPeersFiltered;
};
exports.discoverPeers = discoverPeers;
//# sourceMappingURL=peer_discovery.js.map