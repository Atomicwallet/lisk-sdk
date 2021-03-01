"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const socketClusterClient = require("socketcluster-client");
const constants_1 = require("../constants");
const events_1 = require("../events");
const base_1 = require("./base");
class OutboundPeer extends base_1.Peer {
    constructor(peerInfo, peerConfig) {
        super(peerInfo, peerConfig);
        this._peerInfo.internalState.connectionKind = constants_1.ConnectionKind.OUTBOUND;
    }
    set socket(scClientSocket) {
        if (this._socket) {
            this._unbindHandlersFromOutboundSocket(this._socket);
        }
        this._socket = scClientSocket;
        this._bindHandlersToOutboundSocket(this._socket);
    }
    connect() {
        if (!this._socket) {
            this._socket = this._createOutboundSocket();
        }
        this._socket.connect();
    }
    disconnect(code = constants_1.INTENTIONAL_DISCONNECT_CODE, reason) {
        super.disconnect(code, reason);
        if (this._socket) {
            this._unbindHandlersFromOutboundSocket(this._socket);
        }
    }
    send(packet) {
        if (!this._socket) {
            this._socket = this._createOutboundSocket();
        }
        super.send(packet);
    }
    async request(packet) {
        if (!this._socket) {
            this._socket = this._createOutboundSocket();
        }
        return super.request(packet);
    }
    _createOutboundSocket() {
        const connectTimeout = this._peerConfig.connectTimeout
            ? this._peerConfig.connectTimeout
            : constants_1.DEFAULT_CONNECT_TIMEOUT;
        const ackTimeout = this._peerConfig.ackTimeout
            ? this._peerConfig.ackTimeout
            : constants_1.DEFAULT_ACK_TIMEOUT;
        const { options, ...nodeInfo } = this._serverNodeInfo;
        const queryObject = {
            networkVersion: nodeInfo.networkVersion,
            networkIdentifier: nodeInfo.networkIdentifier,
            nonce: nodeInfo.nonce,
            advertiseAddress: nodeInfo.advertiseAddress,
            port: this._peerConfig.hostPort,
        };
        const clientOptions = {
            hostname: this.ipAddress,
            path: constants_1.DEFAULT_HTTP_PATH,
            port: this.port,
            query: querystring.stringify(queryObject),
            connectTimeout,
            ackTimeout,
            multiplex: false,
            autoConnect: true,
            autoReconnect: false,
            maxPayload: this._peerConfig.wsMaxPayload,
        };
        const outboundSocket = socketClusterClient.create(clientOptions);
        this._bindHandlersToOutboundSocket(outboundSocket);
        return outboundSocket;
    }
    _bindHandlersToOutboundSocket(outboundSocket) {
        outboundSocket.on('error', (error) => {
            this.emit(events_1.EVENT_OUTBOUND_SOCKET_ERROR, error);
        });
        outboundSocket.on('connect', async () => {
            try {
                await this.fetchAndUpdateStatus();
            }
            catch (error) {
                this.emit(events_1.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, error);
                return;
            }
            try {
                await this.discoverPeers();
            }
            catch (error) {
                this.emit(events_1.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, error);
            }
            this.emit(events_1.EVENT_CONNECT_OUTBOUND, this._peerInfo);
        });
        outboundSocket.on('connectAbort', () => {
            this.emit(events_1.EVENT_CONNECT_ABORT_OUTBOUND, this._peerInfo);
        });
        outboundSocket.on('close', (code, reasonMessage) => {
            var _a;
            const reason = reasonMessage !== undefined && reasonMessage !== ''
                ? reasonMessage
                : (_a = base_1.socketErrorStatusCodes[code]) !== null && _a !== void 0 ? _a : 'Unknown reason';
            this.emit(events_1.EVENT_CLOSE_OUTBOUND, {
                peerInfo: this._peerInfo,
                code,
                reason,
            });
        });
        outboundSocket.on('message', this._handleWSMessage);
        outboundSocket.on(events_1.REMOTE_EVENT_PING, (_, res) => {
            res(undefined, events_1.REMOTE_EVENT_PONG);
        });
        outboundSocket.on(events_1.REMOTE_SC_EVENT_RPC_REQUEST, this._handleRawRPC);
        outboundSocket.on(events_1.REMOTE_SC_EVENT_MESSAGE, this._handleRawMessage);
        const transportSocket = outboundSocket.transport;
        if ((transportSocket === null || transportSocket === void 0 ? void 0 : transportSocket.socket) && transportSocket.socket.on) {
            transportSocket.socket.on(events_1.REMOTE_EVENT_PING, () => {
                transportSocket.socket.terminate();
                this.applyPenalty(100);
            });
            transportSocket.socket.on(events_1.REMOTE_EVENT_PONG, () => {
                transportSocket.socket.terminate();
                this.applyPenalty(100);
            });
        }
    }
    _unbindHandlersFromOutboundSocket(outboundSocket) {
        outboundSocket.off('connect');
        outboundSocket.off('connectAbort');
        outboundSocket.off('close');
        outboundSocket.off('message', this._handleWSMessage);
        outboundSocket.off(events_1.REMOTE_SC_EVENT_RPC_REQUEST, this._handleRawRPC);
        outboundSocket.off(events_1.REMOTE_SC_EVENT_MESSAGE, this._handleRawMessage);
        outboundSocket.off(events_1.REMOTE_EVENT_PING);
    }
}
exports.OutboundPeer = OutboundPeer;
//# sourceMappingURL=outbound.js.map