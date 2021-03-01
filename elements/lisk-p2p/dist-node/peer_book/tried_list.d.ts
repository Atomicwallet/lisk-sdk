import { P2PPeerInfo } from '../types';
import { BaseList, PeerListConfig } from './base_list';
export interface TriedListConfig extends PeerListConfig {
    readonly maxReconnectTries?: number;
}
export declare class TriedList extends BaseList {
    private readonly _maxReconnectTries;
    constructor({ numOfBuckets, bucketSize, maxReconnectTries, secret, peerType, }: TriedListConfig);
    get triedPeerConfig(): TriedListConfig;
    failedConnectionAction(incomingPeerInfo: P2PPeerInfo): boolean;
}
