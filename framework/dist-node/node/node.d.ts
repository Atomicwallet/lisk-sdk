/// <reference types="node" />
import { KVStore } from '@liskhq/lisk-db';
import { handlePostTransactionReturn } from './transport';
import { Logger } from '../logger';
import { ApplicationConfig, EventPostTransactionData, ForgingStatus, RegisteredModule, RegisteredSchema, UpdateForgingStatusInput } from '../types';
import { InMemoryChannel } from '../controller/channels';
import { BaseModule } from '../modules';
import { Bus } from '../controller/bus';
export declare type NodeOptions = Omit<ApplicationConfig, 'plugins'>;
interface NodeConstructor {
    readonly genesisBlockJSON: Record<string, unknown>;
    readonly options: NodeOptions;
}
interface NodeInitInput {
    readonly logger: Logger;
    readonly channel: InMemoryChannel;
    readonly forgerDB: KVStore;
    readonly blockchainDB: KVStore;
    readonly nodeDB: KVStore;
    readonly bus: Bus;
}
interface ForgingStatusResponse extends Omit<ForgingStatus, 'address'> {
    readonly address: string;
}
export declare class Node {
    private readonly _options;
    private readonly _registeredModules;
    private readonly _genesisBlockJSON;
    private _bus;
    private _channel;
    private _logger;
    private _nodeDB;
    private _forgerDB;
    private _blockchainDB;
    private _networkIdentifier;
    private _genesisBlock;
    private _registeredAccountSchemas;
    private _networkModule;
    private _chain;
    private _bft;
    private _processor;
    private _synchronizer;
    private _transactionPool;
    private _transport;
    private _forger;
    private _forgingJob;
    constructor({ options, genesisBlockJSON }: NodeConstructor);
    getSchema(): RegisteredSchema;
    getDefaultAccount(): Record<string, unknown>;
    getRegisteredModules(): RegisteredModule[];
    registerModule(customModule: BaseModule): void;
    init({ bus, channel, blockchainDB, forgerDB, logger, nodeDB, }: NodeInitInput): Promise<void>;
    get networkIdentifier(): Buffer;
    get actions(): {
        getValidators: () => Promise<readonly {
            address: string;
            nextForgingTime: number;
            minActiveHeight: number;
            isConsensusParticipant: boolean;
        }[]>;
        updateForgingStatus: (params: UpdateForgingStatusInput) => Promise<ForgingStatusResponse>;
        getAccount: (params: {
            address: string;
        }) => Promise<string>;
        getAccounts: (params: {
            address: readonly string[];
        }) => Promise<readonly string[]>;
        getBlockByID: (params: {
            id: string;
        }) => Promise<string | undefined>;
        getBlocksByIDs: (params: {
            ids: readonly string[];
        }) => Promise<readonly string[]>;
        getBlockByHeight: (params: {
            height: number;
        }) => Promise<string | undefined>;
        getBlocksByHeightBetween: (params: {
            from: number;
            to: number;
        }) => Promise<readonly string[]>;
        getTransactionByID: (params: {
            id: string;
        }) => Promise<string>;
        getTransactionsByIDs: (params: {
            ids: readonly string[];
        }) => Promise<string[]>;
        getForgingStatus: () => Promise<ForgingStatusResponse[] | undefined>;
        getTransactionsFromPool: () => string[];
        postTransaction: (params: EventPostTransactionData) => Promise<handlePostTransactionReturn>;
        getLastBlock: () => string;
        getSchema: () => RegisteredSchema;
        getRegisteredModules: () => RegisteredModule[];
        getNodeInfo: () => {
            version: string;
            networkVersion: string;
            networkIdentifier: string;
            lastBlockID: string;
            height: number;
            finalizedHeight: number;
            syncing: boolean;
            unconfirmedTransactions: number;
            genesisConfig: {
                [x: string]: unknown;
                bftThreshold: number;
                communityIdentifier: string;
                blockTime: number;
                maxPayloadLength: number;
                rewards: {
                    milestones: string[];
                    offset: number;
                    distance: number;
                };
                minFeePerByte: number;
                baseFees: {
                    moduleID: number;
                    assetID: number;
                    baseFee: string;
                }[];
            };
            registeredModules: RegisteredModule[];
            network: {
                port: number;
                hostIp: string | undefined;
                seedPeers: {
                    ip: string;
                    port: number;
                }[];
                blacklistedIPs: string[] | undefined;
                fixedPeers: {
                    ip: string;
                    port: number;
                }[] | undefined;
                whitelistedPeers: {
                    ip: string;
                    port: number;
                }[] | undefined;
            };
        };
        getConnectedPeers: () => readonly import("@liskhq/lisk-p2p/dist-node/types").PeerInfo[];
        getDisconnectedPeers: () => readonly import("@liskhq/lisk-p2p/dist-node/types").PeerInfo[];
        getNetworkStats: () => import("@liskhq/lisk-p2p/dist-node/types").NetworkStats;
    };
    cleanup(): Promise<void>;
    private _initModules;
    private _startLoader;
    private _forgingTask;
    private _startForging;
    private _subscribeToEvents;
    private _unsubscribeToEvents;
}
export {};
