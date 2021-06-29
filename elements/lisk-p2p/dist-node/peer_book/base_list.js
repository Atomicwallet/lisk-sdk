"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseList = void 0;
const errors_1 = require("../errors");
const utils_1 = require("../utils");
class BaseList {
    constructor({ bucketSize, numOfBuckets, secret, peerType }) {
        this.peerListConfig = {
            bucketSize,
            numOfBuckets,
            peerType,
            secret,
        };
        this.bucketIdToBucket = new Map();
        this._initBuckets();
        this.peerIdToPeerInfo = new Map();
    }
    get peerList() {
        const peerListMap = [];
        for (const peerList of [...this.bucketIdToBucket.values()]) {
            for (const peer of [...peerList.values()]) {
                peerListMap.push(utils_1.sanitizeEnhancedPeerInfo(peer));
            }
        }
        return peerListMap;
    }
    hasPeer(incomingPeerId) {
        return this.peerIdToPeerInfo.has(incomingPeerId);
    }
    addPeer(incomingPeerInfo) {
        if (this.hasPeer(incomingPeerInfo.peerId)) {
            throw new errors_1.ExistingPeerError(incomingPeerInfo);
        }
        const { bucketId, bucket } = this.calculateBucket(incomingPeerInfo.ipAddress, this.type === utils_1.PEER_TYPE.NEW_PEER ? incomingPeerInfo.sourceAddress : undefined);
        const evictedPeer = bucket.size >= this.peerListConfig.bucketSize ? this.makeSpace(bucket) : undefined;
        const internalPeerInfo = {
            ...incomingPeerInfo,
            numOfConnectionFailures: 0,
            dateAdded: new Date(),
            bucketId,
        };
        bucket.set(incomingPeerInfo.peerId, internalPeerInfo);
        this.peerIdToPeerInfo.set(incomingPeerInfo.peerId, internalPeerInfo);
        return evictedPeer;
    }
    getPeer(incomingPeerId) {
        const peerInfo = this.peerIdToPeerInfo.get(incomingPeerId);
        if (!peerInfo) {
            return undefined;
        }
        return utils_1.sanitizeEnhancedPeerInfo(peerInfo);
    }
    updatePeer(incomingPeerInfo) {
        const bucket = this.getBucket(incomingPeerInfo.peerId);
        if (!bucket) {
            return false;
        }
        const updatedInternalPeerInfo = {
            ...bucket.get(incomingPeerInfo.peerId),
            ...incomingPeerInfo,
        };
        bucket.set(incomingPeerInfo.peerId, updatedInternalPeerInfo);
        this.peerIdToPeerInfo.set(incomingPeerInfo.peerId, updatedInternalPeerInfo);
        return true;
    }
    removePeer(incomingPeerInfo) {
        const bucket = this.getBucket(incomingPeerInfo.peerId);
        if (bucket === null || bucket === void 0 ? void 0 : bucket.has(incomingPeerInfo.peerId)) {
            const removedFromBucket = bucket.delete(incomingPeerInfo.peerId);
            const removedFromPeerLookup = this.peerIdToPeerInfo.delete(incomingPeerInfo.peerId);
            return removedFromBucket && removedFromPeerLookup;
        }
        return false;
    }
    makeSpace(bucket) {
        return utils_1.evictPeerRandomlyFromBucket(bucket);
    }
    failedConnectionAction(incomingPeerInfo) {
        return this.removePeer(incomingPeerInfo);
    }
    calculateBucket(targetAddress, sourceAddress) {
        const bucketId = utils_1.getBucketId({
            secret: this.peerListConfig.secret,
            peerType: this.peerListConfig.peerType,
            targetAddress,
            sourceAddress: this.type === utils_1.PEER_TYPE.NEW_PEER ? sourceAddress : undefined,
            bucketCount: this.peerListConfig.numOfBuckets,
        });
        return { bucketId, bucket: this.bucketIdToBucket.get(bucketId) };
    }
    getBucket(peerId) {
        const internalPeerInfo = this.peerIdToPeerInfo.get(peerId);
        if (typeof (internalPeerInfo === null || internalPeerInfo === void 0 ? void 0 : internalPeerInfo.bucketId) !== 'number') {
            return undefined;
        }
        const bucket = this.bucketIdToBucket.get(internalPeerInfo.bucketId);
        if (!bucket) {
            return undefined;
        }
        return bucket;
    }
    _initBuckets() {
        for (const bucketId of [...new Array(this.peerListConfig.numOfBuckets).keys()]) {
            this.bucketIdToBucket.set(bucketId, new Map());
        }
    }
}
exports.BaseList = BaseList;
//# sourceMappingURL=base_list.js.map