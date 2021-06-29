"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyMessage = exports.validatePacket = exports.validateProtocolMessage = exports.validateRPCRequest = exports.validatePeerInfoList = exports.validatePayloadSize = exports.validatePeerInfo = exports.validatePeerAddress = exports.validatePeerCompatibility = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const _1 = require(".");
const schemas_1 = require("./schemas");
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
const validatePeerCompatibility = (peerInfo, nodeInfo) => {
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
exports.validatePeerCompatibility = validatePeerCompatibility;
const validatePeerAddress = (ipAddress, port) => {
    if (!lisk_validator_1.isIPV4(ipAddress) || !lisk_validator_1.isPort(port.toString())) {
        return false;
    }
    return true;
};
exports.validatePeerAddress = validatePeerAddress;
const validatePeerInfo = (peerInfo, maxByteSize) => {
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
exports.validatePeerInfo = validatePeerInfo;
const validatePayloadSize = (nodeInfo, maxByteSize) => {
    if (nodeInfo === undefined) {
        return;
    }
    if (_1.getByteSize(nodeInfo) > maxByteSize) {
        throw new errors_1.InvalidNodeInfoError(`Invalid NodeInfo was larger than the maximum allowed ${maxByteSize} bytes`);
    }
};
exports.validatePayloadSize = validatePayloadSize;
const validatePeerInfoList = (peersList, maxPeerInfoListLength, maxPeerInfoByteSize) => {
    if (peersList.length > maxPeerInfoListLength) {
        throw new errors_1.InvalidPeerInfoListError(constants_1.PEER_INFO_LIST_TOO_LONG_REASON);
    }
    peersList.map(peerInfo => exports.validatePeerInfo(peerInfo, maxPeerInfoByteSize));
};
exports.validatePeerInfoList = validatePeerInfoList;
const validateRPCRequest = (request) => {
    const errors = lisk_validator_1.validator.validate(schemas_1.rpcRequestSchema, request);
    if (errors.length) {
        throw new Error('RPC request format is invalid.');
    }
};
exports.validateRPCRequest = validateRPCRequest;
const validateProtocolMessage = (message) => {
    const errors = lisk_validator_1.validator.validate(schemas_1.protocolMessageSchema, message);
    if (errors.length) {
        throw new Error('Protocol message format is invalid.');
    }
};
exports.validateProtocolMessage = validateProtocolMessage;
const validatePacket = (packet) => {
    const errors = lisk_validator_1.validator.validate(schemas_1.packetSchema, packet);
    if (errors.length) {
        throw new Error('Packet format is invalid.');
    }
};
exports.validatePacket = validatePacket;
const isEmptyMessage = (data) => {
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
exports.isEmptyMessage = isEmptyMessage;
//# sourceMappingURL=validate.js.map