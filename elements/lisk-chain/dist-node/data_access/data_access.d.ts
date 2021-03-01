/// <reference types="node" />
import { KVStore } from '@liskhq/lisk-db';
import { Schema } from '@liskhq/lisk-codec';
import { Transaction } from '../transaction';
import { BlockHeader, Block, Account, BlockHeaderAsset } from '../types';
import { StateStore } from '../state_store';
interface DAConstructor {
    readonly db: KVStore;
    readonly registeredBlockHeaders: {
        readonly [key: number]: Schema;
    };
    readonly accountSchema: Schema;
    readonly minBlockHeaderCache: number;
    readonly maxBlockHeaderCache: number;
}
export declare class DataAccess {
    private readonly _storage;
    private readonly _blocksCache;
    private readonly _accountSchema;
    private readonly _blockHeaderAdapter;
    constructor({ db, registeredBlockHeaders, accountSchema, minBlockHeaderCache, maxBlockHeaderCache, }: DAConstructor);
    addBlockHeader(blockHeader: BlockHeader): BlockHeader[];
    removeBlockHeader(id: Buffer): Promise<BlockHeader[]>;
    resetBlockHeaderCache(): void;
    getBlockHeaderAssetSchema(version: number): Schema;
    getBlockHeaderByID(id: Buffer): Promise<BlockHeader>;
    getBlockHeadersByIDs(arrayOfBlockIds: ReadonlyArray<Buffer>): Promise<BlockHeader[]>;
    getBlockHeaderByHeight(height: number): Promise<BlockHeader>;
    getBlockHeadersByHeightBetween(fromHeight: number, toHeight: number): Promise<BlockHeader[]>;
    getBlockHeadersWithHeights(heightList: ReadonlyArray<number>): Promise<BlockHeader[]>;
    getLastBlockHeader(): Promise<BlockHeader>;
    getHighestCommonBlockHeader(arrayOfBlockIds: ReadonlyArray<Buffer>): Promise<BlockHeader | undefined>;
    getBlockByID<T>(id: Buffer): Promise<Block<T>>;
    getBlocksByIDs(arrayOfBlockIds: ReadonlyArray<Buffer>): Promise<Block[]>;
    getBlockByHeight(height: number): Promise<Block>;
    getBlocksByHeightBetween(fromHeight: number, toHeight: number): Promise<Block[]>;
    getLastBlock(): Promise<Block>;
    isBlockPersisted(blockId: Buffer): Promise<boolean>;
    getTempBlocks(): Promise<Block[]>;
    isTempBlockEmpty(): Promise<boolean>;
    clearTempBlocks(): Promise<void>;
    getChainState(key: string): Promise<Buffer | undefined>;
    getConsensusState(key: string): Promise<Buffer | undefined>;
    getAccountsByPublicKey(arrayOfPublicKeys: ReadonlyArray<Buffer>): Promise<Account[]>;
    getAccountByAddress<T>(address: Buffer): Promise<Account<T>>;
    getEncodedAccountByAddress(address: Buffer): Promise<Buffer>;
    getAccountsByAddress<T>(arrayOfAddresses: ReadonlyArray<Buffer>): Promise<Account<T>[]>;
    getTransactionByID(id: Buffer): Promise<Transaction>;
    getTransactionsByIDs(arrayOfTransactionIds: ReadonlyArray<Buffer>): Promise<Transaction[]>;
    isTransactionPersisted(transactionId: Buffer): Promise<boolean>;
    decode<T = BlockHeaderAsset>(buffer: Buffer): Block<T>;
    encode(block: Block<unknown>): Buffer;
    decodeBlockHeader<T = BlockHeaderAsset>(buffer: Buffer): BlockHeader<T>;
    encodeBlockHeader<T = BlockHeaderAsset>(blockHeader: BlockHeader<T>, skipSignature?: boolean): Buffer;
    decodeAccount<T>(buffer: Buffer): Account<T>;
    encodeAccount<T>(account: Account<T>): Buffer;
    decodeTransaction(buffer: Buffer): Transaction;
    encodeTransaction(tx: Transaction): Buffer;
    saveBlock(block: Block, stateStore: StateStore, finalizedHeight: number, removeFromTemp?: boolean): Promise<void>;
    deleteBlock(block: Block, stateStore: StateStore, saveToTemp?: boolean): Promise<Account[]>;
    private _decodeRawBlock;
}
export {};
