/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { KVStore } from '@liskhq/lisk-db';
import { EventEmitter } from 'events';
import { DataAccess } from './data_access';
import { Slots } from './slots';
import { StateStore } from './state_store';
import { Block, BlockHeader, GenesisBlock, AccountSchema, Validator } from './types';
import { Transaction } from './transaction';
interface ChainConstructor {
    readonly db: KVStore;
    readonly genesisBlock: GenesisBlock;
    readonly accountSchemas: {
        [name: string]: AccountSchema;
    };
    readonly networkIdentifier: Buffer;
    readonly blockTime: number;
    readonly maxPayloadLength: number;
    readonly rewardDistance: number;
    readonly rewardOffset: number;
    readonly minFeePerByte: number;
    readonly baseFees: {
        readonly moduleID: number;
        readonly assetID: number;
        readonly baseFee: string;
    }[];
    readonly rewardMilestones: ReadonlyArray<bigint>;
    readonly minBlockHeaderCache?: number;
    readonly maxBlockHeaderCache?: number;
}
export declare class Chain {
    readonly dataAccess: DataAccess;
    readonly events: EventEmitter;
    readonly slots: Slots;
    readonly constants: {
        readonly blockTime: number;
        readonly maxPayloadLength: number;
        readonly rewardDistance: number;
        readonly rewardOffset: number;
        readonly rewardMilestones: ReadonlyArray<bigint>;
        readonly networkIdentifier: Buffer;
        readonly minFeePerByte: number;
        readonly baseFees: {
            readonly moduleID: number;
            readonly assetID: number;
            readonly baseFee: string;
        }[];
    };
    private _lastBlock;
    private readonly _networkIdentifier;
    private readonly _blockRewardArgs;
    private readonly _genesisBlock;
    private readonly _accountSchema;
    private readonly _blockAssetSchema;
    private readonly _defaultAccount;
    private _numberOfValidators;
    constructor({ db, genesisBlock, accountSchemas, blockTime, networkIdentifier, maxPayloadLength, rewardDistance, rewardOffset, rewardMilestones, minFeePerByte, baseFees, minBlockHeaderCache, maxBlockHeaderCache, }: ChainConstructor);
    get lastBlock(): Block;
    get numberOfValidators(): number;
    get genesisBlock(): GenesisBlock;
    get accountSchema(): Schema;
    get blockAssetSchema(): {
        [key: number]: Schema;
    };
    init(): Promise<void>;
    calculateDefaultReward(height: number): bigint;
    calculateExpectedReward(blockHeader: BlockHeader, stateStore: StateStore): bigint;
    resetBlockHeaderCache(): void;
    newStateStore(skipLastHeights?: number): Promise<StateStore>;
    genesisBlockExist(genesisBlock: GenesisBlock): Promise<boolean>;
    isValidSeedReveal(blockHeader: BlockHeader, stateStore: StateStore): boolean;
    validateGenesisBlockHeader(block: GenesisBlock): void;
    applyGenesisBlock(block: GenesisBlock, stateStore: StateStore): Promise<void>;
    validateTransaction(transaction: Transaction): void;
    validateBlockHeader(block: Block): void;
    verifyBlockHeader(block: Block, stateStore: StateStore): Promise<void>;
    saveBlock(block: Block, stateStore: StateStore, finalizedHeight: number, { removeFromTempTable }?: {
        removeFromTempTable: boolean;
    }): Promise<void>;
    removeBlock(block: Block, stateStore: StateStore, { saveTempBlock }?: {
        saveTempBlock: boolean;
    }): Promise<void>;
    getValidator(timestamp: number): Promise<Validator>;
    getValidators(): Promise<Validator[]>;
    setValidators(validators: {
        address: Buffer;
        isConsensusParticipant: boolean;
    }[], stateStore: StateStore, blockHeader: BlockHeader): Promise<void>;
    private _cacheBlockHeaders;
    private _getLastBootstrapHeight;
}
export {};
