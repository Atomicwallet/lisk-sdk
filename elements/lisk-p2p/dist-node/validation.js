"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPeerCompatibility = exports.checkProtocolVersionCompatibility = exports.checkNetworkCompatibility = exports.validateProtocolMessage = exports.validateRPCRequest = exports.validatePeerInfoList = exports.validatePeerInfo = exports.validatePeerAddress = void 0;
const semver_1 = require("semver");
const validator_1 = require("validator");
const errors_1 = require("./errors");
const disconnect_status_codes_1 = require("./disconnect_status_codes");
const IPV4_NUMBER = 4;
const IPV6_NUMBER = 6;
const validatePeerAddress = (ip, wsPort) => {
    if ((!validator_1.isIP(ip, IPV4_NUMBER) && !validator_1.isIP(ip, IPV6_NUMBER)) ||
        !validator_1.isPort(wsPort.toString())) {
        return false;
    }
    return true;
};
exports.validatePeerAddress = validatePeerAddress;
const validatePeerInfo = (rawPeerInfo) => {
    if (!rawPeerInfo) {
        throw new errors_1.InvalidPeerError(`Invalid peer object`);
    }
    const protocolPeer = rawPeerInfo;
    if (!protocolPeer.ip ||
        !protocolPeer.wsPort ||
        !exports.validatePeerAddress(protocolPeer.ip, protocolPeer.wsPort)) {
        throw new errors_1.InvalidPeerError(`Invalid peer ip or port`);
    }
    if (!protocolPeer.version || !semver_1.valid(protocolPeer.version)) {
        throw new errors_1.InvalidPeerError(`Invalid peer version`);
    }
    const version = protocolPeer.version;
    const protocolVersion = protocolPeer.protocolVersion;
    const wsPort = +protocolPeer.wsPort;
    const os = protocolPeer.os ? protocolPeer.os : '';
    const height = protocolPeer.height && validator_1.isNumeric(protocolPeer.height.toString())
        ? +protocolPeer.height
        : 0;
    const { options } = protocolPeer, protocolPeerWithoutOptions = __rest(protocolPeer, ["options"]);
    const peerInfo = Object.assign(Object.assign({}, protocolPeerWithoutOptions), { ipAddress: protocolPeerWithoutOptions.ip, wsPort,
        height,
        os,
        version,
        protocolVersion });
    const { ip } = peerInfo, peerInfoUpdated = __rest(peerInfo, ["ip"]);
    return peerInfoUpdated;
};
exports.validatePeerInfo = validatePeerInfo;
const validatePeerInfoList = (rawPeerInfoList) => {
    if (!rawPeerInfoList) {
        throw new errors_1.InvalidRPCResponseError('Invalid response type');
    }
    const { peers } = rawPeerInfoList;
    if (Array.isArray(peers)) {
        const peerList = peers.map(exports.validatePeerInfo);
        return peerList;
    }
    else {
        throw new errors_1.InvalidRPCResponseError('Invalid response type');
    }
};
exports.validatePeerInfoList = validatePeerInfoList;
const validateRPCRequest = (request) => {
    if (!request) {
        throw new errors_1.InvalidRPCRequestError('Invalid request');
    }
    const rpcRequest = request;
    if (typeof rpcRequest.procedure !== 'string') {
        throw new errors_1.InvalidRPCRequestError('Request procedure name is not a string');
    }
    return rpcRequest;
};
exports.validateRPCRequest = validateRPCRequest;
const validateProtocolMessage = (message) => {
    if (!message) {
        throw new errors_1.InvalidProtocolMessageError('Invalid message');
    }
    const protocolMessage = message;
    if (typeof protocolMessage.event !== 'string') {
        throw new errors_1.InvalidProtocolMessageError('Protocol message is not a string');
    }
    return protocolMessage;
};
exports.validateProtocolMessage = validateProtocolMessage;
const checkNetworkCompatibility = (peerInfo, nodeInfo) => {
    if (!peerInfo.nethash) {
        return false;
    }
    return peerInfo.nethash === nodeInfo.nethash;
};
exports.checkNetworkCompatibility = checkNetworkCompatibility;
const checkProtocolVersionCompatibility = (peerInfo, nodeInfo) => {
    if (!peerInfo.protocolVersion) {
        try {
            return semver_1.gte(peerInfo.version, nodeInfo.minVersion);
        }
        catch (error) {
            return false;
        }
    }
    if (typeof peerInfo.protocolVersion !== 'string') {
        return false;
    }
    const peerHardForks = parseInt(peerInfo.protocolVersion.split('.')[0], 10);
    const systemHardForks = parseInt(nodeInfo.protocolVersion.split('.')[0], 10);
    return systemHardForks === peerHardForks && peerHardForks >= 1;
};
exports.checkProtocolVersionCompatibility = checkProtocolVersionCompatibility;
const checkPeerCompatibility = (peerInfo, nodeInfo) => {
    if (!exports.checkNetworkCompatibility(peerInfo, nodeInfo)) {
        return {
            success: false,
            errors: [disconnect_status_codes_1.INCOMPATIBLE_NETWORK_REASON],
        };
    }
    if (!exports.checkProtocolVersionCompatibility(peerInfo, nodeInfo)) {
        return {
            success: false,
            errors: [disconnect_status_codes_1.INCOMPATIBLE_PROTOCOL_VERSION_REASON],
        };
    }
    return {
        success: true,
    };
};
exports.checkPeerCompatibility = checkPeerCompatibility;
//# sourceMappingURL=validation.js.map