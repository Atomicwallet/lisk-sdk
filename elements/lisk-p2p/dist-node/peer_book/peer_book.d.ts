import { P2PEnhancedPeerInfo, P2PPeerInfo, PeerLists } from '../types';
export interface PeerBookConfig {
    readonly sanitizedPeerLists: PeerLists;
    readonly secret: number;
}
export declare class PeerBook {
    private readonly _newPeers;
    private readonly _triedPeers;
    private readonly _bannedIPs;
    private readonly _blacklistedIPs;
    private readonly _seedPeers;
    private readonly _fixedPeers;
    private readonly _whitelistedPeers;
    private readonly _unbanTimers;
    private readonly _secret;
    constructor({ sanitizedPeerLists, secret }: PeerBookConfig);
    get newPeers(): ReadonlyArray<P2PPeerInfo>;
    get triedPeers(): ReadonlyArray<P2PPeerInfo>;
    get allPeers(): ReadonlyArray<P2PPeerInfo>;
    get seedPeers(): ReadonlyArray<P2PPeerInfo>;
    get fixedPeers(): ReadonlyArray<P2PPeerInfo>;
    get whitelistedPeers(): ReadonlyArray<P2PPeerInfo>;
    get bannedIPs(): Set<string>;
    cleanUpTimers(): void;
    getRandomizedPeerList(minimumPeerDiscoveryThreshold: number, maxPeerDiscoveryResponseLength: number): ReadonlyArray<P2PPeerInfo>;
    getPeer(peerInfo: P2PPeerInfo): P2PPeerInfo | undefined;
    hasPeer(peerInfo: P2PPeerInfo): boolean;
    addPeer(peerInfo: P2PEnhancedPeerInfo): boolean;
    removePeer(peerInfo: P2PPeerInfo): void;
    updatePeer(peerInfo: P2PPeerInfo): boolean;
    upgradePeer(peerInfo: P2PEnhancedPeerInfo): boolean;
    downgradePeer(peerInfo: P2PEnhancedPeerInfo): boolean;
    isTrustedPeer(peerId: string): boolean;
    addBannedPeer(peerId: string, peerBanTime: number): void;
    private _removeBannedPeer;
    private _assignPeerKind;
}
