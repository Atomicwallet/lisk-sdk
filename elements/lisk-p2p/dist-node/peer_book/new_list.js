"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewList = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const base_list_1 = require("./base_list");
class NewList extends base_list_1.BaseList {
    constructor({ evictionThresholdTime, numOfBuckets, bucketSize, secret, peerType, }) {
        super({
            secret,
            numOfBuckets,
            bucketSize,
            peerType,
        });
        this.type = utils_1.PEER_TYPE.NEW_PEER;
        this._evictionThresholdTime = evictionThresholdTime !== null && evictionThresholdTime !== void 0 ? evictionThresholdTime : constants_1.DEFAULT_EVICTION_THRESHOLD_TIME;
    }
    get newPeerConfig() {
        return {
            ...this.peerListConfig,
            evictionThresholdTime: this._evictionThresholdTime,
        };
    }
    makeSpace(bucket) {
        const evictedPeer = utils_1.expirePeerFromBucket(bucket, this._evictionThresholdTime);
        if (evictedPeer) {
            return evictedPeer;
        }
        return utils_1.evictPeerRandomlyFromBucket(bucket);
    }
}
exports.NewList = NewList;
//# sourceMappingURL=new_list.js.map