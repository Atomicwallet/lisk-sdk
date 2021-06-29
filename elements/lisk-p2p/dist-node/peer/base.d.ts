/// <reference types="node" />
import { EventEmitter } from 'events';
import * as socketClusterClient from 'socketcluster-client';
import { SCServerSocket } from 'socketcluster-server';
import { P2PInternalState, P2PNodeInfo, P2PPeerInfo, P2PMessagePacketBufferData, P2PRequestPacketBufferData, P2PResponsePacketBufferData, P2PRawRequestPacket, PeerConfig } from '../types';
export declare const socketErrorStatusCodes: {
    [key: number]: string | undefined;
};
export declare const RATE_NORMALIZATION_FACTOR = 1000;
export declare type SCClientSocket = socketClusterClient.SCClientSocket;
export declare type SCServerSocketUpdated = {
    destroy(code?: number, data?: string | object): void;
    on(event: string | unknown, listener: (packet?: unknown) => void): void;
    on(event: string, listener: (packet: any, respond: any) => void): void;
} & SCServerSocket;
export declare enum ConnectionState {
    CONNECTING = "connecting",
    OPEN = "open",
    CLOSED = "closed"
}
export interface ConnectedPeerInfo extends P2PPeerInfo {
    internalState: P2PInternalState;
}
export declare class Peer extends EventEmitter {
    protected readonly _handleRawRPC: (packet: P2PRawRequestPacket, respond: (responseError?: Error, responseData?: unknown) => void) => void;
    protected readonly _handleWSMessage: (message: string) => void;
    protected readonly _handleRawMessage: (packet: unknown) => void;
    protected _socket: SCServerSocketUpdated | SCClientSocket | undefined;
    protected _peerInfo: ConnectedPeerInfo;
    protected readonly _peerConfig: PeerConfig;
    protected _serverNodeInfo: P2PNodeInfo | undefined;
    protected _rateInterval: number;
    private readonly _rpcSchemas;
    private readonly _discoveryMessageCounter;
    private readonly _peerStatusMessageRate;
    private readonly _peerStatusRateInterval;
    private readonly _counterResetInterval;
    private readonly _productivityResetInterval;
    constructor(peerInfo: P2PPeerInfo, peerConfig: PeerConfig);
    get id(): string;
    get ipAddress(): string;
    get port(): number;
    get internalState(): P2PInternalState;
    get peerInfo(): ConnectedPeerInfo;
    get state(): ConnectionState;
    updateInternalState(internalState: P2PInternalState): void;
    updatePeerInfo(newPeerInfo: P2PPeerInfo): void;
    connect(): void;
    disconnect(code?: number, reason?: string): void;
    send(packet: P2PMessagePacketBufferData): void;
    request(packet: P2PRequestPacketBufferData): Promise<P2PResponsePacketBufferData>;
    fetchPeers(): Promise<ReadonlyArray<P2PPeerInfo>>;
    discoverPeers(): Promise<ReadonlyArray<P2PPeerInfo>>;
    fetchAndUpdateStatus(): Promise<P2PPeerInfo>;
    applyPenalty(penalty: number): void;
    private _resetCounters;
    private _resetProductivity;
    private _resetStatusMessageRate;
    private _updateFromProtocolPeerInfo;
    private _handleUpdateNodeInfo;
    private _banPeer;
    private _updateRPCCounter;
    private _getRPCRate;
    private _updateMessageCounter;
    private _getMessageRate;
    private _initializeInternalState;
    private _getBase64Data;
    private _getBufferData;
}
