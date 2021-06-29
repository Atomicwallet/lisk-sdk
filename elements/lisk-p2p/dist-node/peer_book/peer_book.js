"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerBook = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const new_list_1 = require("./new_list");
const tried_list_1 = require("./tried_list");
const shuffle = require("lodash.shuffle");
class PeerBook {
    constructor({ sanitizedPeerLists, secret }) {
        this._newPeers = new new_list_1.NewList({
            secret,
            numOfBuckets: constants_1.DEFAULT_NEW_BUCKET_COUNT,
            bucketSize: constants_1.DEFAULT_NEW_BUCKET_SIZE,
            peerType: utils_1.PEER_TYPE.NEW_PEER,
        });
        this._triedPeers = new tried_list_1.TriedList({
            secret,
            numOfBuckets: constants_1.DEFAULT_TRIED_BUCKET_COUNT,
            bucketSize: constants_1.DEFAULT_TRIED_BUCKET_SIZE,
            peerType: utils_1.PEER_TYPE.TRIED_PEER,
        });
        this._secret = secret;
        this._bannedIPs = new Set([]);
        this._blacklistedIPs = new Set([...sanitizedPeerLists.blacklistedIPs]);
        this._seedPeers = [...sanitizedPeerLists.seedPeers];
        this._fixedPeers = [...sanitizedPeerLists.fixedPeers];
        this._whitelistedPeers = [...sanitizedPeerLists.whitelisted];
        this._unbanTimers = [];
        const newPeersToAdd = [
            ...sanitizedPeerLists.fixedPeers,
            ...sanitizedPeerLists.whitelisted,
            ...sanitizedPeerLists.previousPeers,
        ];
        newPeersToAdd.forEach(peerInfo => {
            if (!this.hasPeer(peerInfo)) {
                this.addPeer(peerInfo);
            }
            this.upgradePeer(peerInfo);
        });
    }
    get newPeers() {
        return this._newPeers.peerList;
    }
    get triedPeers() {
        return this._triedPeers.peerList;
    }
    get allPeers() {
        return [...this.newPeers, ...this.triedPeers];
    }
    get seedPeers() {
        return this._seedPeers;
    }
    get fixedPeers() {
        return this._fixedPeers;
    }
    get whitelistedPeers() {
        return this._whitelistedPeers;
    }
    get bannedIPs() {
        return new Set([...this._blacklistedIPs, ...this._bannedIPs]);
    }
    cleanUpTimers() {
        this._unbanTimers.forEach(timer => {
            if (timer) {
                clearTimeout(timer);
            }
        });
    }
    getRandomizedPeerList(minimumPeerDiscoveryThreshold, maxPeerDiscoveryResponseLength) {
        const allPeers = [...this.newPeers, ...this.triedPeers];
        const min = Math.ceil(Math.min(maxPeerDiscoveryResponseLength, allPeers.length * 0.25));
        const max = Math.floor(Math.min(maxPeerDiscoveryResponseLength, allPeers.length * 0.5));
        const random = Math.floor(Math.random() * (max - min + 1) + min);
        const randomPeerCount = Math.max(random, Math.min(minimumPeerDiscoveryThreshold, allPeers.length));
        return shuffle(allPeers).slice(0, randomPeerCount);
    }
    getPeer(peerInfo) {
        const triedPeer = this._triedPeers.getPeer(peerInfo.peerId);
        if (triedPeer) {
            return triedPeer;
        }
        return this._newPeers.getPeer(peerInfo.peerId);
    }
    hasPeer(peerInfo) {
        return this._triedPeers.hasPeer(peerInfo.peerId) || this._newPeers.hasPeer(peerInfo.peerId);
    }
    addPeer(peerInfo) {
        if (this._bannedIPs.has(peerInfo.ipAddress)) {
            return false;
        }
        if (this._triedPeers.getPeer(peerInfo.peerId)) {
            throw new errors_1.ExistingPeerError(peerInfo);
        }
        this._newPeers.addPeer(this._assignPeerKind(peerInfo));
        return true;
    }
    removePeer(peerInfo) {
        this._newPeers.removePeer(peerInfo);
        this._triedPeers.removePeer(peerInfo);
    }
    updatePeer(peerInfo) {
        if (this._triedPeers.getPeer(peerInfo.peerId)) {
            return this._triedPeers.updatePeer(this._assignPeerKind(peerInfo));
        }
        if (this._newPeers.getPeer(peerInfo.peerId)) {
            return this._newPeers.updatePeer(this._assignPeerKind(peerInfo));
        }
        return false;
    }
    upgradePeer(peerInfo) {
        if (this._triedPeers.hasPeer(peerInfo.peerId)) {
            return true;
        }
        if (this._newPeers.hasPeer(peerInfo.peerId)) {
            this.removePeer(peerInfo);
            if (this.bannedIPs.has(peerInfo.ipAddress)) {
                return false;
            }
            this._triedPeers.addPeer(this._assignPeerKind(peerInfo));
            return true;
        }
        return false;
    }
    downgradePeer(peerInfo) {
        if (this.isTrustedPeer(peerInfo.peerId)) {
            return false;
        }
        if (this._newPeers.hasPeer(peerInfo.peerId)) {
            return this._newPeers.failedConnectionAction(peerInfo);
        }
        if (this._triedPeers.hasPeer(peerInfo.peerId)) {
            const failed = this._triedPeers.failedConnectionAction(peerInfo);
            if (failed) {
                return this.addPeer(peerInfo);
            }
        }
        return false;
    }
    isTrustedPeer(peerId) {
        const isSeedPeer = this.seedPeers.find(peer => peer.peerId === peerId);
        const isWhitelistedPeer = this.whitelistedPeers.find(peer => peer.peerId === peerId);
        const isFixedPeer = this.fixedPeers.find(peer => peer.peerId === peerId);
        return !!isSeedPeer || !!isWhitelistedPeer || !!isFixedPeer;
    }
    addBannedPeer(peerId, peerBanTime) {
        const peerIpAddress = peerId.split(':')[0];
        if (this.bannedIPs.has(peerIpAddress)) {
            return;
        }
        if (this.fixedPeers.find(peer => peer.peerId === peerId) ||
            this.whitelistedPeers.find(peer => peer.peerId === peerId)) {
            return;
        }
        this._bannedIPs.add(peerIpAddress);
        this.allPeers.forEach((peer) => {
            if (peer.ipAddress === peerIpAddress) {
                this.removePeer(peer);
            }
        });
        const unbanTimeout = setTimeout(() => {
            this._removeBannedPeer(peerId);
        }, peerBanTime);
        this._unbanTimers.push(unbanTimeout);
    }
    _removeBannedPeer(peerId) {
        const peerIpAddress = peerId.split(':')[0];
        this._bannedIPs.delete(peerIpAddress);
    }
    _assignPeerKind(peerInfo) {
        if (this.fixedPeers.find(peer => peer.ipAddress === peerInfo.ipAddress)) {
            return {
                ...peerInfo,
                internalState: {
                    ...utils_1.assignInternalInfo(peerInfo, this._secret),
                    peerKind: constants_1.PeerKind.FIXED_PEER,
                },
            };
        }
        if (this.whitelistedPeers.find(peer => peer.ipAddress === peerInfo.ipAddress)) {
            return {
                ...peerInfo,
                internalState: {
                    ...utils_1.assignInternalInfo(peerInfo, this._secret),
                    peerKind: constants_1.PeerKind.WHITELISTED_PEER,
                },
            };
        }
        if (this.seedPeers.find(peer => peer.ipAddress === peerInfo.ipAddress)) {
            return {
                ...peerInfo,
                internalState: {
                    ...utils_1.assignInternalInfo(peerInfo, this._secret),
                    peerKind: constants_1.PeerKind.SEED_PEER,
                },
            };
        }
        return {
            ...peerInfo,
            internalState: {
                ...utils_1.assignInternalInfo(peerInfo, this._secret),
                peerKind: constants_1.PeerKind.NONE,
            },
        };
    }
}
exports.PeerBook = PeerBook;
//# sourceMappingURL=peer_book.js.map