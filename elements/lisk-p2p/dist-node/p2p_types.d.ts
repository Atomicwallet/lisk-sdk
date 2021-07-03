export interface P2PPacket {
    readonly data?: unknown;
}
export interface P2PRequestPacket extends P2PPacket {
    readonly data?: unknown;
    readonly procedure: string;
}
export interface P2PResponsePacket extends P2PPacket {
    readonly data: unknown;
}
export interface P2PMessagePacket extends P2PPacket {
    readonly data?: unknown;
    readonly event: string;
}
export interface P2PPenalty {
}
export interface P2PPeerInfo {
    readonly ipAddress: string;
    readonly wsPort: number;
}
export interface P2PDiscoveredPeerInfo extends P2PPeerInfo {
    readonly height: number;
    readonly updatedAt?: Date;
    readonly os?: string;
    readonly version: string;
    readonly protocolVersion: string;
    readonly [key: string]: unknown;
}
export interface P2PNodeInfo {
    readonly os: string;
    readonly version: string;
    readonly protocolVersion: string;
    readonly nethash: string;
    readonly wsPort: number;
    readonly height: number;
    readonly [key: string]: unknown;
}
export interface P2PClosePacket {
    readonly peerInfo: P2PDiscoveredPeerInfo;
    readonly code: number;
    readonly reason?: string;
}
export interface P2PConfig {
    readonly blacklistedPeers?: ReadonlyArray<P2PPeerInfo>;
    readonly connectTimeout?: number;
    readonly ackTimeout?: number;
    readonly hostAddress?: string;
    readonly seedPeers: ReadonlyArray<P2PPeerInfo>;
    readonly triedPeers?: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly nodeInfo: P2PNodeInfo;
    readonly wsEngine?: string;
    readonly wsMaxPayload?: number;
    readonly discoveryInterval?: number;
    readonly peerSelectionForSend?: P2PPeerSelectionForSendFunction;
    readonly peerSelectionForRequest?: P2PPeerSelectionForRequestFunction;
    readonly peerSelectionForConnection?: P2PPeerSelectionForConnectionFunction;
    readonly peerHandshakeCheck?: P2PCheckPeerCompatibility;
    readonly sendPeerLimit?: number;
}
export interface P2PNetworkStatus {
    readonly newPeers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly triedPeers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly connectedPeers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly connectedUniquePeers: ReadonlyArray<P2PDiscoveredPeerInfo>;
}
export interface ProtocolNodeInfo {
    readonly broadhash: string;
    readonly nethash: string;
    readonly height: number;
    readonly nonce: string;
    readonly os?: string;
    readonly version: string;
    readonly wsPort: number;
    readonly httpPort: number;
    readonly [key: string]: unknown;
}
export interface P2PPeerSelectionForSendInput {
    readonly peers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly nodeInfo?: P2PNodeInfo;
    readonly peerLimit?: number;
    readonly messagePacket?: P2PMessagePacket;
}
export declare type P2PPeerSelectionForSendFunction = (input: P2PPeerSelectionForSendInput) => ReadonlyArray<P2PDiscoveredPeerInfo>;
export interface P2PPeerSelectionForRequestInput {
    readonly peers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly nodeInfo?: P2PNodeInfo;
    readonly peerLimit?: number;
    readonly requestPacket?: P2PRequestPacket;
}
export declare type P2PPeerSelectionForRequestFunction = (input: P2PPeerSelectionForRequestInput) => ReadonlyArray<P2PDiscoveredPeerInfo>;
export interface P2PPeerSelectionForConnectionInput {
    readonly peers: ReadonlyArray<P2PDiscoveredPeerInfo>;
    readonly nodeInfo?: P2PNodeInfo;
}
export declare type P2PPeerSelectionForConnectionFunction = (input: P2PPeerSelectionForConnectionInput) => ReadonlyArray<P2PDiscoveredPeerInfo>;
export interface P2PCompatibilityCheckReturnType {
    readonly success: boolean;
    readonly errors?: string[];
}
export declare type P2PCheckPeerCompatibility = (headers: P2PDiscoveredPeerInfo, nodeInfo: P2PNodeInfo) => P2PCompatibilityCheckReturnType;
export interface ProtocolPeerInfo {
    readonly ip: string;
    readonly broadhash: string;
    readonly height: number;
    readonly nonce: string;
    readonly os?: string;
    readonly version: string;
    readonly protocolVersion: string;
    readonly wsPort: number;
    readonly httpPort?: number;
    readonly [key: string]: unknown;
}
export interface ProtocolPeerInfoList {
    readonly peers: ReadonlyArray<ProtocolPeerInfo>;
    readonly success: boolean;
}
export interface ProtocolRPCRequestPacket {
    readonly data: unknown;
    readonly procedure: string;
    readonly type: string;
}
export interface ProtocolMessagePacket {
    readonly data: unknown;
    readonly event: string;
}
