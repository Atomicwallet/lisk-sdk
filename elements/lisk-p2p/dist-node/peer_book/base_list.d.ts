import { P2PEnhancedPeerInfo, P2PPeerInfo } from '../types';
import { PEER_TYPE } from '../utils';
export interface PeerListConfig {
    readonly numOfBuckets: number;
    readonly bucketSize: number;
    readonly secret: number;
    readonly peerType: PEER_TYPE;
}
export declare type Bucket = Map<string, P2PEnhancedPeerInfo>;
export interface BucketInfo {
    readonly bucketId: number;
    readonly bucket: Bucket;
}
export declare class BaseList {
    protected bucketIdToBucket: Map<number, Bucket>;
    protected peerIdToPeerInfo: Map<string, P2PEnhancedPeerInfo>;
    protected type: PEER_TYPE | undefined;
    protected readonly peerListConfig: PeerListConfig;
    constructor({ bucketSize, numOfBuckets, secret, peerType }: PeerListConfig);
    get peerList(): ReadonlyArray<P2PPeerInfo>;
    hasPeer(incomingPeerId: string): boolean;
    addPeer(incomingPeerInfo: P2PEnhancedPeerInfo): P2PEnhancedPeerInfo | undefined;
    getPeer(incomingPeerId: string): P2PPeerInfo | undefined;
    updatePeer(incomingPeerInfo: P2PEnhancedPeerInfo): boolean;
    removePeer(incomingPeerInfo: P2PPeerInfo): boolean;
    makeSpace(bucket: Bucket): P2PEnhancedPeerInfo | undefined;
    failedConnectionAction(incomingPeerInfo: P2PPeerInfo): boolean;
    calculateBucket(targetAddress: string, sourceAddress?: string): BucketInfo;
    protected getBucket(peerId: string): Bucket | undefined;
    private _initBuckets;
}
