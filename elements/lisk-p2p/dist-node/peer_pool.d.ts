/// <reference types="node" />
import { EventEmitter } from 'events';
import { SCServerSocket } from 'socketcluster-server';
import { InboundPeer, OutboundPeer, Peer } from './peer';
import { P2PNodeInfo, P2PPeerInfo, P2PPeersCount, P2PPenalty, P2PResponsePacket, P2PRequestPacketBufferData, P2PMessagePacketBufferData, PeerConfig, PeerPoolConfig } from './types';
interface FilterPeersOptions {
    readonly category: PROTECTION_CATEGORY;
    readonly percentage: number;
    readonly protectBy: PROTECT_BY;
}
export declare enum PROTECT_BY {
    HIGHEST = "highest",
    LOWEST = "lowest"
}
export declare const filterPeersByCategory: (peers: Peer[], options: FilterPeersOptions) => Peer[];
export declare enum PROTECTION_CATEGORY {
    NET_GROUP = "netgroup",
    LATENCY = "latency",
    RESPONSE_RATE = "responseRate",
    CONNECT_TIME = "connectTime"
}
export declare class PeerPool extends EventEmitter {
    private readonly _peerMap;
    private readonly _peerPoolConfig;
    private readonly _handlePeerRPC;
    private readonly _handlePeerMessage;
    private readonly _handleOutboundPeerConnect;
    private readonly _handleDiscoverPeer;
    private readonly _handleOutboundPeerConnectAbort;
    private readonly _handlePeerCloseOutbound;
    private readonly _handlePeerCloseInbound;
    private readonly _handlePeerOutboundSocketError;
    private readonly _handlePeerInboundSocketError;
    private readonly _handlePeerInfoUpdate;
    private readonly _handleFailedPeerInfoUpdate;
    private readonly _handleFailedToFetchPeerInfo;
    private readonly _handleFailedToFetchPeers;
    private readonly _handleFailedToCollectPeerDetails;
    private readonly _handleBanPeer;
    private _nodeInfo;
    private readonly _maxOutboundConnections;
    private readonly _maxInboundConnections;
    private readonly _peerSelectForSend;
    private readonly _peerSelectForRequest;
    private readonly _peerSelectForConnection;
    private readonly _sendPeerLimit;
    private readonly _outboundShuffleIntervalId;
    private readonly _peerConfig;
    private readonly _peerBook;
    private readonly _rpcSchema;
    constructor(peerPoolConfig: PeerPoolConfig);
    applyNodeInfo(nodeInfo: P2PNodeInfo): void;
    get nodeInfo(): P2PNodeInfo | undefined;
    get peerConfig(): PeerConfig;
    request(packet: P2PRequestPacketBufferData): Promise<P2PResponsePacket>;
    broadcast(message: P2PMessagePacketBufferData): void;
    send(message: P2PMessagePacketBufferData): void;
    requestFromPeer(packet: P2PRequestPacketBufferData, peerId: string): Promise<P2PResponsePacket>;
    sendToPeer(message: P2PMessagePacketBufferData, peerId: string): void;
    discoverFromSeedPeers(): void;
    triggerNewConnections(newPeers: ReadonlyArray<P2PPeerInfo>, triedPeers: ReadonlyArray<P2PPeerInfo>): void;
    addInboundPeer(peerInfo: P2PPeerInfo, socket: SCServerSocket): Peer;
    getPeersCountPerKind(): P2PPeersCount;
    removeAllPeers(): void;
    getPeers(kind?: typeof OutboundPeer | typeof InboundPeer): ReadonlyArray<Peer>;
    getAllConnectedPeerInfos(kind?: typeof OutboundPeer | typeof InboundPeer): ReadonlyArray<P2PPeerInfo>;
    getConnectedPeers(kind?: typeof OutboundPeer | typeof InboundPeer): ReadonlyArray<Peer>;
    getPeer(peerId: string): Peer | undefined;
    hasPeer(peerId: string): boolean;
    removePeer(peerId: string, code?: number, reason?: string): boolean;
    applyPenalty(peerPenalty: P2PPenalty): void;
    getFreeOutboundSlots(): number;
    private _applyNodeInfoOnPeer;
    private _disconnectFromSeedPeers;
    private _selectPeersForEviction;
    private _evictPeer;
    private _bindHandlersToPeer;
    private _unbindHandlersFromPeer;
    private _addOutboundPeer;
}
export {};
