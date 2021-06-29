"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeNodeInfo = exports.encodePeerInfo = exports.decodeNodeInfo = exports.decodePeerInfo = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const errors_1 = require("../errors");
const decodePeerInfo = (peerInfoSchema, data) => {
    try {
        if (!Buffer.isBuffer(data)) {
            throw new Error('Invalid encoded data');
        }
        return lisk_codec_1.codec.decode(peerInfoSchema, data);
    }
    catch (error) {
        throw new errors_1.InvalidPeerInfoError(error.message);
    }
};
exports.decodePeerInfo = decodePeerInfo;
const decodeNodeInfo = (nodeInfoSchema, data) => {
    try {
        if (!Buffer.isBuffer(data)) {
            throw new Error('Invalid encoded data');
        }
        return lisk_codec_1.codec.decode(nodeInfoSchema, data);
    }
    catch (error) {
        throw new errors_1.InvalidNodeInfoError(error.message);
    }
};
exports.decodeNodeInfo = decodeNodeInfo;
const encodePeerInfo = (peerInfoSchema, data) => lisk_codec_1.codec.encode(peerInfoSchema, data);
exports.encodePeerInfo = encodePeerInfo;
const encodeNodeInfo = (nodeInfoSchema, data) => lisk_codec_1.codec.encode(nodeInfoSchema, data);
exports.encodeNodeInfo = encodeNodeInfo;
//# sourceMappingURL=codec.js.map