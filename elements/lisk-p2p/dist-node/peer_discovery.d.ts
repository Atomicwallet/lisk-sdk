import { P2PDiscoveredPeerInfo } from './p2p_types';
import { Peer } from './peer';
export interface FilterPeerOptions {
    readonly blacklist: ReadonlyArray<string>;
}
export declare const discoverPeers: (knownPeers: ReadonlyArray<Peer>, filterPeerOptions?: FilterPeerOptions) => Promise<ReadonlyArray<P2PDiscoveredPeerInfo>>;
