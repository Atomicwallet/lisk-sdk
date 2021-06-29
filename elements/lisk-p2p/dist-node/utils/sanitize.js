"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePeerLists = exports.sanitizeEnhancedPeerInfo = exports.sanitizeInitialPeerInfo = exports.sanitizeIncomingPeerInfo = exports.assignInternalInfo = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const constants_1 = require("../constants");
const network_1 = require("./network");
const assignInternalInfo = (peerInfo, secret) => peerInfo.internalState
    ? peerInfo.internalState
    : {
        reputation: constants_1.DEFAULT_REPUTATION_SCORE,
        netgroup: network_1.getNetgroup(peerInfo.ipAddress, secret),
        latency: 0,
        connectTime: Date.now(),
        rpcCounter: new Map(),
        rpcRates: new Map(),
        messageCounter: new Map(),
        messageRates: new Map(),
        wsMessageCount: 0,
        wsMessageRate: 0,
        productivity: { ...constants_1.DEFAULT_PRODUCTIVITY },
        advertiseAddress: true,
        connectionKind: constants_1.ConnectionKind.NONE,
        peerKind: constants_1.PeerKind.NONE,
    };
exports.assignInternalInfo = assignInternalInfo;
const sanitizeIncomingPeerInfo = (peerInfo) => {
    const { ipAddress, port, ...restOfPeerInfo } = peerInfo;
    return {
        peerId: network_1.constructPeerId(ipAddress, port),
        ipAddress,
        port,
        sharedState: {
            ...restOfPeerInfo,
        },
    };
};
exports.sanitizeIncomingPeerInfo = sanitizeIncomingPeerInfo;
const sanitizeInitialPeerInfo = (peerInfo) => ({
    peerId: network_1.constructPeerId(peerInfo.ipAddress, peerInfo.port),
    ipAddress: peerInfo.ipAddress,
    port: peerInfo.port,
});
exports.sanitizeInitialPeerInfo = sanitizeInitialPeerInfo;
const sanitizeEnhancedPeerInfo = (peerInfo) => {
    const { dateAdded, numOfConnectionFailures, sourceAddress, bucketId, ...sharedPeerInfo } = peerInfo;
    return sharedPeerInfo;
};
exports.sanitizeEnhancedPeerInfo = sanitizeEnhancedPeerInfo;
const sanitizePeerLists = (lists, nodeInfo, secret) => {
    const blacklistedIPs = lists.blacklistedIPs.filter(blacklistedIP => {
        if (blacklistedIP === nodeInfo.ipAddress) {
            return false;
        }
        return true;
    });
    const fixedPeers = lists.fixedPeers
        .filter(peerInfo => {
        if (!lisk_validator_1.isIPV4(peerInfo.ipAddress)) {
            return false;
        }
        if (peerInfo.ipAddress === nodeInfo.ipAddress) {
            return false;
        }
        if (blacklistedIPs.includes(peerInfo.ipAddress)) {
            return false;
        }
        return true;
    })
        .map(peer => {
        const peerInternalInfo = exports.assignInternalInfo(peer, secret);
        return {
            ...peer,
            internalState: { ...peerInternalInfo, peerKind: constants_1.PeerKind.FIXED_PEER },
        };
    });
    const seedPeers = lists.seedPeers
        .filter(peerInfo => {
        if (!lisk_validator_1.isIPV4(peerInfo.ipAddress)) {
            return false;
        }
        if (peerInfo.ipAddress === nodeInfo.ipAddress) {
            return false;
        }
        if (blacklistedIPs.includes(peerInfo.ipAddress)) {
            return false;
        }
        if (fixedPeers.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        return true;
    })
        .map(peer => {
        const peerInternalInfo = exports.assignInternalInfo(peer, secret);
        return {
            ...peer,
            internalState: { ...peerInternalInfo, peerKind: constants_1.PeerKind.SEED_PEER },
        };
    });
    const whitelisted = lists.whitelisted
        .filter(peerInfo => {
        if (!lisk_validator_1.isIPV4(peerInfo.ipAddress)) {
            return false;
        }
        if (peerInfo.ipAddress === nodeInfo.ipAddress) {
            return false;
        }
        if (blacklistedIPs.includes(peerInfo.ipAddress)) {
            return false;
        }
        if (fixedPeers.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        if (seedPeers.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        return true;
    })
        .map(peer => {
        const peerInternalInfo = exports.assignInternalInfo(peer, secret);
        return {
            ...peer,
            internalState: {
                ...peerInternalInfo,
                peerKind: constants_1.PeerKind.WHITELISTED_PEER,
            },
        };
    });
    const previousPeers = lists.previousPeers.filter(peerInfo => {
        if (!lisk_validator_1.isIPV4(peerInfo.ipAddress)) {
            return false;
        }
        if (peerInfo.ipAddress === nodeInfo.ipAddress) {
            return false;
        }
        if (blacklistedIPs.includes(peerInfo.ipAddress)) {
            return false;
        }
        if (fixedPeers.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        if (seedPeers.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        if (whitelisted.map(peer => peer.peerId).includes(peerInfo.peerId)) {
            return false;
        }
        return true;
    });
    return {
        blacklistedIPs,
        seedPeers,
        fixedPeers,
        whitelisted,
        previousPeers,
    };
};
exports.sanitizePeerLists = sanitizePeerLists;
//# sourceMappingURL=sanitize.js.map