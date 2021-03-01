/// <reference types="node" />
import { KVStore } from '@liskhq/lisk-db';
import { RawBlock, StateDiff } from '../types';
import { StateStore } from '../state_store';
export declare class Storage {
    private readonly _db;
    constructor(db: KVStore);
    getBlockHeaderByID(id: Buffer): Promise<Buffer>;
    getBlockHeadersByIDs(arrayOfBlockIds: ReadonlyArray<Buffer>): Promise<Buffer[]>;
    getBlockHeaderByHeight(height: number): Promise<Buffer>;
    getBlockHeadersByHeightBetween(fromHeight: number, toHeight: number): Promise<Buffer[]>;
    getBlockHeadersWithHeights(heightList: ReadonlyArray<number>): Promise<Buffer[]>;
    getLastBlockHeader(): Promise<Buffer>;
    getBlockByID(id: Buffer): Promise<RawBlock>;
    getBlocksByIDs(arrayOfBlockIds: ReadonlyArray<Buffer>): Promise<RawBlock[]>;
    getBlockByHeight(height: number): Promise<RawBlock>;
    getBlocksByHeightBetween(fromHeight: number, toHeight: number): Promise<RawBlock[]>;
    getLastBlock(): Promise<RawBlock>;
    getTempBlocks(): Promise<Buffer[]>;
    isTempBlockEmpty(): Promise<boolean>;
    clearTempBlocks(): Promise<void>;
    isBlockPersisted(blockID: Buffer): Promise<boolean>;
    getChainState(key: string): Promise<Buffer | undefined>;
    getConsensusState(key: string): Promise<Buffer | undefined>;
    getAccountByAddress(address: Buffer): Promise<Buffer>;
    getAccountsByPublicKey(arrayOfPublicKeys: ReadonlyArray<Buffer>): Promise<Buffer[]>;
    getAccountsByAddress(arrayOfAddresses: ReadonlyArray<Buffer>): Promise<Buffer[]>;
    getTransactionByID(id: Buffer): Promise<Buffer>;
    getTransactionsByIDs(arrayOfTransactionIds: ReadonlyArray<Buffer>): Promise<Buffer[]>;
    isTransactionPersisted(transactionId: Buffer): Promise<boolean>;
    saveBlock(id: Buffer, height: number, finalizedHeight: number, header: Buffer, payload: {
        id: Buffer;
        value: Buffer;
    }[], stateStore: StateStore, removeFromTemp?: boolean): Promise<void>;
    deleteBlock(id: Buffer, height: number, txIDs: Buffer[], fullBlock: Buffer, stateStore: StateStore, saveToTemp?: boolean): Promise<StateDiff>;
    private _cleanUntil;
    private _getTransactions;
}
