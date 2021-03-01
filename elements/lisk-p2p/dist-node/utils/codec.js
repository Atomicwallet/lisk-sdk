"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const errors_1 = require("../errors");
exports.decodePeerInfo = (peerInfoSchema, data) => {
    try {
        if (typeof data !== 'string' || !lisk_validator_1.isHexString(data)) {
            throw new Error('Invalid encoded data');
        }
        return lisk_codec_1.codec.decode(peerInfoSchema, Buffer.from(data, 'hex'));
    }
    catch (error) {
        throw new errors_1.InvalidPeerInfoError(error.message);
    }
};
exports.decodeNodeInfo = (nodeInfoSchema, data) => {
    try {
        if (typeof data !== 'string' || !lisk_validator_1.isHexString(data)) {
            throw new Error('Invalid encoded data');
        }
        return lisk_codec_1.codec.decode(nodeInfoSchema, Buffer.from(data, 'hex'));
    }
    catch (error) {
        throw new errors_1.InvalidNodeInfoError(error.message);
    }
};
exports.encodePeerInfo = (peerInfoSchema, data) => lisk_codec_1.codec.encode(peerInfoSchema, data);
exports.encodeNodeInfo = (nodeInfoSchema, data) => lisk_codec_1.codec.encode(nodeInfoSchema, data);
//# sourceMappingURL=codec.js.map