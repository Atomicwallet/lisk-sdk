"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peer = exports.ConnectionState = exports.RATE_NORMALIZATION_FACTOR = exports.socketErrorStatusCodes = void 0;
const events_1 = require("events");
const socketClusterClient = require("socketcluster-client");
const lisk_codec_1 = ("../../../lisk-codec");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const events_2 = require("../events");
const p2p_request_1 = require("../p2p_request");
const utils_1 = require("../utils");
const codec_1 = require("../utils/codec");
exports.socketErrorStatusCodes = {
    ...socketClusterClient.SCClientSocket.errorStatuses,
    1000: 'Intentionally disconnected',
};
exports.RATE_NORMALIZATION_FACTOR = 1000;
const PEER_STATUS_MESSAGE_RATE_INTERVAL = 10000;
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["CONNECTING"] = "connecting";
    ConnectionState["OPEN"] = "open";
    ConnectionState["CLOSED"] = "closed";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
class Peer extends events_1.EventEmitter {
    constructor(peerInfo, peerConfig) {
        super();
        this._peerConfig = peerConfig;
        this._rpcSchemas = peerConfig.rpcSchemas;
        lisk_codec_1.codec.addSchema(this._rpcSchemas.peerInfo);
        lisk_codec_1.codec.addSchema(this._rpcSchemas.nodeInfo);
        lisk_codec_1.codec.addSchema(this._rpcSchemas.peerRequestResponse);
        this._peerInfo = this._initializeInternalState(peerInfo);
        this._rateInterval = this._peerConfig.rateCalculationInterval;
        this._counterResetInterval = setInterval(() => {
            this._resetCounters();
        }, this._rateInterval);
        this._productivityResetInterval = setInterval(() => {
            this._resetProductivity();
        }, constants_1.DEFAULT_PRODUCTIVITY_RESET_INTERVAL);
        this._serverNodeInfo = peerConfig.serverNodeInfo;
        this._discoveryMessageCounter = {
            getPeers: 0,
            getNodeInfo: 0,
            postNodeInfo: 0,
        };
        this._peerStatusMessageRate = peerConfig.peerStatusMessageRate;
        this._peerStatusRateInterval = setInterval(() => {
            this._resetStatusMessageRate();
        }, PEER_STATUS_MESSAGE_RATE_INTERVAL);
        this._handleRawRPC = (packet, respond) => {
            try {
                utils_1.validateRPCRequest(packet);
            }
            catch (error) {
                respond(error);
                this.emit(events_2.EVENT_INVALID_REQUEST_RECEIVED, {
                    packet,
                    peerId: this._peerInfo.peerId,
                });
                return;
            }
            const rawRequestPacket = packet;
            if (rawRequestPacket.procedure === events_2.REMOTE_EVENT_RPC_GET_NODE_INFO) {
                this._discoveryMessageCounter.getNodeInfo += 1;
                if (this._discoveryMessageCounter.getNodeInfo > 1) {
                    this.applyPenalty(10);
                }
            }
            if (rawRequestPacket.procedure === events_2.REMOTE_EVENT_RPC_GET_PEERS_LIST) {
                this._discoveryMessageCounter.getPeers += 1;
                if (this._discoveryMessageCounter.getPeers > 1) {
                    this.applyPenalty(10);
                }
            }
            if (events_2.PROTOCOL_EVENTS_TO_RATE_LIMIT.has(rawRequestPacket.procedure) &&
                this._peerInfo.internalState.rpcCounter.has(rawRequestPacket.procedure)) {
                this._updateRPCCounter(rawRequestPacket);
                return;
            }
            this._updateRPCCounter(rawRequestPacket);
            const rate = this._getRPCRate(rawRequestPacket);
            const request = new p2p_request_1.P2PRequest({
                procedure: rawRequestPacket.procedure,
                data: rawRequestPacket.data,
                id: this.peerInfo.peerId,
                rate,
                productivity: this.internalState.productivity,
            }, respond);
            this.emit(events_2.EVENT_REQUEST_RECEIVED, request);
        };
        this._handleWSMessage = () => {
            this._peerInfo.internalState.wsMessageCount += 1;
        };
        this._handleRawMessage = (packet) => {
            try {
                utils_1.validateProtocolMessage(packet);
            }
            catch (error) {
                this.emit(events_2.EVENT_INVALID_MESSAGE_RECEIVED, {
                    packet,
                    peerId: this._peerInfo.peerId,
                });
                return;
            }
            const message = packet;
            this._updateMessageCounter(message);
            const rate = this._getMessageRate(message);
            const messageBufferData = this._getBufferData(message.data);
            if (message.event === events_2.REMOTE_EVENT_POST_NODE_INFO) {
                this._discoveryMessageCounter.postNodeInfo += 1;
                if (this._discoveryMessageCounter.postNodeInfo > this._peerStatusMessageRate) {
                    this.applyPenalty(10);
                }
                this._handleUpdateNodeInfo({ ...message, data: messageBufferData });
            }
            const messageWithRateInfo = {
                ...message,
                data: messageBufferData,
                peerId: this._peerInfo.peerId,
                rate,
            };
            this.emit(events_2.EVENT_MESSAGE_RECEIVED, messageWithRateInfo);
        };
    }
    get id() {
        return this._peerInfo.peerId;
    }
    get ipAddress() {
        return this._peerInfo.ipAddress;
    }
    get port() {
        return this._peerInfo.port;
    }
    get internalState() {
        return this.peerInfo.internalState;
    }
    get peerInfo() {
        return this._peerInfo;
    }
    get state() {
        const state = this._socket
            ? this._socket.state === this._socket.OPEN
                ? ConnectionState.OPEN
                : ConnectionState.CLOSED
            : ConnectionState.CLOSED;
        return state;
    }
    updateInternalState(internalState) {
        this._peerInfo = {
            ...this._peerInfo,
            internalState,
        };
    }
    updatePeerInfo(newPeerInfo) {
        this._peerInfo = {
            sharedState: newPeerInfo.sharedState,
            internalState: this._peerInfo.internalState,
            ipAddress: this.ipAddress,
            port: this.port,
            peerId: this.id,
        };
    }
    connect() {
        if (!this._socket) {
            throw new Error('Peer socket does not exist');
        }
    }
    disconnect(code = constants_1.INTENTIONAL_DISCONNECT_CODE, reason) {
        clearInterval(this._counterResetInterval);
        clearInterval(this._productivityResetInterval);
        clearInterval(this._peerStatusRateInterval);
        if (this._socket) {
            this._socket.destroy(code, reason);
        }
    }
    send(packet) {
        if (!this._socket) {
            throw new Error('Peer socket does not exist');
        }
        const data = this._getBase64Data(packet.data);
        this._socket.emit(events_2.REMOTE_SC_EVENT_MESSAGE, {
            event: packet.event,
            data,
        });
    }
    async request(packet) {
        return new Promise((resolve, reject) => {
            if (!this._socket) {
                throw new Error('Peer socket does not exist');
            }
            const data = this._getBase64Data(packet.data);
            this._socket.emit(events_2.REMOTE_SC_EVENT_RPC_REQUEST, {
                procedure: packet.procedure,
                data,
            }, (error, responseData) => {
                if (error) {
                    reject(error);
                    return;
                }
                const response = responseData;
                if (response) {
                    const responseBufferData = {
                        peerId: response.peerId,
                        data: this._getBufferData(response.data),
                    };
                    resolve(responseBufferData);
                    return;
                }
                reject(new errors_1.RPCResponseError(`Failed to handle response for procedure ${packet.procedure}`, `${this.ipAddress}:${this.port}`));
            });
        });
    }
    async fetchPeers() {
        try {
            const response = await this.request({
                procedure: events_2.REMOTE_EVENT_RPC_GET_PEERS_LIST,
            });
            if (!response.data) {
                throw new errors_1.InvalidPeerInfoListError(constants_1.INVALID_PEER_INFO_LIST_REASON);
            }
            const { peers } = lisk_codec_1.codec.decode(this._rpcSchemas.peerRequestResponse, response.data);
            const sanitizedPeersList = peers.map((peerInfoBuffer) => {
                const peerInfo = lisk_codec_1.codec.decode(this._rpcSchemas.peerInfo, peerInfoBuffer);
                return utils_1.sanitizeIncomingPeerInfo(peerInfo);
            });
            utils_1.validatePeerInfoList(sanitizedPeersList, this._peerConfig.maxPeerDiscoveryResponseLength, this._peerConfig.maxPeerInfoSize);
            return sanitizedPeersList.map(peerInfo => ({
                ...peerInfo,
                sourceAddress: this.ipAddress,
            }));
        }
        catch (error) {
            if (error instanceof errors_1.InvalidPeerInfoError || error instanceof errors_1.InvalidPeerInfoListError) {
                this.applyPenalty(constants_1.INVALID_PEER_LIST_PENALTY);
            }
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEERS, error);
            throw new errors_1.RPCResponseError('Failed to fetch peer list of peer', this.ipAddress);
        }
    }
    async discoverPeers() {
        const discoveredPeerInfoList = await this.fetchPeers();
        discoveredPeerInfoList.forEach(peerInfo => {
            this.emit(events_2.EVENT_DISCOVERED_PEER, peerInfo);
        });
        return discoveredPeerInfoList;
    }
    async fetchAndUpdateStatus() {
        let response;
        try {
            response = await this.request({
                procedure: events_2.REMOTE_EVENT_RPC_GET_NODE_INFO,
            });
        }
        catch (error) {
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
            throw new errors_1.RPCResponseError('Failed to fetch peer info of peer', `${this.ipAddress}:${this.port}`);
        }
        try {
            const receivedNodeInfo = codec_1.decodeNodeInfo(this._rpcSchemas.nodeInfo, response.data);
            this._updateFromProtocolPeerInfo(receivedNodeInfo);
        }
        catch (error) {
            this.emit(events_2.EVENT_FAILED_PEER_INFO_UPDATE, error);
            if (error instanceof errors_1.InvalidNodeInfoError) {
                this.applyPenalty(constants_1.INVALID_PEER_INFO_PENALTY);
            }
            throw new errors_1.RPCResponseError('Failed to update peer info of peer due to validation of peer compatibility', `${this.ipAddress}:${this.port}`);
        }
        this.emit(events_2.EVENT_UPDATED_PEER_INFO, this._peerInfo);
        return this._peerInfo;
    }
    applyPenalty(penalty) {
        this.peerInfo.internalState.reputation -= penalty;
        if (this.internalState.reputation <= 0) {
            this._banPeer();
        }
    }
    _resetCounters() {
        this._peerInfo.internalState.wsMessageRate =
            (this.peerInfo.internalState.wsMessageCount * exports.RATE_NORMALIZATION_FACTOR) / this._rateInterval;
        this._peerInfo.internalState.wsMessageCount = 0;
        if (this.peerInfo.internalState.wsMessageRate > this._peerConfig.wsMaxMessageRate) {
            const messageRateExceedCoefficient = Math.floor(this.peerInfo.internalState.wsMessageRate / this._peerConfig.wsMaxMessageRate);
            const penaltyRateMultiplier = messageRateExceedCoefficient > 1 ? messageRateExceedCoefficient : 1;
            this.applyPenalty(this._peerConfig.wsMaxMessageRatePenalty * penaltyRateMultiplier);
        }
        this._peerInfo.internalState.rpcRates = new Map([...this.internalState.rpcCounter.entries()].map(([key, value]) => {
            const rate = value / this._rateInterval;
            if (events_2.PROTOCOL_EVENTS_TO_RATE_LIMIT.has(key) && value > 1) {
                this.applyPenalty(this._peerConfig.wsMaxMessageRatePenalty);
            }
            return [key, rate];
        }));
        this._peerInfo.internalState.rpcCounter = new Map();
        this._peerInfo.internalState.messageRates = new Map([...this.internalState.messageCounter.entries()].map(([key, value]) => {
            const rate = value / this._rateInterval;
            return [key, rate];
        }));
        this._peerInfo.internalState.messageCounter = new Map();
    }
    _resetProductivity() {
        if (this.peerInfo.internalState.productivity.lastResponded <
            Date.now() - constants_1.DEFAULT_PRODUCTIVITY_RESET_INTERVAL) {
            this._peerInfo.internalState.productivity = { ...constants_1.DEFAULT_PRODUCTIVITY };
        }
    }
    _resetStatusMessageRate() {
        this._discoveryMessageCounter.postNodeInfo = 0;
        this._discoveryMessageCounter.getPeers = 0;
    }
    _updateFromProtocolPeerInfo(rawPeerInfo) {
        if (!this._serverNodeInfo) {
            throw new Error('Missing server node info.');
        }
        const peerInfo = utils_1.validatePeerInfo(utils_1.sanitizeIncomingPeerInfo({
            ...rawPeerInfo,
            ipAddress: this.ipAddress,
            port: this.port,
        }), this._peerConfig.maxPeerInfoSize);
        const result = utils_1.validatePeerCompatibility(peerInfo, this._serverNodeInfo);
        if (!result.success && result.error) {
            throw new Error(`${result.error} : ${peerInfo.ipAddress}:${peerInfo.port}`);
        }
        this.updatePeerInfo(peerInfo);
    }
    _handleUpdateNodeInfo(message) {
        var _a;
        try {
            utils_1.validatePayloadSize(message.data, this._peerConfig.maxPeerInfoSize);
            const decodedNodeInfo = codec_1.decodeNodeInfo(this._rpcSchemas.nodeInfo, message.data);
            const { options } = decodedNodeInfo;
            this._peerInfo = {
                ...this._peerInfo,
                sharedState: {
                    ...this._peerInfo.sharedState,
                    options: { ...(_a = this._peerInfo.sharedState) === null || _a === void 0 ? void 0 : _a.options, ...options },
                },
            };
        }
        catch (error) {
            if (error instanceof errors_1.InvalidNodeInfoError) {
                this.applyPenalty(constants_1.INVALID_PEER_INFO_PENALTY);
            }
            this.emit(events_2.EVENT_FAILED_PEER_INFO_UPDATE, error);
            return;
        }
        this.emit(events_2.EVENT_UPDATED_PEER_INFO, this.peerInfo);
    }
    _banPeer() {
        this.emit(events_2.EVENT_BAN_PEER, this.id);
        this.disconnect(constants_1.FORBIDDEN_CONNECTION, constants_1.FORBIDDEN_CONNECTION_REASON);
    }
    _updateRPCCounter(packet) {
        var _a;
        const key = packet.procedure;
        const count = ((_a = this.internalState.rpcCounter.get(key)) !== null && _a !== void 0 ? _a : 0) + 1;
        this.peerInfo.internalState.rpcCounter.set(key, count);
    }
    _getRPCRate(packet) {
        var _a;
        const rate = (_a = this.peerInfo.internalState.rpcRates.get(packet.procedure)) !== null && _a !== void 0 ? _a : 0;
        return rate * exports.RATE_NORMALIZATION_FACTOR;
    }
    _updateMessageCounter(packet) {
        var _a;
        const key = packet.event;
        const count = ((_a = this.internalState.messageCounter.get(key)) !== null && _a !== void 0 ? _a : 0) + 1;
        this.peerInfo.internalState.messageCounter.set(key, count);
    }
    _getMessageRate(packet) {
        var _a;
        const rate = (_a = this.internalState.messageRates.get(packet.event)) !== null && _a !== void 0 ? _a : 0;
        return rate * exports.RATE_NORMALIZATION_FACTOR;
    }
    _initializeInternalState(peerInfo) {
        return peerInfo.internalState
            ? peerInfo
            : {
                ...peerInfo,
                internalState: utils_1.assignInternalInfo(peerInfo, this._peerConfig.secret),
            };
    }
    _getBase64Data(data) {
        if (data === undefined) {
            return undefined;
        }
        if (Buffer.isBuffer(data)) {
            return data.toString(constants_1.DEFAULT_MESSAGE_ENCODING_FORMAT);
        }
        return data;
    }
    _getBufferData(data) {
        if (data === undefined) {
            return undefined;
        }
        return Buffer.from(data, constants_1.DEFAULT_MESSAGE_ENCODING_FORMAT);
    }
}
exports.Peer = Peer;
//# sourceMappingURL=base.js.map
