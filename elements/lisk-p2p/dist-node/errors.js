"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDisconnectEventError = exports.InvalidPayloadError = exports.InvalidProtocolMessageError = exports.InvalidRPCRequestError = exports.SendFailError = exports.RequestFailError = exports.InvalidPeerInfoListError = exports.InvalidPeerInfoError = exports.InvalidNodeInfoError = exports.ExistingPeerError = exports.RPCResponseAlreadySentError = exports.InvalidRPCResponseError = exports.RPCResponseError = exports.PeerInboundDuplicateConnectionError = exports.PeerInboundHandshakeError = void 0;
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
class PeerInboundDuplicateConnectionError extends Error {
    constructor(message, peerId) {
        super(message);
        this.name = 'PeerInboundDuplicateConnectionError';
        this.peerId = peerId;
    }
}
exports.PeerInboundDuplicateConnectionError = PeerInboundDuplicateConnectionError;
class RPCResponseError extends Error {
    constructor(message, peerId) {
        super(message);
        this.name = 'RPCResponseError';
        this.peerId = peerId;
    }
}
exports.RPCResponseError = RPCResponseError;
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
class ExistingPeerError extends Error {
    constructor(peerInfo) {
        super('Peer already exists');
        this.name = 'ExistingPeerError';
        this.peerInfo = peerInfo;
    }
}
exports.ExistingPeerError = ExistingPeerError;
class InvalidNodeInfoError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidNodeInfoError';
    }
}
exports.InvalidNodeInfoError = InvalidNodeInfoError;
class InvalidPeerInfoError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidPeerInfoError';
    }
}
exports.InvalidPeerInfoError = InvalidPeerInfoError;
class InvalidPeerInfoListError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidPeerInfoListError';
    }
}
exports.InvalidPeerInfoListError = InvalidPeerInfoListError;
class RequestFailError extends Error {
    constructor(message, response, peerId, peerVersion) {
        super(message);
        this.name = 'RequestFailError';
        this.response = response !== null && response !== void 0 ? response : new Error(message);
        this.peerId = peerId !== null && peerId !== void 0 ? peerId : '';
        this.peerVersion = peerVersion !== null && peerVersion !== void 0 ? peerVersion : '';
        this.message = peerId
            ? `${this.message}: Peer Id: ${this.peerId}: Peer Version: ${this.peerVersion}`
            : message;
    }
}
exports.RequestFailError = RequestFailError;
class SendFailError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SendFailError';
    }
}
exports.SendFailError = SendFailError;
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
class InvalidPayloadError extends Error {
    constructor(message, parsedMessage) {
        super(message);
        this.name = 'InvalidPayloadError';
        this.parsedMessage = parsedMessage;
    }
}
exports.InvalidPayloadError = InvalidPayloadError;
class InvalidDisconnectEventError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidDisconnectEventError';
    }
}
exports.InvalidDisconnectEventError = InvalidDisconnectEventError;
//# sourceMappingURL=errors.js.map