import { Channel, NodeInfo, NetworkStats, PeerInfo } from './types';
export declare class Node {
    private readonly _channel;
    constructor(channel: Channel);
    getNodeInfo(): Promise<NodeInfo>;
    getNetworkStats(): Promise<NetworkStats>;
    getConnectedPeers(): Promise<PeerInfo[]>;
    getDisconnectedPeers(): Promise<PeerInfo[]>;
}
