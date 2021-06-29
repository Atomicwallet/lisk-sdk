"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundPeer = void 0;
const constants_1 = require("../constants");
const events_1 = require("../events");
const base_1 = require("./base");
const getRandomPingDelay = () => Math.random() * (constants_1.DEFAULT_PING_INTERVAL_MAX - constants_1.DEFAULT_PING_INTERVAL_MIN) +
    constants_1.DEFAULT_PING_INTERVAL_MIN;
class InboundPeer extends base_1.Peer {
    constructor(peerInfo, peerSocket, peerConfig) {
        super(peerInfo, peerConfig);
        this._peerInfo.internalState.connectionKind = constants_1.ConnectionKind.INBOUND;
        this._handleInboundSocketError = (error) => {
            this.emit(events_1.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        this._handleInboundSocketClose = (code, reasonMessage) => {
            var _a;
            const reason = reasonMessage !== undefined && reasonMessage !== ''
                ? reasonMessage
                : (_a = base_1.socketErrorStatusCodes[code]) !== null && _a !== void 0 ? _a : 'Unknown reason';
            if (this._pingTimeoutId) {
                clearTimeout(this._pingTimeoutId);
            }
            this.emit(events_1.EVENT_CLOSE_INBOUND, {
                peerInfo,
                code,
                reason,
            });
        };
        this._pingTimeoutId = setTimeout(() => {
            this._sendPing();
        }, getRandomPingDelay());
        this._socket = peerSocket;
        this._bindHandlersToInboundSocket(this._socket);
    }
    set socket(scServerSocket) {
        this._unbindHandlersFromInboundSocket(this._socket);
        this._socket = scServerSocket;
        this._bindHandlersToInboundSocket(this._socket);
    }
    disconnect(code = constants_1.INTENTIONAL_DISCONNECT_CODE, reason) {
        super.disconnect(code, reason);
        clearTimeout(this._pingTimeoutId);
        this._unbindHandlersFromInboundSocket(this._socket);
    }
    _sendPing() {
        const pingStart = Date.now();
        this.request({ procedure: events_1.REMOTE_EVENT_PING })
            .catch(() => { })
            .finally(() => {
            this._peerInfo.internalState.latency = Date.now() - pingStart;
            this._pingTimeoutId = setTimeout(() => {
                this._sendPing();
            }, getRandomPingDelay());
        });
    }
    _bindHandlersToInboundSocket(inboundSocket) {
        inboundSocket.on('close', this._handleInboundSocketClose);
        inboundSocket.on('error', this._handleInboundSocketError);
        inboundSocket.on('message', this._handleWSMessage);
        inboundSocket.on(events_1.REMOTE_SC_EVENT_RPC_REQUEST, this._handleRawRPC);
        inboundSocket.on(events_1.REMOTE_SC_EVENT_MESSAGE, this._handleRawMessage);
    }
    _unbindHandlersFromInboundSocket(inboundSocket) {
        inboundSocket.off('close', this._handleInboundSocketClose);
        inboundSocket.off('message', this._handleWSMessage);
        inboundSocket.off(events_1.REMOTE_SC_EVENT_RPC_REQUEST, this._handleRawRPC);
        inboundSocket.off(events_1.REMOTE_SC_EVENT_MESSAGE, this._handleRawMessage);
    }
}
exports.InboundPeer = InboundPeer;
//# sourceMappingURL=inbound.js.map