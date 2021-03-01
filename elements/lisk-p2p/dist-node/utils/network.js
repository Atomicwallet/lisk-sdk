"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const net_1 = require("net");
const BYTES_4 = 4;
const BYTES_16 = 16;
exports.SECRET_BUFFER_LENGTH = 4;
exports.NETWORK_BUFFER_LENGTH = 1;
const PREFIX_BUFFER_LENGTH = 1;
exports.getIPGroup = (address, groupNumber) => {
    if (groupNumber > 3) {
        throw new Error('Invalid IP group.');
    }
    return parseInt(address.split('.')[groupNumber], 10);
};
exports.getIPBytes = (address) => {
    const aBytes = Buffer.alloc(PREFIX_BUFFER_LENGTH);
    aBytes.writeUInt8(exports.getIPGroup(address, 0), 0);
    const bBytes = Buffer.alloc(PREFIX_BUFFER_LENGTH);
    bBytes.writeUInt8(exports.getIPGroup(address, 1), 0);
    const cBytes = Buffer.alloc(PREFIX_BUFFER_LENGTH);
    cBytes.writeUInt8(exports.getIPGroup(address, 2), 0);
    const dBytes = Buffer.alloc(PREFIX_BUFFER_LENGTH);
    dBytes.writeUInt8(exports.getIPGroup(address, 3), 0);
    return {
        aBytes,
        bBytes,
        cBytes,
        dBytes,
    };
};
var NETWORK;
(function (NETWORK) {
    NETWORK[NETWORK["NET_IPV4"] = 0] = "NET_IPV4";
    NETWORK[NETWORK["NET_PRIVATE"] = 1] = "NET_PRIVATE";
    NETWORK[NETWORK["NET_LOCAL"] = 2] = "NET_LOCAL";
    NETWORK[NETWORK["NET_OTHER"] = 3] = "NET_OTHER";
})(NETWORK = exports.NETWORK || (exports.NETWORK = {}));
var PEER_TYPE;
(function (PEER_TYPE) {
    PEER_TYPE["NEW_PEER"] = "newPeer";
    PEER_TYPE["TRIED_PEER"] = "triedPeer";
})(PEER_TYPE = exports.PEER_TYPE || (exports.PEER_TYPE = {}));
exports.isPrivate = (address) => exports.getIPGroup(address, 0) === 10 ||
    (exports.getIPGroup(address, 0) === 172 &&
        (exports.getIPGroup(address, 1) >= 16 || exports.getIPGroup(address, 1) <= 31));
exports.isLocal = (address) => exports.getIPGroup(address, 0) === 127 || address === '0.0.0.0';
exports.getNetwork = (address) => {
    if (exports.isLocal(address)) {
        return NETWORK.NET_LOCAL;
    }
    if (exports.isPrivate(address)) {
        return NETWORK.NET_PRIVATE;
    }
    if (net_1.isIPv4(address)) {
        return NETWORK.NET_IPV4;
    }
    return NETWORK.NET_OTHER;
};
exports.getNetgroup = (address, secret) => {
    const secretBytes = Buffer.alloc(exports.SECRET_BUFFER_LENGTH);
    secretBytes.writeUInt32BE(secret, 0);
    const network = exports.getNetwork(address);
    const networkBytes = Buffer.alloc(exports.NETWORK_BUFFER_LENGTH);
    networkBytes.writeUInt8(network, 0);
    const { aBytes, bBytes } = exports.getIPBytes(address);
    if (network === NETWORK.NET_OTHER) {
        throw Error('IP address is unsupported.');
    }
    const netgroupBytes = Buffer.concat([secretBytes, networkBytes, aBytes, bBytes]);
    return lisk_cryptography_1.hash(netgroupBytes).readUInt32BE(0);
};
exports.constructPeerId = (ipAddress, port) => `${ipAddress}:${port}`;
exports.getByteSize = (data) => {
    if (Buffer.isBuffer(data)) {
        return data.length;
    }
    return Buffer.byteLength(JSON.stringify(data));
};
exports.evictPeerRandomlyFromBucket = (bucket) => {
    const bucketPeerIds = Array.from(bucket.keys());
    const randomPeerIndex = Math.floor(Math.random() * bucketPeerIds.length);
    const randomPeerId = bucketPeerIds[randomPeerIndex];
    const evictedPeer = bucket.get(randomPeerId);
    bucket.delete(randomPeerId);
    return evictedPeer;
};
exports.expirePeerFromBucket = (bucket, thresholdTime) => {
    for (const [peerId, peer] of bucket) {
        const timeDifference = Math.round(Math.abs(peer.dateAdded.getTime() - new Date().getTime()));
        if (timeDifference >= thresholdTime) {
            bucket.delete(peerId);
            return peer;
        }
    }
    return undefined;
};
exports.getBucketId = (options) => {
    const { secret, targetAddress, sourceAddress, peerType, bucketCount } = options;
    const firstMod = peerType === PEER_TYPE.NEW_PEER ? BYTES_16 : BYTES_4;
    const secretBytes = Buffer.alloc(exports.SECRET_BUFFER_LENGTH);
    secretBytes.writeUInt32BE(secret, 0);
    const network = exports.getNetwork(targetAddress);
    const networkBytes = Buffer.alloc(exports.NETWORK_BUFFER_LENGTH);
    networkBytes.writeUInt8(network, 0);
    const { aBytes: targetABytes, bBytes: targetBBytes, cBytes: targetCBytes, dBytes: targetDBytes, } = exports.getIPBytes(targetAddress);
    if (network === NETWORK.NET_OTHER) {
        throw Error('IP address is unsupported.');
    }
    if (network !== NETWORK.NET_IPV4) {
        return lisk_cryptography_1.hash(Buffer.concat([secretBytes, networkBytes])).readUInt32BE(0) % bucketCount;
    }
    const addressBytes = Buffer.concat([targetABytes, targetBBytes, targetCBytes, targetDBytes]);
    const kBytes = Buffer.alloc(firstMod);
    const sourceBytes = sourceAddress ? exports.getIPBytes(sourceAddress) : undefined;
    const k = peerType === PEER_TYPE.NEW_PEER && sourceBytes
        ? lisk_cryptography_1.hash(Buffer.concat([
            secretBytes,
            networkBytes,
            sourceBytes.aBytes,
            sourceBytes.bBytes,
            targetABytes,
            targetBBytes,
        ])).readUInt32BE(0) % firstMod
        : lisk_cryptography_1.hash(Buffer.concat([secretBytes, networkBytes, addressBytes])).readUInt32BE(0) % firstMod;
    kBytes.writeUInt32BE(k, 0);
    const bucketBytes = peerType === PEER_TYPE.NEW_PEER && sourceBytes
        ? Buffer.concat([secretBytes, networkBytes, sourceBytes.aBytes, sourceBytes.bBytes, kBytes])
        : Buffer.concat([secretBytes, networkBytes, targetABytes, targetBBytes, kBytes]);
    return lisk_cryptography_1.hash(bucketBytes).readUInt32BE(0) % bucketCount;
};
//# sourceMappingURL=network.js.map