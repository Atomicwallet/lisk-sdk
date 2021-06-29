"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2P = void 0;
const events_1 = require("events");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const events_2 = require("./events");
const peer_book_1 = require("./peer_book");
const peer_pool_1 = require("./peer_pool");
const peer_server_1 = require("./peer_server");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const codec_1 = require("./utils/codec");
const validate_1 = require("./utils/validate");
const createPeerPoolConfig = (config, peerBook) => ({
    hostPort: config.port,
    connectTimeout: config.connectTimeout,
    ackTimeout: config.ackTimeout,
    wsMaxPayload: config.wsMaxPayload ? config.wsMaxPayload : constants_1.DEFAULT_WS_MAX_PAYLOAD,
    peerSelectionForSend: config.peerSelectionForSend
        ? config.peerSelectionForSend
        : utils_1.selectPeersForSend,
    peerSelectionForRequest: config.peerSelectionForRequest
        ? config.peerSelectionForRequest
        : utils_1.selectPeersForRequest,
    peerSelectionForConnection: config.peerSelectionForConnection
        ? config.peerSelectionForConnection
        : utils_1.selectPeersForConnection,
    sendPeerLimit: config.sendPeerLimit === undefined ? constants_1.DEFAULT_SEND_PEER_LIMIT : config.sendPeerLimit,
    peerBanTime: config.peerBanTime ? config.peerBanTime : constants_1.DEFAULT_BAN_TIME,
    maxOutboundConnections: config.maxOutboundConnections === undefined
        ? constants_1.DEFAULT_MAX_OUTBOUND_CONNECTIONS
        : config.maxOutboundConnections,
    maxInboundConnections: config.maxInboundConnections === undefined
        ? constants_1.DEFAULT_MAX_INBOUND_CONNECTIONS
        : config.maxInboundConnections,
    maxPeerDiscoveryResponseLength: config.maxPeerDiscoveryResponseLength === undefined
        ? constants_1.DEFAULT_MAX_PEER_DISCOVERY_RESPONSE_LENGTH
        : config.maxPeerDiscoveryResponseLength,
    maxPeerInfoSize: config.maxPeerInfoSize ? config.maxPeerInfoSize : constants_1.DEFAULT_MAX_PEER_INFO_SIZE,
    outboundShuffleInterval: config.outboundShuffleInterval
        ? config.outboundShuffleInterval
        : constants_1.DEFAULT_OUTBOUND_SHUFFLE_INTERVAL,
    netgroupProtectionRatio: typeof config.netgroupProtectionRatio === 'number'
        ? config.netgroupProtectionRatio
        : constants_1.DEFAULT_PEER_PROTECTION_FOR_NETGROUP,
    latencyProtectionRatio: typeof config.latencyProtectionRatio === 'number'
        ? config.latencyProtectionRatio
        : constants_1.DEFAULT_PEER_PROTECTION_FOR_LATENCY,
    productivityProtectionRatio: typeof config.productivityProtectionRatio === 'number'
        ? config.productivityProtectionRatio
        : constants_1.DEFAULT_PEER_PROTECTION_FOR_USEFULNESS,
    longevityProtectionRatio: typeof config.longevityProtectionRatio === 'number'
        ? config.longevityProtectionRatio
        : constants_1.DEFAULT_PEER_PROTECTION_FOR_LONGEVITY,
    wsMaxMessageRate: typeof config.wsMaxMessageRate === 'number'
        ? config.wsMaxMessageRate
        : constants_1.DEFAULT_WS_MAX_MESSAGE_RATE,
    wsMaxMessageRatePenalty: typeof config.wsMaxMessageRatePenalty === 'number'
        ? config.wsMaxMessageRatePenalty
        : constants_1.DEFAULT_WS_MAX_MESSAGE_RATE_PENALTY,
    rateCalculationInterval: typeof config.rateCalculationInterval === 'number'
        ? config.rateCalculationInterval
        : constants_1.DEFAULT_RATE_CALCULATION_INTERVAL,
    peerStatusMessageRate: typeof config.peerStatusMessageRate === 'number'
        ? config.peerStatusMessageRate
        : constants_1.DEFAULT_PEER_STATUS_MESSAGE_RATE,
    secret: config.secret ? config.secret : constants_1.DEFAULT_RANDOM_SECRET,
    peerBook,
    rpcSchemas: config.customNodeInfoSchema
        ? {
            nodeInfo: schema_1.mergeCustomSchema(schema_1.nodeInfoSchema, config.customNodeInfoSchema),
            peerInfo: schema_1.peerInfoSchema,
            peerRequestResponse: schema_1.peerRequestResponseSchema,
        }
        : schema_1.defaultRPCSchemas,
});
class P2P extends events_1.EventEmitter {
    constructor(config) {
        var _a, _b;
        super();
        this._secret = config.secret ? config.secret : constants_1.DEFAULT_RANDOM_SECRET;
        this._sanitizedPeerLists = utils_1.sanitizePeerLists({
            seedPeers: config.seedPeers ? config.seedPeers.map(utils_1.sanitizeInitialPeerInfo) : [],
            blacklistedIPs: config.blacklistedIPs ? config.blacklistedIPs : [],
            fixedPeers: config.fixedPeers ? config.fixedPeers.map(utils_1.sanitizeInitialPeerInfo) : [],
            whitelisted: config.whitelistedPeers
                ? config.whitelistedPeers.map(utils_1.sanitizeInitialPeerInfo)
                : [],
            previousPeers: config.previousPeers
                ? config.previousPeers.map(utils_1.sanitizeInitialPeerInfo)
                : [],
        }, {
            peerId: utils_1.constructPeerId((_a = config.hostIp) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_NODE_HOST_IP, config.port),
            ipAddress: (_b = config.hostIp) !== null && _b !== void 0 ? _b : constants_1.DEFAULT_NODE_HOST_IP,
            port: config.port,
        }, this._secret);
        this._config = config;
        this._isActive = false;
        this._hasConnected = false;
        this._peerBook = new peer_book_1.PeerBook({
            sanitizedPeerLists: this._sanitizedPeerLists,
            secret: this._secret,
        });
        this._rpcSchemas = config.customNodeInfoSchema
            ? {
                nodeInfo: schema_1.mergeCustomSchema(schema_1.nodeInfoSchema, config.customNodeInfoSchema),
                peerInfo: schema_1.peerInfoSchema,
                peerRequestResponse: schema_1.peerRequestResponseSchema,
            }
            : schema_1.defaultRPCSchemas;
        lisk_codec_1.codec.addSchema(this._rpcSchemas.peerInfo);
        lisk_codec_1.codec.addSchema(this._rpcSchemas.nodeInfo);
        lisk_codec_1.codec.addSchema(this._rpcSchemas.peerRequestResponse);
        this._networkStats = {
            startTime: Date.now(),
            incoming: {
                count: 0,
                connects: 0,
                disconnects: 0,
            },
            outgoing: {
                count: 0,
                connects: 0,
                disconnects: 0,
            },
            banning: {
                bannedPeers: {},
                count: 0,
            },
            totalConnectedPeers: 0,
            totalDisconnectedPeers: 0,
            totalErrors: 0,
            totalPeersDiscovered: 0,
            totalRemovedPeers: 0,
            totalMessagesReceived: {},
            totalRequestsReceived: {},
        };
        this._handlePeerPoolRPC = (request) => {
            this._networkStats.totalRequestsReceived[request.procedure] =
                this._networkStats.totalRequestsReceived[request.procedure] + 1 || 1;
            switch (request.procedure) {
                case events_2.REMOTE_EVENT_RPC_GET_PEERS_LIST:
                    this._handleGetPeersRequest(request);
                    break;
                case events_2.REMOTE_EVENT_RPC_GET_NODE_INFO:
                    this._handleGetNodeInfo(request);
                    break;
                default:
            }
            this.emit(events_2.EVENT_REQUEST_RECEIVED, request);
        };
        this._handlePeerPoolMessage = (message) => {
            this._networkStats.totalMessagesReceived[message.event] =
                this._networkStats.totalMessagesReceived[message.event] + 1 || 1;
            if (message.event === events_2.REMOTE_EVENT_POST_NODE_INFO) {
                const decodedNodeInfo = lisk_codec_1.codec.decode(schema_1.nodeInfoSchema, message.data);
                this.emit(events_2.EVENT_MESSAGE_RECEIVED, {
                    event: message.event,
                    peerId: message.peerId,
                    data: decodedNodeInfo,
                });
                return;
            }
            this.emit(events_2.EVENT_MESSAGE_RECEIVED, message);
        };
        this._handleOutboundPeerConnect = (peerInfo) => {
            this._networkStats.outgoing.connects += 1;
            if (!this._peerBook.hasPeer(peerInfo)) {
                this._peerBook.addPeer(peerInfo);
            }
            this._peerBook.upgradePeer(peerInfo);
            this.emit(events_2.EVENT_CONNECT_OUTBOUND, peerInfo);
            if (this._isNetworkReady()) {
                this.emit(events_2.EVENT_NETWORK_READY);
            }
        };
        this._handleOutboundPeerConnectAbort = (peerInfo) => {
            if (this._peerBook.hasPeer(peerInfo)) {
                this._peerBook.downgradePeer(peerInfo);
            }
            this.emit(events_2.EVENT_CONNECT_ABORT_OUTBOUND, peerInfo);
        };
        this._handlePeerCloseOutbound = (closePacket) => {
            this._networkStats.outgoing.disconnects += 1;
            const { peerInfo } = closePacket;
            if (this._peerBook.getPeer(closePacket.peerInfo)) {
                const updatedPeer = {
                    ...peerInfo,
                    internalState: utils_1.assignInternalInfo(peerInfo, this._secret),
                };
                this._peerBook.updatePeer(updatedPeer);
            }
            this.emit(events_2.EVENT_CLOSE_OUTBOUND, closePacket);
        };
        this._handlePeerCloseInbound = (closePacket) => {
            this._networkStats.incoming.disconnects += 1;
            const { peerInfo } = closePacket;
            if (this._peerBook.getPeer(closePacket.peerInfo)) {
                const updatedPeer = {
                    ...peerInfo,
                    internalState: utils_1.assignInternalInfo(peerInfo, this._secret),
                };
                this._peerBook.updatePeer(updatedPeer);
            }
            this.emit(events_2.EVENT_CLOSE_INBOUND, closePacket);
        };
        this._handleFailedInboundPeerConnect = (err) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, err);
        };
        this._handleInboundPeerConnect = (incomingPeerConnection) => {
            if (!lisk_validator_1.isIPV4(incomingPeerConnection.socket.remoteAddress)) {
                incomingPeerConnection.socket.disconnect(constants_1.INVALID_CONNECTION_ADDRESS_CODE, constants_1.INVALID_CONNECTION_ADDRESS_REASON);
                this.emit(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, constants_1.INVALID_CONNECTION_URL_REASON);
                return;
            }
            try {
                this._peerPool.addInboundPeer(incomingPeerConnection.peerInfo, incomingPeerConnection.socket);
                if (!this._peerBook.hasPeer(incomingPeerConnection.peerInfo)) {
                    this._peerBook.addPeer({
                        ...incomingPeerConnection.peerInfo,
                        sourceAddress: incomingPeerConnection.socket.remoteAddress,
                    });
                }
                this._networkStats.incoming.connects += 1;
                this.emit(events_2.EVENT_NEW_INBOUND_PEER, incomingPeerConnection.peerInfo);
                return;
            }
            catch (err) {
                if (err instanceof errors_1.PeerInboundDuplicateConnectionError) {
                    incomingPeerConnection.socket.disconnect(constants_1.DUPLICATE_CONNECTION, constants_1.DUPLICATE_CONNECTION_REASON);
                    this.emit(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, err);
                    return;
                }
                incomingPeerConnection.socket.disconnect(constants_1.INCOMPATIBLE_PEER_CODE, constants_1.INCOMPATIBLE_PEER_UNKNOWN_REASON);
                this.emit(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, err);
            }
        };
        this._handleRemovePeer = (peerId) => {
            this._networkStats.totalRemovedPeers += 1;
            this.emit(events_2.EVENT_REMOVE_PEER, peerId);
        };
        this._handlePeerInfoUpdate = (peerInfo) => {
            if (!this._peerBook.hasPeer(peerInfo)) {
                this._peerBook.addPeer(peerInfo);
            }
            const isUpdated = this._peerBook.updatePeer(peerInfo);
            if (isUpdated) {
                this._peerBook.upgradePeer(peerInfo);
                this.emit(events_2.EVENT_UPDATED_PEER_INFO, peerInfo);
            }
        };
        this._handleFailedPeerInfoUpdate = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_PEER_INFO_UPDATE, error);
        };
        this._handleFailedToFetchPeerInfo = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
        };
        this._handleFailedToFetchPeers = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEERS, error);
        };
        this._handleFailedToCollectPeerDetails = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, error);
        };
        this._handleBanPeer = (peerId) => {
            var _a;
            const banTime = (_a = this._config.peerBanTime) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_BAN_TIME;
            if (this._peerPool.hasPeer(peerId)) {
                this._peerPool.removePeer(peerId);
            }
            this._peerBook.addBannedPeer(peerId, banTime);
            this._networkStats.banning.count += 1;
            if (!this._networkStats.banning.bannedPeers[peerId]) {
                this._networkStats.banning.bannedPeers[peerId] = {
                    banCount: 1,
                    lastBanTime: Date.now(),
                };
            }
            else {
                this._networkStats.banning.bannedPeers[peerId].banCount += 1;
                this._networkStats.banning.bannedPeers[peerId].lastBanTime = Date.now();
            }
            this.emit(events_2.EVENT_BAN_PEER, peerId);
        };
        this._handleDiscoveredPeer = (detailedPeerInfo) => {
            if (this._peerBook.hasPeer(detailedPeerInfo)) {
                return;
            }
            if (this._peerBook.addPeer(detailedPeerInfo)) {
                this._networkStats.totalPeersDiscovered += 1;
                this.emit(events_2.EVENT_DISCOVERED_PEER, detailedPeerInfo);
            }
        };
        this._handleFailedToPushNodeInfo = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_PUSH_NODE_INFO, error);
        };
        this._handleFailedToSendMessage = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_FAILED_TO_SEND_MESSAGE, error);
        };
        this._handleOutboundSocketError = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_OUTBOUND_SOCKET_ERROR, error);
        };
        this._handleInboundSocketError = (error) => {
            this._networkStats.totalErrors += 1;
            this.emit(events_2.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        const peerPoolConfig = createPeerPoolConfig(config, this._peerBook);
        this._peerPool = new peer_pool_1.PeerPool(peerPoolConfig);
        this._bindHandlersToPeerPool(this._peerPool);
        this._nodeInfo = {
            ...config.nodeInfo,
            nonce: lisk_cryptography_1.getRandomBytes(constants_1.DEFAULT_NONCE_LENGTH_BYTES).toString('hex'),
        };
        this.applyNodeInfo(this._nodeInfo);
        this._populatorInterval = config.populatorInterval
            ? config.populatorInterval
            : constants_1.DEFAULT_POPULATOR_INTERVAL;
        this._fallbackSeedPeerDiscoveryInterval = config.fallbackSeedPeerDiscoveryInterval
            ? config.fallbackSeedPeerDiscoveryInterval
            : constants_1.DEFAULT_FALLBACK_SEED_PEER_DISCOVERY_INTERVAL;
        this._nextSeedPeerDiscovery = Date.now() + this._fallbackSeedPeerDiscoveryInterval;
    }
    get config() {
        return this._config;
    }
    get isActive() {
        return this._isActive;
    }
    get nodeInfo() {
        return this._nodeInfo;
    }
    applyNodeInfo(nodeInfo) {
        this._nodeInfo = {
            ...nodeInfo,
            nonce: this.nodeInfo.nonce,
        };
        this._peerPool.applyNodeInfo(this._nodeInfo);
    }
    applyPenalty(peerPenalty) {
        this._peerPool.applyPenalty(peerPenalty);
    }
    getTriedPeers() {
        return this._peerBook.triedPeers.map(peer => ({
            ...peer.sharedState,
            ipAddress: peer.ipAddress,
            port: peer.port,
        }));
    }
    getConnectedPeers() {
        return this._peerPool
            .getAllConnectedPeerInfos()
            .filter(peer => !(peer.internalState && !peer.internalState.advertiseAddress))
            .map(peer => ({
            ...peer.sharedState,
            ipAddress: peer.ipAddress,
            port: peer.port,
            peerId: peer.peerId,
        }));
    }
    getDisconnectedPeers() {
        const { allPeers } = this._peerBook;
        const connectedPeers = this.getConnectedPeers();
        const disconnectedPeers = allPeers.filter(peer => {
            if (connectedPeers.find(connectedPeer => peer.ipAddress === connectedPeer.ipAddress && peer.port === connectedPeer.port)) {
                return false;
            }
            return true;
        });
        return disconnectedPeers
            .filter(peer => !(peer.internalState && !peer.internalState.advertiseAddress))
            .map(peer => ({
            ...peer.sharedState,
            ipAddress: peer.ipAddress,
            port: peer.port,
            peerId: peer.peerId,
        }));
    }
    getNetworkStats() {
        const { inboundCount, outboundCount } = this._peerPool.getPeersCountPerKind();
        this._networkStats.outgoing.count = outboundCount;
        this._networkStats.incoming.count = inboundCount;
        this._networkStats.totalDisconnectedPeers = this.getDisconnectedPeers().length;
        this._networkStats.totalConnectedPeers = this.getConnectedPeers().length;
        return this._networkStats;
    }
    async request(packet) {
        const bufferData = this._getBufferData(packet.data);
        const response = await this._peerPool.request({
            procedure: packet.procedure,
            data: bufferData,
        });
        return response;
    }
    send(packet) {
        const bufferData = this._getBufferData(packet.data);
        this._peerPool.send({ event: packet.event, data: bufferData });
    }
    broadcast(packet) {
        const bufferData = this._getBufferData(packet.data);
        this._peerPool.broadcast({ event: packet.event, data: bufferData });
    }
    async requestFromPeer(packet, peerId) {
        const bufferData = this._getBufferData(packet.data);
        return this._peerPool.requestFromPeer({ procedure: packet.procedure, data: bufferData }, peerId);
    }
    sendToPeer(packet, peerId) {
        const bufferData = this._getBufferData(packet.data);
        this._peerPool.sendToPeer({ event: packet.event, data: bufferData }, peerId);
    }
    async start() {
        var _a;
        if (this._isActive) {
            throw new Error('Node cannot start because it is already active.');
        }
        if (this._config.maxInboundConnections !== 0) {
            this._peerServer = new peer_server_1.PeerServer({
                port: this.config.port,
                nodeInfo: this._nodeInfo,
                hostIp: (_a = this._config.hostIp) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_NODE_HOST_IP,
                secret: this._secret,
                peerBook: this._peerBook,
                maxPayload: this._config.wsMaxPayload ? this._config.wsMaxPayload : constants_1.DEFAULT_WS_MAX_PAYLOAD,
                maxPeerInfoSize: this._config.maxPeerInfoSize
                    ? this._config.maxPeerInfoSize
                    : constants_1.DEFAULT_MAX_PEER_INFO_SIZE,
                peerHandshakeCheck: this._config.peerHandshakeCheck
                    ? this._config.peerHandshakeCheck
                    : utils_1.validatePeerCompatibility,
            });
            this._bindHandlersToPeerServer(this._peerServer);
            try {
                await this._peerServer.start();
            }
            catch (err) {
                this._isActive = false;
                throw new Error('Peer server did not start successfully');
            }
        }
        this._isActive = true;
        if (this._isActive) {
            if (this._peerBook.triedPeers.length < constants_1.DEFAULT_MIN_TRIED_PEER_COUNT) {
                this._peerPool.discoverFromSeedPeers();
                this._nextSeedPeerDiscovery = Date.now() + this._fallbackSeedPeerDiscoveryInterval;
            }
            this._startPopulator();
        }
    }
    async stop() {
        if (!this._isActive) {
            throw new Error('Node cannot be stopped because it is not active.');
        }
        this._isActive = false;
        this._hasConnected = false;
        this._stopPopulator();
        this._peerPool.removeAllPeers();
        this._peerBook.cleanUpTimers();
        if (this._peerServer) {
            await this._peerServer.stop();
            this._removeListeners(this._peerServer);
        }
        this._removeListeners(this._peerPool);
    }
    _handleGetNodeInfo(request) {
        if (!validate_1.isEmptyMessage(request.data)) {
            this.applyPenalty({
                peerId: request.peerId,
                penalty: 100,
            });
            request.error(new Error('Invalid request.'));
            return;
        }
        const encodedNodeInfo = codec_1.encodeNodeInfo(this._rpcSchemas.nodeInfo, this._nodeInfo);
        request.end(encodedNodeInfo);
    }
    _bindHandlersToPeerPool(peerPool) {
        peerPool.on(events_2.EVENT_REQUEST_RECEIVED, this._handlePeerPoolRPC);
        peerPool.on(events_2.EVENT_MESSAGE_RECEIVED, this._handlePeerPoolMessage);
        peerPool.on(events_2.EVENT_CONNECT_OUTBOUND, this._handleOutboundPeerConnect);
        peerPool.on(events_2.EVENT_CONNECT_ABORT_OUTBOUND, this._handleOutboundPeerConnectAbort);
        peerPool.on(events_2.EVENT_CLOSE_INBOUND, this._handlePeerCloseInbound);
        peerPool.on(events_2.EVENT_CLOSE_OUTBOUND, this._handlePeerCloseOutbound);
        peerPool.on(events_2.EVENT_REMOVE_PEER, this._handleRemovePeer);
        peerPool.on(events_2.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peerPool.on(events_2.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peerPool.on(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, this._handleFailedToFetchPeerInfo);
        peerPool.on(events_2.EVENT_FAILED_TO_FETCH_PEERS, this._handleFailedToFetchPeers);
        peerPool.on(events_2.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, this._handleFailedToCollectPeerDetails);
        peerPool.on(events_2.EVENT_DISCOVERED_PEER, this._handleDiscoveredPeer);
        peerPool.on(events_2.EVENT_FAILED_TO_PUSH_NODE_INFO, this._handleFailedToPushNodeInfo);
        peerPool.on(events_2.EVENT_FAILED_TO_SEND_MESSAGE, this._handleFailedToSendMessage);
        peerPool.on(events_2.EVENT_OUTBOUND_SOCKET_ERROR, this._handleOutboundSocketError);
        peerPool.on(events_2.EVENT_INBOUND_SOCKET_ERROR, this._handleInboundSocketError);
        peerPool.on(events_2.EVENT_BAN_PEER, this._handleBanPeer);
    }
    _bindHandlersToPeerServer(peerServer) {
        peerServer.on(events_2.EVENT_BAN_PEER, this._handleBanPeer);
        peerServer.on(events_2.EVENT_INBOUND_SOCKET_ERROR, this._handleInboundSocketError);
        peerServer.on(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, this._handleFailedInboundPeerConnect);
        peerServer.on(events_2.EVENT_NEW_INBOUND_PEER_CONNECTION, this._handleInboundPeerConnect);
    }
    _startPopulator() {
        if (this._populatorIntervalId) {
            throw new Error('Populator is already running');
        }
        this._populatorIntervalId = setInterval(() => {
            this._peerPool.triggerNewConnections(this._peerBook.newPeers, this._peerBook.triedPeers);
            if (this._nextSeedPeerDiscovery < Date.now() && this._peerPool.getFreeOutboundSlots() > 0) {
                this._peerPool.discoverFromSeedPeers();
                this._nextSeedPeerDiscovery = Date.now() + this._fallbackSeedPeerDiscoveryInterval;
            }
        }, this._populatorInterval);
        this._peerPool.triggerNewConnections(this._peerBook.newPeers, this._peerBook.triedPeers);
    }
    _stopPopulator() {
        if (this._populatorIntervalId) {
            clearInterval(this._populatorIntervalId);
        }
    }
    _isNetworkReady() {
        if (!this._hasConnected && this._peerPool.getConnectedPeers().length > 0) {
            this._hasConnected = true;
            return true;
        }
        return false;
    }
    _handleGetPeersRequest(request) {
        if (!validate_1.isEmptyMessage(request.data)) {
            this.applyPenalty({
                peerId: request.peerId,
                penalty: 100,
            });
            request.error(new Error('Invalid request.'));
            return;
        }
        const minimumPeerDiscoveryThreshold = this._config.minimumPeerDiscoveryThreshold
            ? this._config.minimumPeerDiscoveryThreshold
            : constants_1.DEFAULT_MIN_PEER_DISCOVERY_THRESHOLD;
        const maxPeerDiscoveryResponseLength = this._config.maxPeerDiscoveryResponseLength
            ? this._config.maxPeerDiscoveryResponseLength
            : constants_1.DEFAULT_MAX_PEER_DISCOVERY_RESPONSE_LENGTH;
        const wsMaxPayload = this._config.wsMaxPayload
            ? this._config.wsMaxPayload
            : constants_1.DEFAULT_WS_MAX_PAYLOAD;
        const maxPeerInfoSize = this._config.maxPeerInfoSize
            ? this._config.maxPeerInfoSize
            : constants_1.DEFAULT_MAX_PEER_INFO_SIZE;
        const safeMaxPeerInfoLength = Math.floor(constants_1.DEFAULT_WS_MAX_PAYLOAD / maxPeerInfoSize) - 1;
        const selectedPeers = this._peerBook.getRandomizedPeerList(minimumPeerDiscoveryThreshold, maxPeerDiscoveryResponseLength);
        const sanitizedPeerInfoList = selectedPeers
            .filter(peer => !(peer.internalState && !peer.internalState.advertiseAddress))
            .map(peer => ({
            ipAddress: peer.ipAddress,
            port: peer.port,
        }));
        const encodedPeersList = sanitizedPeerInfoList.map(peer => codec_1.encodePeerInfo(this._rpcSchemas.peerInfo, peer));
        const validatedPeerList = utils_1.getByteSize(encodedPeersList) < wsMaxPayload
            ? encodedPeersList
            : encodedPeersList.slice(0, safeMaxPeerInfoLength);
        const encodedResponse = lisk_codec_1.codec.encode(this._rpcSchemas.peerRequestResponse, {
            peers: validatedPeerList,
        });
        request.end(encodedResponse);
    }
    _removeListeners(emitter) {
        emitter.eventNames().forEach((eventName) => {
            emitter.removeAllListeners(eventName);
        });
    }
    _getBufferData(data) {
        if (data === undefined) {
            return undefined;
        }
        if (Buffer.isBuffer(data)) {
            return data;
        }
        return Buffer.from(JSON.stringify(data), 'utf8');
    }
}
exports.P2P = P2P;
//# sourceMappingURL=p2p.js.map