export declare class PeerInboundHandshakeError extends Error {
    statusCode: number;
    remoteAddress: string;
    handshakeURL?: string;
    constructor(message: string, statusCode: number, remoteAddress: string, handshakeURL?: string);
}
export declare class PeerOutboundConnectionError extends Error {
    statusCode?: number;
    constructor(message: string, statusCode?: number);
}
export declare class RPCResponseError extends Error {
    peerId: string;
    constructor(message: string, peerId: string);
}
export declare class FetchPeerStatusError extends Error {
    constructor(message: string);
}
export declare class InvalidRPCResponseError extends Error {
    constructor(message: string);
}
export declare class RPCResponseAlreadySentError extends Error {
    constructor(message: string);
}
export declare class InvalidPeerError extends Error {
    constructor(message: string);
}
export declare class RequestFailError extends Error {
    peerId: string;
    peerVersion: string;
    response: Error;
    constructor(message: string, response?: Error, peerId?: string, peerVersion?: string);
}
export declare class InvalidRPCRequestError extends Error {
    constructor(message: string);
}
export declare class InvalidProtocolMessageError extends Error {
    constructor(message: string);
}
