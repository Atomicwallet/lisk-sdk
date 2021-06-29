import { SCServerSocket } from 'socketcluster-server';
import { PeerConfig, P2PPeerInfo } from '../types';
import { Peer, SCServerSocketUpdated } from './base';
export declare class InboundPeer extends Peer {
    protected _socket: SCServerSocketUpdated;
    protected readonly _handleInboundSocketError: (error: Error) => void;
    protected readonly _handleInboundSocketClose: (code: number, reason: string | undefined) => void;
    private _pingTimeoutId;
    constructor(peerInfo: P2PPeerInfo, peerSocket: SCServerSocket, peerConfig: PeerConfig);
    set socket(scServerSocket: SCServerSocket);
    disconnect(code?: number, reason?: string): void;
    private _sendPing;
    private _bindHandlersToInboundSocket;
    private _unbindHandlersFromInboundSocket;
}
