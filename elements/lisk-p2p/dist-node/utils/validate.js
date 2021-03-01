"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_validator_1 = require("@liskhq/lisk-validator");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const _1 = require(".");
const validateNetworkCompatibility = (peerInfo, nodeInfo) => {
    if (!peerInfo.sharedState) {
        return false;
    }
    if (!peerInfo.sharedState.networkIdentifier) {
        return false;
    }
    return peerInfo.sharedState.networkIdentifier === nodeInfo.networkIdentifier;
};
const validateNetworkVersionCompatibility = (peerInfo, nodeInfo) => {
    if (!peerInfo.sharedState) {
        return false;
    }
    if (typeof peerInfo.sharedState.networkVersion !== 'string') {
        return false;
    }
    const peerHardForks = parseInt(peerInfo.sharedState.networkVersion.split('.')[0], 10);
    const systemHardForks = parseInt(nodeInfo.networkVersion.split('.')[0], 10);
    return systemHardForks === peerHardForks && peerHardForks >= 1;
};
exports.validatePeerCompatibility = (peerInfo, nodeInfo) => {
    if (!validateNetworkCompatibility(peerInfo, nodeInfo)) {
        return {
            success: false,
            error: constants_1.INCOMPATIBLE_NETWORK_REASON,
        };
    }
    if (!validateNetworkVersionCompatibility(peerInfo, nodeInfo)) {
        return {
            success: false,
            error: constants_1.INCOMPATIBLE_PROTOCOL_VERSION_REASON,
        };
    }
    return {
        success: true,
    };
};
exports.validatePeerAddress = (ipAddress, port) => {
    if (!lisk_validator_1.isIP(ipAddress) || !lisk_validator_1.isPort(port.toString())) {
        return false;
    }
    return true;
};
exports.validatePeerInfo = (peerInfo, maxByteSize) => {
    if (!peerInfo) {
        throw new errors_1.InvalidPeerInfoError('Invalid peer object');
    }
    if (!peerInfo.ipAddress ||
        !peerInfo.port ||
        !exports.validatePeerAddress(peerInfo.ipAddress, peerInfo.port)) {
        throw new errors_1.InvalidPeerInfoError(`Invalid peer ipAddress or port for peer with ip: ${peerInfo.ipAddress} and port ${peerInfo.port}`);
    }
    const byteSize = _1.getByteSize(peerInfo);
    if (byteSize > maxByteSize) {
        throw new errors_1.InvalidPeerInfoError(`PeerInfo is larger than the maximum allowed size ${maxByteSize} bytes`);
    }
    return peerInfo;
};
exports.validateNodeInfo = (nodeInfo, maxByteSize) => {
    const byteSize = _1.getByteSize(nodeInfo);
    if (byteSize > maxByteSize) {
        throw new errors_1.InvalidNodeInfoError(`Invalid NodeInfo was larger than the maximum allowed ${maxByteSize} bytes`);
    }
};
exports.validatePeerInfoList = (rawBasicPeerInfoList, maxPeerInfoListLength, maxPeerInfoByteSize) => {
    if (!rawBasicPeerInfoList) {
        throw new errors_1.InvalidPeerInfoListError(constants_1.INVALID_PEER_INFO_LIST_REASON);
    }
    const { peers } = rawBasicPeerInfoList;
    if (Array.isArray(peers)) {
        if (peers.length === 0) {
            return [];
        }
        if (peers.length > maxPeerInfoListLength) {
            throw new errors_1.InvalidPeerInfoListError(constants_1.PEER_INFO_LIST_TOO_LONG_REASON);
        }
        const sanitizedPeerList = peers.map(peerInfo => exports.validatePeerInfo(_1.sanitizeIncomingPeerInfo(peerInfo), maxPeerInfoByteSize));
        return sanitizedPeerList;
    }
    throw new errors_1.InvalidPeerInfoListError(constants_1.INVALID_PEER_INFO_LIST_REASON);
};
exports.validateRPCRequest = (request) => {
    if (!request) {
        throw new errors_1.InvalidRPCRequestError('Invalid request');
    }
    const rpcRequest = request;
    if (typeof rpcRequest.procedure !== 'string') {
        throw new errors_1.InvalidRPCRequestError('Request procedure name is not a string');
    }
    return rpcRequest;
};
exports.validateProtocolMessage = (message) => {
    if (!message) {
        throw new errors_1.InvalidProtocolMessageError('Invalid message');
    }
    const protocolMessage = message;
    if (typeof protocolMessage.event !== 'string') {
        throw new errors_1.InvalidProtocolMessageError('Protocol message is not a string');
    }
    return protocolMessage;
};
const packetSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        event: {
            type: 'string',
        },
        procedure: {
            type: 'string',
        },
        cid: {
            type: 'integer',
        },
        rid: {
            type: 'integer',
        },
        data: {
            type: ['object', 'string'],
        },
    },
};
exports.validatePacket = (packet) => {
    const errors = lisk_validator_1.validator.validate(packetSchema, packet);
    if (errors.length) {
        throw new Error('Packet format is invalid.');
    }
};
exports.isEmptyMessage = (data) => {
    if (data === undefined || data === null) {
        return true;
    }
    if (typeof data === 'object' &&
        !Array.isArray(data) &&
        Object.keys(data).length === 0) {
        return true;
    }
    if (Array.isArray(data) && data.length === 0) {
        return true;
    }
    return false;
};
//# sourceMappingURL=validate.js.map