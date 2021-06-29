/// <reference types="node" />
import { P2PEnhancedPeerInfo } from '../types';
export declare const SECRET_BUFFER_LENGTH = 4;
export declare const NETWORK_BUFFER_LENGTH = 1;
interface AddressBytes {
    readonly aBytes: Buffer;
    readonly bBytes: Buffer;
    readonly cBytes: Buffer;
    readonly dBytes: Buffer;
}
export declare const getIPGroup: (address: string, groupNumber: number) => number;
export declare const getIPBytes: (address: string) => AddressBytes;
export declare enum NETWORK {
    NET_IPV4 = 0,
    NET_PRIVATE = 1,
    NET_LOCAL = 2,
    NET_OTHER = 3
}
export declare enum PEER_TYPE {
    NEW_PEER = "newPeer",
    TRIED_PEER = "triedPeer"
}
export declare const isPrivate: (address: string) => boolean;
export declare const isLocal: (address: string) => boolean;
export declare const getNetwork: (address: string) => NETWORK;
export declare const getNetgroup: (address: string, secret: number) => number;
export declare const constructPeerId: (ipAddress: string, port: number) => string;
export declare const getByteSize: (data: Buffer | object) => number;
export declare const evictPeerRandomlyFromBucket: (bucket: Map<string, P2PEnhancedPeerInfo>) => P2PEnhancedPeerInfo | undefined;
export declare const expirePeerFromBucket: (bucket: Map<string, P2PEnhancedPeerInfo>, thresholdTime: number) => P2PEnhancedPeerInfo | undefined;
export declare const getBucketId: (options: {
    readonly secret: number;
    readonly peerType: PEER_TYPE;
    readonly targetAddress: string;
    readonly sourceAddress?: string;
    readonly bucketCount: number;
}) => number;
export {};
