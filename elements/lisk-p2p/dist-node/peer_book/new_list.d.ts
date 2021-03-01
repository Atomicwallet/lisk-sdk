import { P2PEnhancedPeerInfo } from '../types';
import { BaseList, Bucket, PeerListConfig } from './base_list';
export interface NewListConfig extends PeerListConfig {
    readonly evictionThresholdTime?: number;
}
export declare class NewList extends BaseList {
    private readonly _evictionThresholdTime;
    constructor({ evictionThresholdTime, numOfBuckets, bucketSize, secret, peerType, }: NewListConfig);
    get newPeerConfig(): NewListConfig;
    makeSpace(bucket: Bucket): P2PEnhancedPeerInfo | undefined;
}
