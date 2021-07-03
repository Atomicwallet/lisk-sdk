"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidProtocolMessageError = exports.InvalidRPCRequestError = exports.RequestFailError = exports.InvalidPeerError = exports.RPCResponseAlreadySentError = exports.InvalidRPCResponseError = exports.FetchPeerStatusError = exports.RPCResponseError = exports.PeerOutboundConnectionError = exports.PeerInboundHandshakeError = void 0;
class PeerInboundHandshakeError extends Error {
    constructor(message, statusCode, remoteAddress, handshakeURL) {
        super(message);
        this.name = 'PeerInboundHandshakeError';
        this.statusCode = statusCode;
        this.remoteAddress = remoteAddress;
        this.handshakeURL = handshakeURL;
    }
}
exports.PeerInboundHandshakeError = PeerInboundHandshakeError;
class PeerOutboundConnectionError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'PeerOutboundConnectError';
        this.statusCode = statusCode;
    }
}
exports.PeerOutboundConnectionError = PeerOutboundConnectionError;
class RPCResponseError extends Error {
    constructor(message, peerId) {
        super(message);
        this.name = 'RPCResponseError';
        this.peerId = peerId;
    }
}
exports.RPCResponseError = RPCResponseError;
class FetchPeerStatusError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FetchPeerStatusError';
    }
}
exports.FetchPeerStatusError = FetchPeerStatusError;
class InvalidRPCResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidRPCResponseError';
    }
}
exports.InvalidRPCResponseError = InvalidRPCResponseError;
class RPCResponseAlreadySentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ResponseAlreadySentError';
    }
}
exports.RPCResponseAlreadySentError = RPCResponseAlreadySentError;
class InvalidPeerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidPeerError';
    }
}
exports.InvalidPeerError = InvalidPeerError;
class RequestFailError extends Error {
    constructor(message, response, peerId, peerVersion) {
        super(message);
        this.name = 'RequestFailError';
        this.response = response || new Error(message);
        this.peerId = peerId || '';
        this.peerVersion = peerVersion || '';
        this.message = peerId
            ? `${this.message}: Peer Id: ${this.peerId}: Peer Version: ${this.peerVersion}`
            : message;
    }
}
exports.RequestFailError = RequestFailError;
class InvalidRPCRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidRPCRequestError';
    }
}
exports.InvalidRPCRequestError = InvalidRPCRequestError;
class InvalidProtocolMessageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidProtocolMessageError';
    }
}
exports.InvalidProtocolMessageError = InvalidProtocolMessageError;
//# sourceMappingURL=errors.js.map