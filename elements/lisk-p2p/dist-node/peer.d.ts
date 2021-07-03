/// <reference types="node" />
import { EventEmitter } from 'events';
import { P2PDiscoveredPeerInfo, P2PMessagePacket, P2PNodeInfo, P2PPeerInfo, P2PRequestPacket, P2PResponsePacket } from './p2p_types';
import * as socketClusterClient from 'socketcluster-client';
import { SCServerSocket } from 'socketcluster-server';
declare type SCClientSocket = socketClusterClient.SCClientSocket;
export declare const EVENT_UPDATED_PEER_INFO = "updatedPeerInfo";
export declare const EVENT_FAILED_PEER_INFO_UPDATE = "failedPeerInfoUpdate";
export declare const EVENT_REQUEST_RECEIVED = "requestReceived";
export declare const EVENT_INVALID_REQUEST_RECEIVED = "invalidRequestReceived";
export declare const EVENT_MESSAGE_RECEIVED = "messageReceived";
export declare const EVENT_INVALID_MESSAGE_RECEIVED = "invalidMessageReceived";
export declare const EVENT_CONNECT_OUTBOUND = "connectOutbound";
export declare const EVENT_CONNECT_ABORT_OUTBOUND = "connectAbortOutbound";
export declare const EVENT_CLOSE_OUTBOUND = "closeOutbound";
export declare const EVENT_OUTBOUND_SOCKET_ERROR = "outboundSocketError";
export declare const EVENT_INBOUND_SOCKET_ERROR = "inboundSocketError";
export declare const EVENT_DISCOVERED_PEER = "discoveredPeer";
export declare const EVENT_FAILED_TO_FETCH_PEER_INFO = "failedToFetchPeerInfo";
export declare const EVENT_FAILED_TO_PUSH_NODE_INFO = "failedToPushNodeInfo";
export declare const REMOTE_EVENT_RPC_REQUEST = "rpc-request";
export declare const REMOTE_EVENT_MESSAGE = "remote-message";
export declare const REMOTE_RPC_UPDATE_PEER_INFO = "updateMyself";
export declare const REMOTE_RPC_GET_NODE_INFO = "status";
export declare const REMOTE_RPC_GET_ALL_PEERS_LIST = "list";
export declare const DEFAULT_CONNECT_TIMEOUT = 2000;
export declare const DEFAULT_ACK_TIMEOUT = 2000;
export declare enum ConnectionState {
    CONNECTING = 0,
    CONNECTED = 1,
    DISCONNECTED = 2
}
export interface PeerConnectionState {
    readonly inbound: ConnectionState;
    readonly outbound: ConnectionState;
}
export declare const constructPeerId: (ipAddress: string, wsPort: number) => string;
export declare const constructPeerIdFromPeerInfo: (peerInfo: P2PPeerInfo) => string;
export interface PeerConfig {
    readonly connectTimeout?: number;
    readonly ackTimeout?: number;
    readonly wsMaxPayload?: number;
    readonly maxPeerListSize?: number;
}
export interface PeerSockets {
    readonly outbound?: SCClientSocket;
    readonly inbound?: SCServerSocket;
}
export declare class Peer extends EventEmitter {
    private readonly _id;
    private readonly _ipAddress;
    private readonly _wsPort;
    private readonly _height;
    private _peerInfo;
    private readonly _peerConfig;
    private _nodeInfo;
    private _inboundSocket;
    private _outboundSocket;
    private readonly _handleRawRPC;
    private readonly _handleRawMessage;
    private readonly _handleRawLegacyMessagePostBlock;
    private readonly _handleRawLegacyMessagePostTransactions;
    private readonly _handleRawLegacyMessagePostSignatures;
    private readonly _handleInboundSocketError;
    constructor(peerInfo: P2PDiscoveredPeerInfo, peerConfig?: PeerConfig, peerSockets?: PeerSockets);
    get height(): number;
    get id(): string;
    set inboundSocket(scServerSocket: SCServerSocket);
    get ipAddress(): string;
    set outboundSocket(scClientSocket: SCClientSocket);
    updatePeerInfo(newPeerInfo: P2PDiscoveredPeerInfo): void;
    get peerInfo(): P2PDiscoveredPeerInfo;
    get state(): PeerConnectionState;
    get wsPort(): number;
    applyNodeInfo(nodeInfo: P2PNodeInfo): Promise<void>;
    get nodeInfo(): P2PNodeInfo | undefined;
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    dropInboundConnection(code?: number, reason?: string): void;
    dropOutboundConnection(code?: number, reason?: string): void;
    send(packet: P2PMessagePacket): void;
    request(packet: P2PRequestPacket): Promise<P2PResponsePacket>;
    fetchPeers(): Promise<ReadonlyArray<P2PDiscoveredPeerInfo>>;
    fetchStatus(): Promise<P2PDiscoveredPeerInfo>;
    private _createOutboundSocket;
    private _updatePeerOnConnect;
    private _bindHandlersToOutboundSocket;
    private _unbindHandlersFromOutboundSocket;
    private _bindHandlersToInboundSocket;
    private _unbindHandlersFromInboundSocket;
    private _updateFromProtocolPeerInfo;
    private _handleUpdatePeerInfo;
    private _handleGetNodeInfo;
}
export interface ConnectAndFetchResponse {
    readonly responsePacket: P2PResponsePacket;
    readonly socket: SCClientSocket;
}
export interface PeerInfoAndOutboundConnection {
    readonly peerInfo: P2PDiscoveredPeerInfo;
    readonly socket: SCClientSocket;
}
export declare const connectAndRequest: (basicPeerInfo: P2PPeerInfo, procedure: string, nodeInfo: P2PNodeInfo, peerConfig: PeerConfig) => Promise<ConnectAndFetchResponse>;
export declare const connectAndFetchPeerInfo: (basicPeerInfo: P2PPeerInfo, nodeInfo: P2PNodeInfo, peerConfig: PeerConfig) => Promise<PeerInfoAndOutboundConnection>;
export {};
