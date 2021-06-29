/// <reference types="node" />
import { KVStore } from '@liskhq/lisk-db';
import { EventEmitter } from 'events';
import * as liskP2P from '@liskhq/lisk-p2p';
import { InMemoryChannel } from '../../controller/channels';
import { Logger } from '../../logger';
import { NetworkConfig } from '../../types';
interface NodeInfoOptions {
    [key: string]: unknown;
    readonly lastBlockID: Buffer;
    readonly height: number;
    readonly maxHeightPrevoted: number;
    readonly blockVersion: number;
}
interface NetworkConstructor {
    readonly options: NetworkConfig;
    readonly channel: InMemoryChannel;
    readonly logger: Logger;
    readonly nodeDB: KVStore;
    readonly networkVersion: string;
}
interface P2PRequestPacket extends liskP2P.p2pTypes.P2PRequestPacket {
    readonly peerId: string;
}
interface P2PMessagePacket extends liskP2P.p2pTypes.P2PMessagePacket {
    readonly peerId: string;
}
declare type P2PRPCEndpointHandler = (input: {
    data: unknown;
    peerId: string;
}) => unknown;
export declare class Network {
    readonly events: EventEmitter;
    private readonly _options;
    private readonly _channel;
    private readonly _logger;
    private readonly _nodeDB;
    private readonly _networkVersion;
    private _networkID;
    private _secret;
    private _p2p;
    private _endpoints;
    constructor({ options, channel, logger, nodeDB, networkVersion }: NetworkConstructor);
    bootstrap(networkIdentifier: Buffer): Promise<void>;
    registerEndpoint(endpoint: string, handler: P2PRPCEndpointHandler): void;
    request(requestPacket: liskP2P.p2pTypes.P2PRequestPacket): Promise<liskP2P.p2pTypes.P2PResponsePacket>;
    send(sendPacket: liskP2P.p2pTypes.P2PMessagePacket): void;
    requestFromPeer(requestPacket: P2PRequestPacket): Promise<liskP2P.p2pTypes.P2PResponsePacket>;
    sendToPeer(sendPacket: P2PMessagePacket): void;
    broadcast(broadcastPacket: liskP2P.p2pTypes.P2PMessagePacket): void;
    getConnectedPeers(): ReadonlyArray<liskP2P.p2pTypes.PeerInfo>;
    getNetworkStats(): liskP2P.p2pTypes.NetworkStats;
    getDisconnectedPeers(): ReadonlyArray<liskP2P.p2pTypes.PeerInfo>;
    applyPenaltyOnPeer(penaltyPacket: liskP2P.p2pTypes.P2PPenalty): void;
    applyNodeInfo(data: NodeInfoOptions): void;
    cleanup(): Promise<void>;
}
export {};
