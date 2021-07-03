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
exports.P2P = exports.DEFAULT_WS_MAX_PAYLOAD = exports.DEFAULT_SEND_PEER_LIMIT = exports.DEFAULT_DISCOVERY_INTERVAL = exports.NODE_HOST_IP = exports.EVENT_NEW_PEER = exports.EVENT_FAILED_TO_ADD_INBOUND_PEER = exports.EVENT_NEW_INBOUND_PEER = exports.EVENT_FAILED_PEER_INFO_UPDATE = exports.EVENT_UPDATED_PEER_INFO = exports.EVENT_INBOUND_SOCKET_ERROR = exports.EVENT_OUTBOUND_SOCKET_ERROR = exports.EVENT_MESSAGE_RECEIVED = exports.EVENT_REQUEST_RECEIVED = exports.EVENT_FAILED_TO_PUSH_NODE_INFO = exports.EVENT_FAILED_TO_FETCH_PEER_INFO = exports.EVENT_DISCOVERED_PEER = exports.EVENT_CONNECT_OUTBOUND = exports.EVENT_CONNECT_ABORT_OUTBOUND = exports.EVENT_CLOSE_OUTBOUND = exports.P2PRequest = void 0;
const events_1 = require("events");
const http = require("http");
const shuffle = require("lodash.shuffle");
const socketcluster_server_1 = require("socketcluster-server");
const url = require("url");
const peer_1 = require("./peer");
const disconnect_status_codes_1 = require("./disconnect_status_codes");
const errors_1 = require("./errors");
const p2p_request_1 = require("./p2p_request");
Object.defineProperty(exports, "P2PRequest", { enumerable: true, get: function () { return p2p_request_1.P2PRequest; } });
const peer_selection_1 = require("./peer_selection");
const peer_pool_1 = require("./peer_pool");
Object.defineProperty(exports, "EVENT_CLOSE_OUTBOUND", { enumerable: true, get: function () { return peer_pool_1.EVENT_CLOSE_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_CONNECT_ABORT_OUTBOUND", { enumerable: true, get: function () { return peer_pool_1.EVENT_CONNECT_ABORT_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_CONNECT_OUTBOUND", { enumerable: true, get: function () { return peer_pool_1.EVENT_CONNECT_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_DISCOVERED_PEER", { enumerable: true, get: function () { return peer_pool_1.EVENT_DISCOVERED_PEER; } });
Object.defineProperty(exports, "EVENT_FAILED_PEER_INFO_UPDATE", { enumerable: true, get: function () { return peer_pool_1.EVENT_FAILED_PEER_INFO_UPDATE; } });
Object.defineProperty(exports, "EVENT_FAILED_TO_FETCH_PEER_INFO", { enumerable: true, get: function () { return peer_pool_1.EVENT_FAILED_TO_FETCH_PEER_INFO; } });
Object.defineProperty(exports, "EVENT_FAILED_TO_PUSH_NODE_INFO", { enumerable: true, get: function () { return peer_pool_1.EVENT_FAILED_TO_PUSH_NODE_INFO; } });
Object.defineProperty(exports, "EVENT_INBOUND_SOCKET_ERROR", { enumerable: true, get: function () { return peer_pool_1.EVENT_INBOUND_SOCKET_ERROR; } });
Object.defineProperty(exports, "EVENT_MESSAGE_RECEIVED", { enumerable: true, get: function () { return peer_pool_1.EVENT_MESSAGE_RECEIVED; } });
Object.defineProperty(exports, "EVENT_OUTBOUND_SOCKET_ERROR", { enumerable: true, get: function () { return peer_pool_1.EVENT_OUTBOUND_SOCKET_ERROR; } });
Object.defineProperty(exports, "EVENT_REQUEST_RECEIVED", { enumerable: true, get: function () { return peer_pool_1.EVENT_REQUEST_RECEIVED; } });
Object.defineProperty(exports, "EVENT_UPDATED_PEER_INFO", { enumerable: true, get: function () { return peer_pool_1.EVENT_UPDATED_PEER_INFO; } });
const validation_1 = require("./validation");
exports.EVENT_NEW_INBOUND_PEER = 'newInboundPeer';
exports.EVENT_FAILED_TO_ADD_INBOUND_PEER = 'failedToAddInboundPeer';
exports.EVENT_NEW_PEER = 'newPeer';
exports.NODE_HOST_IP = '0.0.0.0';
exports.DEFAULT_DISCOVERY_INTERVAL = 30000;
exports.DEFAULT_SEND_PEER_LIMIT = 25;
exports.DEFAULT_WS_MAX_PAYLOAD = 1048576;
const BASE_10_RADIX = 10;
const selectRandomPeerSample = (peerList, count) => shuffle(peerList).slice(0, count);
class P2P extends events_1.EventEmitter {
    constructor(config) {
        super();
        this._config = config;
        this._isActive = false;
        this._newPeers = new Map();
        this._triedPeers = new Map();
        this._httpServer = http.createServer();
        this._scServer = socketcluster_server_1.attach(this._httpServer, {
            wsEngineServerOptions: {
                maxPayload: config.wsMaxPayload
                    ? config.wsMaxPayload
                    : exports.DEFAULT_WS_MAX_PAYLOAD,
            },
        });
        this._handlePeerPoolRPC = (request) => {
            if (request.procedure === peer_1.REMOTE_RPC_GET_ALL_PEERS_LIST) {
                this._handleGetPeersRequest(request);
            }
            this.emit(peer_pool_1.EVENT_REQUEST_RECEIVED, request);
        };
        this._handlePeerPoolMessage = (message) => {
            this.emit(peer_pool_1.EVENT_MESSAGE_RECEIVED, message);
        };
        this._handlePeerConnect = (peerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            const foundTriedPeer = this._triedPeers.get(peerId);
            this._newPeers.delete(peerId);
            if (foundTriedPeer) {
                const updatedPeerInfo = Object.assign(Object.assign({}, peerInfo), { ipAddress: foundTriedPeer.ipAddress, wsPort: foundTriedPeer.wsPort });
                this._triedPeers.set(peerId, updatedPeerInfo);
            }
            else {
                this._triedPeers.set(peerId, peerInfo);
            }
            this.emit(peer_pool_1.EVENT_CONNECT_OUTBOUND, peerInfo);
        };
        this._handlePeerConnectAbort = (peerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            if (this._newPeers.has(peerId)) {
                this._newPeers.delete(peerId);
            }
            if (this._triedPeers.has(peerId)) {
                this._triedPeers.delete(peerId);
            }
            this.emit(peer_pool_1.EVENT_CONNECT_ABORT_OUTBOUND, peerInfo);
        };
        this._handlePeerClose = (closePacket) => {
            this.emit(peer_pool_1.EVENT_CLOSE_OUTBOUND, closePacket);
        };
        this._handlePeerInfoUpdate = (peerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            const foundTriedPeer = this._triedPeers.get(peerId);
            const foundNewPeer = this._newPeers.get(peerId);
            if (foundTriedPeer) {
                const updatedPeerInfo = Object.assign(Object.assign({}, peerInfo), { ipAddress: foundTriedPeer.ipAddress, wsPort: foundTriedPeer.wsPort });
                this._triedPeers.set(peerId, updatedPeerInfo);
            }
            if (foundNewPeer) {
                const updatedPeerInfo = Object.assign(Object.assign({}, peerInfo), { ipAddress: foundNewPeer.ipAddress, wsPort: foundNewPeer.wsPort });
                this._newPeers.set(peerId, updatedPeerInfo);
            }
            this.emit(peer_pool_1.EVENT_UPDATED_PEER_INFO, peerInfo);
        };
        this._handleFailedPeerInfoUpdate = (error) => {
            this.emit(peer_pool_1.EVENT_FAILED_PEER_INFO_UPDATE, error);
        };
        this._handleDiscoveredPeer = (detailedPeerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(detailedPeerInfo);
            const foundTriedPeer = this._triedPeers.get(peerId);
            if (this._newPeers.has(peerId)) {
                this._newPeers.delete(peerId);
            }
            if (!foundTriedPeer) {
                this._triedPeers.set(peerId, detailedPeerInfo);
            }
            else {
                const updatedPeerInfo = Object.assign(Object.assign({}, detailedPeerInfo), { ipAddress: foundTriedPeer.ipAddress, wsPort: foundTriedPeer.wsPort });
                this._triedPeers.set(peerId, updatedPeerInfo);
            }
            this.emit(peer_pool_1.EVENT_DISCOVERED_PEER, detailedPeerInfo);
        };
        this._handleFailedToPushNodeInfo = (error) => {
            this.emit(peer_pool_1.EVENT_FAILED_TO_PUSH_NODE_INFO, error);
        };
        this._handleFailedToFetchPeerInfo = (error) => {
            this.emit(peer_pool_1.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
        };
        this._handleOutboundSocketError = (error) => {
            this.emit(peer_pool_1.EVENT_OUTBOUND_SOCKET_ERROR, error);
        };
        this._handleInboundSocketError = (error) => {
            this.emit(peer_pool_1.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        this._peerPool = new peer_pool_1.PeerPool({
            connectTimeout: config.connectTimeout,
            ackTimeout: config.ackTimeout,
            wsMaxPayload: config.wsMaxPayload
                ? config.wsMaxPayload
                : exports.DEFAULT_WS_MAX_PAYLOAD,
            peerSelectionForSend: config.peerSelectionForSend
                ? config.peerSelectionForSend
                : peer_selection_1.selectPeersForSend,
            peerSelectionForRequest: config.peerSelectionForRequest
                ? config.peerSelectionForRequest
                : peer_selection_1.selectPeersForRequest,
            peerSelectionForConnection: config.peerSelectionForConnection
                ? config.peerSelectionForConnection
                : peer_selection_1.selectPeersForConnection,
            sendPeerLimit: config.sendPeerLimit === undefined
                ? exports.DEFAULT_SEND_PEER_LIMIT
                : config.sendPeerLimit,
        });
        this._bindHandlersToPeerPool(this._peerPool);
        if (config.triedPeers) {
            config.triedPeers.forEach(peerInfo => {
                const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
                if (!this._triedPeers.has(peerId)) {
                    this._triedPeers.set(peerId, peerInfo);
                }
            });
        }
        this._nodeInfo = config.nodeInfo;
        this.applyNodeInfo(this._nodeInfo);
        this._discoveryInterval = config.discoveryInterval
            ? config.discoveryInterval
            : exports.DEFAULT_DISCOVERY_INTERVAL;
        this._peerHandshakeCheck = config.peerHandshakeCheck
            ? config.peerHandshakeCheck
            : validation_1.checkPeerCompatibility;
    }
    get config() {
        return this._config;
    }
    get isActive() {
        return this._isActive;
    }
    applyNodeInfo(nodeInfo) {
        this._nodeInfo = Object.assign({}, nodeInfo);
        this._peerPool.applyNodeInfo(this._nodeInfo);
    }
    get nodeInfo() {
        return this._nodeInfo;
    }
    applyPenalty(penalty) {
        penalty;
    }
    getNetworkStatus() {
        return {
            newPeers: [...this._newPeers.values()],
            triedPeers: [...this._triedPeers.values()],
            connectedPeers: this._peerPool.getAllConnectedPeerInfos(),
            connectedUniquePeers: this._peerPool.getUniqueConnectedPeers(),
        };
    }
    async request(packet) {
        const response = await this._peerPool.requestFromPeer(packet);
        return response;
    }
    send(message) {
        this._peerPool.sendToPeers(message);
    }
    _disconnectSocketDueToFailedHandshake(socket, statusCode, closeReason) {
        socket.disconnect(statusCode, closeReason);
        this.emit(exports.EVENT_FAILED_TO_ADD_INBOUND_PEER, new errors_1.PeerInboundHandshakeError(closeReason, statusCode, socket.remoteAddress, socket.request.url));
    }
    async _startPeerServer() {
        this._scServer.on('connection', (socket) => {
            if (this._config.blacklistedPeers) {
                const blacklist = this._config.blacklistedPeers.map(peer => peer.ipAddress);
                if (blacklist.includes(socket.remoteAddress)) {
                    this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.FORBIDDEN_CONNECTION, disconnect_status_codes_1.FORBIDDEN_CONNECTION_REASON);
                    return;
                }
            }
            if (!socket.request.url) {
                this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.INVALID_CONNECTION_URL_CODE, disconnect_status_codes_1.INVALID_CONNECTION_URL_REASON);
                return;
            }
            const queryObject = url.parse(socket.request.url, true).query;
            if (queryObject.nonce === this._nodeInfo.nonce) {
                this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.INVALID_CONNECTION_SELF_CODE, disconnect_status_codes_1.INVALID_CONNECTION_SELF_REASON);
                const selfWSPort = queryObject.wsPort
                    ? +queryObject.wsPort
                    : this._nodeInfo.wsPort;
                const selfPeerId = peer_1.constructPeerId(socket.remoteAddress, selfWSPort);
                this._newPeers.delete(selfPeerId);
                this._triedPeers.delete(selfPeerId);
                return;
            }
            if (typeof queryObject.wsPort !== 'string' ||
                typeof queryObject.version !== 'string' ||
                typeof queryObject.nethash !== 'string') {
                this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.INVALID_CONNECTION_QUERY_CODE, disconnect_status_codes_1.INVALID_CONNECTION_QUERY_REASON);
                return;
            }
            const wsPort = parseInt(queryObject.wsPort, BASE_10_RADIX);
            const peerId = peer_1.constructPeerId(socket.remoteAddress, wsPort);
            let queryOptions;
            try {
                queryOptions =
                    typeof queryObject.options === 'string'
                        ? JSON.parse(queryObject.options)
                        : undefined;
            }
            catch (error) {
                this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.INVALID_CONNECTION_QUERY_CODE, disconnect_status_codes_1.INVALID_CONNECTION_QUERY_REASON);
                return;
            }
            const incomingPeerInfo = Object.assign(Object.assign(Object.assign({}, queryObject), queryOptions), { ipAddress: socket.remoteAddress, wsPort, height: queryObject.height ? +queryObject.height : 0, version: queryObject.version });
            const { success, errors } = this._peerHandshakeCheck(incomingPeerInfo, this._nodeInfo);
            if (!success) {
                const incompatibilityReason = errors && Array.isArray(errors)
                    ? errors.join(',')
                    : disconnect_status_codes_1.INCOMPATIBLE_PEER_UNKNOWN_REASON;
                this._disconnectSocketDueToFailedHandshake(socket, disconnect_status_codes_1.INCOMPATIBLE_PEER_CODE, incompatibilityReason);
                return;
            }
            const isNewPeer = this._peerPool.addInboundPeer(peerId, incomingPeerInfo, socket);
            if (isNewPeer) {
                this.emit(exports.EVENT_NEW_INBOUND_PEER, incomingPeerInfo);
                this.emit(exports.EVENT_NEW_PEER, incomingPeerInfo);
            }
            if (!this._newPeers.has(peerId) && !this._triedPeers.has(peerId)) {
                this._newPeers.set(peerId, incomingPeerInfo);
            }
        });
        this._httpServer.listen(this._nodeInfo.wsPort, exports.NODE_HOST_IP);
        if (this._scServer.isReady) {
            this._isActive = true;
            return;
        }
        return new Promise(resolve => {
            this._scServer.once('ready', () => {
                this._isActive = true;
                resolve();
            });
        });
    }
    async _stopHTTPServer() {
        return new Promise(resolve => {
            this._httpServer.close(() => {
                resolve();
            });
        });
    }
    async _stopWSServer() {
        return new Promise(resolve => {
            this._scServer.close(() => {
                resolve();
            });
        });
    }
    async _stopPeerServer() {
        await this._stopWSServer();
        await this._stopHTTPServer();
        this._isActive = false;
    }
    async _discoverPeers(knownPeers = []) {
        if (!this._isActive) {
            return;
        }
        const discoveredPeers = await this._peerPool.runDiscovery(knownPeers, this._config.blacklistedPeers || []);
        if (!this._isActive) {
            return;
        }
        discoveredPeers.forEach((peerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            if (!this._triedPeers.has(peerId) &&
                !this._newPeers.has(peerId) &&
                peerInfo.nonce !== this._nodeInfo.nonce) {
                this._newPeers.set(peerId, peerInfo);
            }
        });
        this._peerPool.selectPeersAndConnect([...this._newPeers.values()]);
    }
    async _startDiscovery() {
        if (this._discoveryIntervalId) {
            throw new Error('Discovery is already running');
        }
        this._discoveryIntervalId = setInterval(async () => {
            await this._discoverPeers([...this._triedPeers.values()]);
        }, this._discoveryInterval);
        await this._discoverPeers([...this._triedPeers.values()]);
    }
    _stopDiscovery() {
        if (!this._discoveryIntervalId) {
            throw new Error('Discovery is not running');
        }
        clearInterval(this._discoveryIntervalId);
    }
    async _fetchSeedPeerStatus(seedPeers) {
        const peerConfig = {
            ackTimeout: this._config.ackTimeout,
            connectTimeout: this._config.connectTimeout,
        };
        const seedPeerUpdatedInfos = await this._peerPool.fetchStatusAndCreatePeers(seedPeers, this._nodeInfo, peerConfig);
        return seedPeerUpdatedInfos;
    }
    _pickRandomDiscoveredPeers(count) {
        const discoveredPeerList = [
            ...this._triedPeers.values(),
        ];
        return selectRandomPeerSample(discoveredPeerList, count);
    }
    _handleGetPeersRequest(request) {
        const peers = this._pickRandomDiscoveredPeers(peer_pool_1.MAX_PEER_LIST_BATCH_SIZE).map((peerInfo) => {
            const { ipAddress } = peerInfo, peerInfoWithoutIp = __rest(peerInfo, ["ipAddress"]);
            return Object.assign(Object.assign({}, peerInfoWithoutIp), { ip: ipAddress, broadhash: peerInfoWithoutIp.broadhash
                    ? peerInfoWithoutIp.broadhash
                    : '', nonce: peerInfoWithoutIp.nonce
                    ? peerInfoWithoutIp.nonce
                    : '' });
        });
        const protocolPeerInfoList = {
            success: true,
            peers,
        };
        request.end(protocolPeerInfoList);
    }
    async start() {
        if (this._isActive) {
            throw new Error('Cannot start the node because it is already active');
        }
        await this._startPeerServer();
        const seedPeerInfos = await this._fetchSeedPeerStatus(this._config.seedPeers);
        seedPeerInfos.forEach(seedInfo => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(seedInfo);
            if (!this._triedPeers.has(peerId)) {
                this._triedPeers.set(peerId, seedInfo);
            }
        });
        await this._startDiscovery();
    }
    async stop() {
        if (!this._isActive) {
            throw new Error('Cannot stop the node because it is not active');
        }
        this._stopDiscovery();
        this._peerPool.removeAllPeers();
        await this._stopPeerServer();
    }
    _bindHandlersToPeerPool(peerPool) {
        peerPool.on(peer_pool_1.EVENT_REQUEST_RECEIVED, this._handlePeerPoolRPC);
        peerPool.on(peer_pool_1.EVENT_MESSAGE_RECEIVED, this._handlePeerPoolMessage);
        peerPool.on(peer_pool_1.EVENT_CONNECT_OUTBOUND, this._handlePeerConnect);
        peerPool.on(peer_pool_1.EVENT_CONNECT_ABORT_OUTBOUND, this._handlePeerConnectAbort);
        peerPool.on(peer_pool_1.EVENT_CLOSE_OUTBOUND, this._handlePeerClose);
        peerPool.on(peer_pool_1.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peerPool.on(peer_pool_1.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peerPool.on(peer_pool_1.EVENT_DISCOVERED_PEER, this._handleDiscoveredPeer);
        peerPool.on(peer_pool_1.EVENT_FAILED_TO_PUSH_NODE_INFO, this._handleFailedToPushNodeInfo);
        peerPool.on(peer_pool_1.EVENT_FAILED_TO_FETCH_PEER_INFO, this._handleFailedToFetchPeerInfo);
        peerPool.on(peer_pool_1.EVENT_OUTBOUND_SOCKET_ERROR, this._handleOutboundSocketError);
        peerPool.on(peer_pool_1.EVENT_INBOUND_SOCKET_ERROR, this._handleInboundSocketError);
    }
}
exports.P2P = P2P;
//# sourceMappingURL=p2p.js.map