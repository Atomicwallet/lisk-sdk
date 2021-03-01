/// <reference types="node" />
import { EventEmitter } from 'events';
import { PeerServerConfig } from '../types';
export declare class PeerServer extends EventEmitter {
    protected _invalidMessageInterval?: NodeJS.Timer;
    protected _invalidMessageCounter: Map<string, number>;
    private readonly _nodeInfo;
    private readonly _hostIp;
    private readonly _port;
    private readonly _secret;
    private readonly _maxPeerInfoSize;
    private readonly _peerBook;
    private readonly _httpServer;
    private readonly _scServer;
    private readonly _peerHandshakeCheck;
    constructor(config: PeerServerConfig);
    stop(): Promise<void>;
    start(): Promise<void>;
    private _terminateIncomingSocket;
    private _disconnectSocketDueToFailedHandshake;
    private _validateQueryObject;
    private _constructPeerInfoForInboundConnection;
    private _checkPeerCompatibility;
    private _handleIncomingConnection;
    private _bindInvalidControlFrameEvents;
    private _handleIncomingPayload;
    private _stopHTTPServer;
    private _stopWSServer;
}
