"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectAndFetchPeerInfo = exports.connectAndRequest = exports.Peer = exports.constructPeerIdFromPeerInfo = exports.constructPeerId = exports.ConnectionState = exports.DEFAULT_ACK_TIMEOUT = exports.DEFAULT_CONNECT_TIMEOUT = exports.REMOTE_RPC_GET_ALL_PEERS_LIST = exports.REMOTE_RPC_GET_NODE_INFO = exports.REMOTE_RPC_UPDATE_PEER_INFO = exports.REMOTE_EVENT_MESSAGE = exports.REMOTE_EVENT_RPC_REQUEST = exports.EVENT_FAILED_TO_PUSH_NODE_INFO = exports.EVENT_FAILED_TO_FETCH_PEER_INFO = exports.EVENT_DISCOVERED_PEER = exports.EVENT_INBOUND_SOCKET_ERROR = exports.EVENT_OUTBOUND_SOCKET_ERROR = exports.EVENT_CLOSE_OUTBOUND = exports.EVENT_CONNECT_ABORT_OUTBOUND = exports.EVENT_CONNECT_OUTBOUND = exports.EVENT_INVALID_MESSAGE_RECEIVED = exports.EVENT_MESSAGE_RECEIVED = exports.EVENT_INVALID_REQUEST_RECEIVED = exports.EVENT_REQUEST_RECEIVED = exports.EVENT_FAILED_PEER_INFO_UPDATE = exports.EVENT_UPDATED_PEER_INFO = void 0;
const events_1 = require("events");
const querystring = require("querystring");
const errors_1 = require("./errors");
const p2p_request_1 = require("./p2p_request");
const socketClusterClient = require("socketcluster-client");
const validation_1 = require("./validation");
exports.EVENT_UPDATED_PEER_INFO = 'updatedPeerInfo';
exports.EVENT_FAILED_PEER_INFO_UPDATE = 'failedPeerInfoUpdate';
exports.EVENT_REQUEST_RECEIVED = 'requestReceived';
exports.EVENT_INVALID_REQUEST_RECEIVED = 'invalidRequestReceived';
exports.EVENT_MESSAGE_RECEIVED = 'messageReceived';
exports.EVENT_INVALID_MESSAGE_RECEIVED = 'invalidMessageReceived';
exports.EVENT_CONNECT_OUTBOUND = 'connectOutbound';
exports.EVENT_CONNECT_ABORT_OUTBOUND = 'connectAbortOutbound';
exports.EVENT_CLOSE_OUTBOUND = 'closeOutbound';
exports.EVENT_OUTBOUND_SOCKET_ERROR = 'outboundSocketError';
exports.EVENT_INBOUND_SOCKET_ERROR = 'inboundSocketError';
exports.EVENT_DISCOVERED_PEER = 'discoveredPeer';
exports.EVENT_FAILED_TO_FETCH_PEER_INFO = 'failedToFetchPeerInfo';
exports.EVENT_FAILED_TO_PUSH_NODE_INFO = 'failedToPushNodeInfo';
exports.REMOTE_EVENT_RPC_REQUEST = 'rpc-request';
exports.REMOTE_EVENT_MESSAGE = 'remote-message';
exports.REMOTE_RPC_UPDATE_PEER_INFO = 'updateMyself';
exports.REMOTE_RPC_GET_NODE_INFO = 'status';
exports.REMOTE_RPC_GET_ALL_PEERS_LIST = 'list';
exports.DEFAULT_CONNECT_TIMEOUT = 2000;
exports.DEFAULT_ACK_TIMEOUT = 2000;
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["CONNECTING"] = 0] = "CONNECTING";
    ConnectionState[ConnectionState["CONNECTED"] = 1] = "CONNECTED";
    ConnectionState[ConnectionState["DISCONNECTED"] = 2] = "DISCONNECTED";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
const constructPeerId = (ipAddress, wsPort) => `${ipAddress}:${wsPort}`;
exports.constructPeerId = constructPeerId;
const constructPeerIdFromPeerInfo = (peerInfo) => `${peerInfo.ipAddress}:${peerInfo.wsPort}`;
exports.constructPeerIdFromPeerInfo = constructPeerIdFromPeerInfo;
const convertNodeInfoToLegacyFormat = (nodeInfo) => {
    const { httpPort, nonce, broadhash } = nodeInfo;
    return Object.assign(Object.assign({}, nodeInfo), { broadhash: broadhash ? broadhash : '', nonce: nonce ? nonce : '', httpPort: httpPort ? httpPort : 0 });
};
class Peer extends events_1.EventEmitter {
    constructor(peerInfo, peerConfig, peerSockets) {
        super();
        this._peerInfo = peerInfo;
        this._peerConfig = peerConfig ? peerConfig : {};
        this._ipAddress = peerInfo.ipAddress;
        this._wsPort = peerInfo.wsPort;
        this._id = exports.constructPeerId(this._ipAddress, this._wsPort);
        this._height = peerInfo.height ? peerInfo.height : 0;
        this._handleRawRPC = (packet, respond) => {
            let rawRequest;
            try {
                rawRequest = validation_1.validateRPCRequest(packet);
            }
            catch (err) {
                this.emit(exports.EVENT_INVALID_REQUEST_RECEIVED, packet);
                return;
            }
            const request = new p2p_request_1.P2PRequest(rawRequest.procedure, rawRequest.data, respond);
            if (rawRequest.procedure === exports.REMOTE_RPC_UPDATE_PEER_INFO) {
                this._handleUpdatePeerInfo(request);
            }
            else if (rawRequest.procedure === exports.REMOTE_RPC_GET_NODE_INFO) {
                this._handleGetNodeInfo(request);
            }
            this.emit(exports.EVENT_REQUEST_RECEIVED, request);
        };
        this._handleRawMessage = (packet) => {
            let protocolMessage;
            try {
                protocolMessage = validation_1.validateProtocolMessage(packet);
            }
            catch (err) {
                this.emit(exports.EVENT_INVALID_MESSAGE_RECEIVED, packet);
                return;
            }
            this.emit(exports.EVENT_MESSAGE_RECEIVED, protocolMessage);
        };
        this._handleRawLegacyMessagePostBlock = (data) => {
            this._handleRawMessage({
                event: 'postBlock',
                data,
            });
        };
        this._handleRawLegacyMessagePostTransactions = (data) => {
            this._handleRawMessage({
                event: 'postTransactions',
                data,
            });
        };
        this._handleRawLegacyMessagePostSignatures = (data) => {
            this._handleRawMessage({
                event: 'postSignatures',
                data,
            });
        };
        this._handleInboundSocketError = (error) => {
            this.emit(exports.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        this._inboundSocket = peerSockets ? peerSockets.inbound : undefined;
        if (this._inboundSocket) {
            this._bindHandlersToInboundSocket(this._inboundSocket);
        }
        this._outboundSocket = peerSockets ? peerSockets.outbound : undefined;
        if (this._outboundSocket) {
            this._bindHandlersToOutboundSocket(this._outboundSocket);
        }
    }
    get height() {
        return this._height;
    }
    get id() {
        return this._id;
    }
    set inboundSocket(scServerSocket) {
        if (this._inboundSocket) {
            this._unbindHandlersFromInboundSocket(this._inboundSocket);
        }
        this._inboundSocket = scServerSocket;
        this._bindHandlersToInboundSocket(this._inboundSocket);
    }
    get ipAddress() {
        return this._ipAddress;
    }
    set outboundSocket(scClientSocket) {
        if (this._outboundSocket) {
            this._unbindHandlersFromOutboundSocket(this._outboundSocket);
        }
        this._outboundSocket = scClientSocket;
        this._bindHandlersToOutboundSocket(this._outboundSocket);
    }
    updatePeerInfo(newPeerInfo) {
        this._peerInfo = Object.assign(Object.assign({}, newPeerInfo), { ipAddress: this._ipAddress, wsPort: this._wsPort });
    }
    get peerInfo() {
        return this._peerInfo;
    }
    get state() {
        const inbound = this._inboundSocket
            ? this._inboundSocket.state === this._inboundSocket.OPEN
                ? ConnectionState.CONNECTED
                : ConnectionState.DISCONNECTED
            : ConnectionState.DISCONNECTED;
        const outbound = this._outboundSocket
            ? this._outboundSocket.state === this._outboundSocket.OPEN
                ? ConnectionState.CONNECTED
                : ConnectionState.DISCONNECTED
            : ConnectionState.DISCONNECTED;
        return {
            inbound,
            outbound,
        };
    }
    get wsPort() {
        return this._wsPort;
    }
    async applyNodeInfo(nodeInfo) {
        this._nodeInfo = nodeInfo;
        const legacyNodeInfo = convertNodeInfoToLegacyFormat(this._nodeInfo);
        await this.request({
            procedure: exports.REMOTE_RPC_UPDATE_PEER_INFO,
            data: legacyNodeInfo,
        });
    }
    get nodeInfo() {
        return this._nodeInfo;
    }
    connect() {
        if (!this._outboundSocket) {
            this._outboundSocket = this._createOutboundSocket();
        }
        this._outboundSocket.connect();
    }
    disconnect(code = 1000, reason) {
        this.dropInboundConnection(code, reason);
        this.dropOutboundConnection(code, reason);
    }
    dropInboundConnection(code = 1000, reason) {
        if (this._inboundSocket) {
            this._inboundSocket.destroy(code, reason);
            this._unbindHandlersFromInboundSocket(this._inboundSocket);
        }
    }
    dropOutboundConnection(code = 1000, reason) {
        if (this._outboundSocket) {
            this._outboundSocket.destroy(code, reason);
            this._unbindHandlersFromOutboundSocket(this._outboundSocket);
        }
    }
    send(packet) {
        if (!this._outboundSocket) {
            this._outboundSocket = this._createOutboundSocket();
        }
        const legacyEvents = ['postBlock', 'postTransactions', 'postSignatures'];
        if (legacyEvents.includes(packet.event)) {
            this._outboundSocket.emit(packet.event, packet.data);
        }
        else {
            this._outboundSocket.emit(exports.REMOTE_EVENT_MESSAGE, {
                event: packet.event,
                data: packet.data,
            });
        }
    }
    async request(packet) {
        return new Promise((resolve, reject) => {
            if (!this._outboundSocket) {
                this._outboundSocket = this._createOutboundSocket();
            }
            this._outboundSocket.emit(exports.REMOTE_EVENT_RPC_REQUEST, {
                type: '/RPCRequest',
                procedure: packet.procedure,
                data: packet.data,
            }, (err, responseData) => {
                if (err) {
                    reject(new errors_1.RequestFailError(err instanceof Error ? err.message : err, err, exports.constructPeerIdFromPeerInfo(this._peerInfo), this._peerInfo.version));
                    return;
                }
                if (responseData) {
                    resolve(responseData);
                    return;
                }
                reject(new errors_1.RPCResponseError(`Failed to handle response for procedure ${packet.procedure}`, exports.constructPeerIdFromPeerInfo(this._peerInfo)));
            });
        });
    }
    async fetchPeers() {
        try {
            const response = await this.request({
                procedure: exports.REMOTE_RPC_GET_ALL_PEERS_LIST,
            });
            const fullPeerList = validation_1.validatePeerInfoList(response.data);
            return fullPeerList.slice(0, this._peerConfig.maxPeerListSize);
        }
        catch (error) {
            throw new errors_1.RPCResponseError('Failed to fetch peer list of peer', exports.constructPeerIdFromPeerInfo(this._peerInfo));
        }
    }
    async fetchStatus() {
        try {
            const response = await this.request({
                procedure: exports.REMOTE_RPC_GET_NODE_INFO,
            });
            this._updateFromProtocolPeerInfo(response.data);
        }
        catch (error) {
            this.emit(exports.EVENT_FAILED_PEER_INFO_UPDATE, error);
            throw new errors_1.RPCResponseError('Failed to fetch peer info of peer', exports.constructPeerIdFromPeerInfo(this._peerInfo));
        }
        this.emit(exports.EVENT_UPDATED_PEER_INFO, this._peerInfo);
        return this._peerInfo;
    }
    _createOutboundSocket() {
        const legacyNodeInfo = this._nodeInfo
            ? convertNodeInfoToLegacyFormat(this._nodeInfo)
            : undefined;
        const connectTimeout = this._peerConfig.connectTimeout
            ? this._peerConfig.connectTimeout
            : exports.DEFAULT_CONNECT_TIMEOUT;
        const ackTimeout = this._peerConfig.ackTimeout
            ? this._peerConfig.ackTimeout
            : exports.DEFAULT_ACK_TIMEOUT;
        const clientOptions = {
            hostname: this._ipAddress,
            port: this._wsPort,
            query: querystring.stringify(Object.assign(Object.assign({}, legacyNodeInfo), { options: JSON.stringify(legacyNodeInfo) })),
            connectTimeout,
            ackTimeout,
            multiplex: false,
            autoConnect: false,
            autoReconnect: false,
            maxPayload: this._peerConfig.wsMaxPayload,
        };
        const outboundSocket = socketClusterClient.create(clientOptions);
        this._bindHandlersToOutboundSocket(outboundSocket);
        return outboundSocket;
    }
    async _updatePeerOnConnect() {
        let detailedPeerInfo;
        try {
            detailedPeerInfo = await this.fetchStatus();
        }
        catch (error) {
            this.emit(exports.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
            return;
        }
        this.emit(exports.EVENT_DISCOVERED_PEER, detailedPeerInfo);
    }
    _bindHandlersToOutboundSocket(outboundSocket) {
        outboundSocket.on('error', (error) => {
            this.emit(exports.EVENT_OUTBOUND_SOCKET_ERROR, error);
        });
        outboundSocket.on('connect', async () => {
            this.emit(exports.EVENT_CONNECT_OUTBOUND, this._peerInfo);
            await this._updatePeerOnConnect();
        });
        outboundSocket.on('connectAbort', () => {
            this.emit(exports.EVENT_CONNECT_ABORT_OUTBOUND, this._peerInfo);
        });
        outboundSocket.on('close', (code, reason) => {
            this.emit(exports.EVENT_CLOSE_OUTBOUND, {
                peerInfo: this._peerInfo,
                code,
                reason,
            });
        });
        outboundSocket.on('message', () => {
            const transport = outboundSocket.transport;
            if (transport) {
                transport._resetPingTimeout();
            }
        });
        outboundSocket.on(exports.REMOTE_EVENT_RPC_REQUEST, this._handleRawRPC);
        outboundSocket.on(exports.REMOTE_EVENT_MESSAGE, this._handleRawMessage);
        outboundSocket.on('postBlock', this._handleRawLegacyMessagePostBlock);
        outboundSocket.on('postSignatures', this._handleRawLegacyMessagePostSignatures);
        outboundSocket.on('postTransactions', this._handleRawLegacyMessagePostTransactions);
    }
    _unbindHandlersFromOutboundSocket(outboundSocket) {
        outboundSocket.off('connect');
        outboundSocket.off('connectAbort');
        outboundSocket.off('close');
        outboundSocket.off('message');
        outboundSocket.off(exports.REMOTE_EVENT_RPC_REQUEST, this._handleRawRPC);
        outboundSocket.off(exports.REMOTE_EVENT_MESSAGE, this._handleRawMessage);
        outboundSocket.off('postBlock', this._handleRawLegacyMessagePostBlock);
        outboundSocket.off('postSignatures', this._handleRawLegacyMessagePostSignatures);
        outboundSocket.off('postTransactions', this._handleRawLegacyMessagePostTransactions);
    }
    _bindHandlersToInboundSocket(inboundSocket) {
        inboundSocket.on('error', this._handleInboundSocketError);
        inboundSocket.on(exports.REMOTE_EVENT_RPC_REQUEST, this._handleRawRPC);
        inboundSocket.on(exports.REMOTE_EVENT_MESSAGE, this._handleRawMessage);
        inboundSocket.on('postBlock', this._handleRawLegacyMessagePostBlock);
        inboundSocket.on('postSignatures', this._handleRawLegacyMessagePostSignatures);
        inboundSocket.on('postTransactions', this._handleRawLegacyMessagePostTransactions);
    }
    _unbindHandlersFromInboundSocket(inboundSocket) {
        inboundSocket.off(exports.REMOTE_EVENT_RPC_REQUEST, this._handleRawRPC);
        inboundSocket.off(exports.REMOTE_EVENT_MESSAGE, this._handleRawMessage);
        inboundSocket.off('postBlock', this._handleRawLegacyMessagePostBlock);
        inboundSocket.off('postSignatures', this._handleRawLegacyMessagePostSignatures);
        inboundSocket.off('postTransactions', this._handleRawLegacyMessagePostTransactions);
    }
    _updateFromProtocolPeerInfo(rawPeerInfo) {
        const protocolPeerInfo = Object.assign(Object.assign({}, rawPeerInfo), { ip: this._ipAddress, wsPort: this._wsPort });
        const newPeerInfo = validation_1.validatePeerInfo(protocolPeerInfo);
        this.updatePeerInfo(newPeerInfo);
    }
    _handleUpdatePeerInfo(request) {
        try {
            this._updateFromProtocolPeerInfo(request.data);
        }
        catch (error) {
            this.emit(exports.EVENT_FAILED_PEER_INFO_UPDATE, error);
            request.error(error);
            return;
        }
        this.emit(exports.EVENT_UPDATED_PEER_INFO, this._peerInfo);
        request.end();
    }
    _handleGetNodeInfo(request) {
        const legacyNodeInfo = this._nodeInfo
            ? convertNodeInfoToLegacyFormat(this._nodeInfo)
            : {};
        request.end(legacyNodeInfo);
    }
}
exports.Peer = Peer;
const connectAndRequest = async (basicPeerInfo, procedure, nodeInfo, peerConfig) => new Promise((resolve, reject) => {
    const legacyNodeInfo = nodeInfo
        ? convertNodeInfoToLegacyFormat(nodeInfo)
        : undefined;
    const requestPacket = {
        procedure,
    };
    const clientOptions = {
        hostname: basicPeerInfo.ipAddress,
        port: basicPeerInfo.wsPort,
        query: querystring.stringify(Object.assign(Object.assign({}, legacyNodeInfo), { options: JSON.stringify(legacyNodeInfo) })),
        connectTimeout: peerConfig
            ? peerConfig.connectTimeout
                ? peerConfig.connectTimeout
                : exports.DEFAULT_CONNECT_TIMEOUT
            : exports.DEFAULT_CONNECT_TIMEOUT,
        ackTimeout: peerConfig
            ? peerConfig.connectTimeout
                ? peerConfig.connectTimeout
                : exports.DEFAULT_CONNECT_TIMEOUT
            : exports.DEFAULT_ACK_TIMEOUT,
        multiplex: false,
        autoConnect: false,
        autoReconnect: false,
        maxPayload: peerConfig.wsMaxPayload,
    };
    const outboundSocket = socketClusterClient.create(clientOptions);
    outboundSocket.on('error', () => { });
    let disconnectStatusCode;
    let disconnectReason;
    const closeHandler = (statusCode, reason) => {
        disconnectStatusCode = statusCode;
        disconnectReason = reason;
    };
    outboundSocket.once('close', closeHandler);
    outboundSocket.emit(exports.REMOTE_EVENT_RPC_REQUEST, {
        type: '/RPCRequest',
        procedure: requestPacket.procedure,
    }, (err, responseData) => {
        outboundSocket.off('close', closeHandler);
        if (err) {
            const isFailedConnection = disconnectReason &&
                (err.name === 'TimeoutError' ||
                    err.name === 'BadConnectionError');
            const connectionError = new errors_1.PeerOutboundConnectionError(isFailedConnection ? disconnectReason : err.message, disconnectStatusCode);
            reject(connectionError);
            return;
        }
        if (responseData) {
            const responsePacket = responseData;
            resolve({
                responsePacket,
                socket: outboundSocket,
            });
            return;
        }
        reject(new errors_1.RPCResponseError(`Failed to handle response for procedure ${requestPacket.procedure}`, exports.constructPeerIdFromPeerInfo(basicPeerInfo)));
    });
});
exports.connectAndRequest = connectAndRequest;
const connectAndFetchPeerInfo = async (basicPeerInfo, nodeInfo, peerConfig) => {
    try {
        const { responsePacket, socket } = await exports.connectAndRequest(basicPeerInfo, exports.REMOTE_RPC_GET_NODE_INFO, nodeInfo, peerConfig);
        const protocolPeerInfo = responsePacket.data;
        const rawPeerInfo = Object.assign(Object.assign({}, protocolPeerInfo), { ip: basicPeerInfo.ipAddress, wsPort: basicPeerInfo.wsPort });
        const peerInfo = validation_1.validatePeerInfo(rawPeerInfo);
        return { peerInfo, socket };
    }
    catch (error) {
        throw new errors_1.FetchPeerStatusError(`Error occurred while fetching information from ${basicPeerInfo.ipAddress}:${basicPeerInfo.wsPort}`);
    }
};
exports.connectAndFetchPeerInfo = connectAndFetchPeerInfo;
//# sourceMappingURL=peer.js.map