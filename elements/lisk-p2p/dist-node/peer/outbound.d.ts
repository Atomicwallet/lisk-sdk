import { P2PMessagePacket, P2PPeerInfo, P2PRequestPacket, P2PResponsePacket } from '../types';
import { Peer, PeerConfig, SCClientSocket } from './base';
export declare class OutboundPeer extends Peer {
    protected _socket: SCClientSocket | undefined;
    constructor(peerInfo: P2PPeerInfo, peerConfig: PeerConfig);
    set socket(scClientSocket: SCClientSocket);
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    send(packet: P2PMessagePacket): void;
    request(packet: P2PRequestPacket): Promise<P2PResponsePacket>;
    private _createOutboundSocket;
    private _bindHandlersToOutboundSocket;
    private _unbindHandlersFromOutboundSocket;
}
