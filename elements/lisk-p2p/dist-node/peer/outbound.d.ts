import { P2PMessagePacketBufferData, PeerConfig, P2PPeerInfo, P2PRequestPacketBufferData, P2PResponsePacketBufferData } from '../types';
import { Peer, SCClientSocket } from './base';
export declare class OutboundPeer extends Peer {
    protected _socket: SCClientSocket | undefined;
    constructor(peerInfo: P2PPeerInfo, peerConfig: PeerConfig);
    set socket(scClientSocket: SCClientSocket);
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    send(packet: P2PMessagePacketBufferData): void;
    request(packet: P2PRequestPacketBufferData): Promise<P2PResponsePacketBufferData>;
    private _createOutboundSocket;
    private _bindHandlersToOutboundSocket;
    private _unbindHandlersFromOutboundSocket;
    private _updateOutboundRPCCounter;
    private _getOutboundRPCRate;
}
