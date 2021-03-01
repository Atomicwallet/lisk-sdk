import { P2PPeerInfo } from './types';
export declare class PeerInboundHandshakeError extends Error {
    statusCode: number;
    remoteAddress: string;
    handshakeURL?: string;
    constructor(message: string, statusCode: number, remoteAddress: string, handshakeURL?: string);
}
export declare class PeerInboundDuplicateConnectionError extends Error {
    peerId: string;
    constructor(message: string, peerId: string);
}
export declare class RPCResponseError extends Error {
    peerId: string;
    constructor(message: string, peerId: string);
}
export declare class InvalidRPCResponseError extends Error {
    constructor(message: string);
}
export declare class RPCResponseAlreadySentError extends Error {
    constructor(message: string);
}
export declare class ExistingPeerError extends Error {
    peerInfo: P2PPeerInfo;
    constructor(peerInfo: P2PPeerInfo);
}
export declare class InvalidNodeInfoError extends Error {
    constructor(message: string);
}
export declare class InvalidPeerInfoError extends Error {
    constructor(message: string);
}
export declare class InvalidPeerInfoListError extends Error {
    constructor(message: string);
}
export declare class RequestFailError extends Error {
    peerId: string;
    peerVersion: string;
    response: Error;
    constructor(message: string, response?: Error, peerId?: string, peerVersion?: string);
}
export declare class SendFailError extends Error {
    constructor(message: string);
}
export declare class InvalidRPCRequestError extends Error {
    constructor(message: string);
}
export declare class InvalidProtocolMessageError extends Error {
    constructor(message: string);
}
export declare class InvalidPayloadError extends Error {
    parsedMessage: object;
    constructor(message: string, parsedMessage: object);
}
export declare class InvalidDisconnectEventError extends Error {
    constructor(message: string);
}
