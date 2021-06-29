import { P2PEnhancedPeerInfo, P2PInternalState, P2PPeerInfo, PeerLists, ProtocolPeerInfo } from '../types';
export declare const assignInternalInfo: (peerInfo: P2PPeerInfo, secret: number) => P2PInternalState;
export declare const sanitizeIncomingPeerInfo: (peerInfo: ProtocolPeerInfo) => P2PPeerInfo;
interface SanitizedPeer {
    peerId: string;
    port: number;
    ipAddress: string;
}
export declare const sanitizeInitialPeerInfo: (peerInfo: ProtocolPeerInfo) => SanitizedPeer;
export declare const sanitizeEnhancedPeerInfo: (peerInfo: P2PEnhancedPeerInfo) => P2PPeerInfo;
export declare const sanitizePeerLists: (lists: PeerLists, nodeInfo: P2PPeerInfo, secret: number) => PeerLists;
export {};
