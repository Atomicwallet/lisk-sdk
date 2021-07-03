import { P2PCompatibilityCheckReturnType, P2PDiscoveredPeerInfo, P2PNodeInfo, ProtocolMessagePacket, ProtocolRPCRequestPacket } from './p2p_types';
export declare const validatePeerAddress: (ip: string, wsPort: number) => boolean;
export declare const validatePeerInfo: (rawPeerInfo: unknown) => P2PDiscoveredPeerInfo;
export declare const validatePeerInfoList: (rawPeerInfoList: unknown) => ReadonlyArray<P2PDiscoveredPeerInfo>;
export declare const validateRPCRequest: (request: unknown) => ProtocolRPCRequestPacket;
export declare const validateProtocolMessage: (message: unknown) => ProtocolMessagePacket;
export declare const checkNetworkCompatibility: (peerInfo: P2PDiscoveredPeerInfo, nodeInfo: P2PNodeInfo) => boolean;
export declare const checkProtocolVersionCompatibility: (peerInfo: P2PDiscoveredPeerInfo, nodeInfo: P2PNodeInfo) => boolean;
export declare const checkPeerCompatibility: (peerInfo: P2PDiscoveredPeerInfo, nodeInfo: P2PNodeInfo) => P2PCompatibilityCheckReturnType;
