"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriedList = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const base_list_1 = require("./base_list");
class TriedList extends base_list_1.BaseList {
    constructor({ numOfBuckets, bucketSize, maxReconnectTries, secret, peerType, }) {
        super({
            secret,
            numOfBuckets,
            bucketSize,
            peerType,
        });
        this.type = utils_1.PEER_TYPE.TRIED_PEER;
        this._maxReconnectTries = maxReconnectTries !== null && maxReconnectTries !== void 0 ? maxReconnectTries : constants_1.DEFAULT_MAX_RECONNECT_TRIES;
    }
    get triedPeerConfig() {
        return {
            ...this.peerListConfig,
            maxReconnectTries: this._maxReconnectTries,
        };
    }
    failedConnectionAction(incomingPeerInfo) {
        const { bucket } = this.calculateBucket(incomingPeerInfo.ipAddress);
        const incomingPeerId = incomingPeerInfo.peerId;
        const foundPeer = bucket.get(incomingPeerId);
        if (!foundPeer) {
            return false;
        }
        const { numOfConnectionFailures } = foundPeer;
        if (numOfConnectionFailures + 1 >= this._maxReconnectTries) {
            const removedFromBucket = bucket.delete(incomingPeerId);
            const removedFromPeerLookup = this.peerIdToPeerInfo.delete(incomingPeerId);
            return removedFromBucket && removedFromPeerLookup;
        }
        const updatedTriedPeerInfo = {
            ...foundPeer,
            numOfConnectionFailures: numOfConnectionFailures + 1,
        };
        bucket.set(incomingPeerId, updatedTriedPeerInfo);
        return false;
    }
}
exports.TriedList = TriedList;
//# sourceMappingURL=tried_list.js.map