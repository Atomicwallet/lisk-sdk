/// <reference types="node" />
import { BatchChain } from '@liskhq/lisk-db';
import { DataAccess } from '../data_access';
import { BlockHeader, StateDiff } from '../types';
interface AdditionalInformation {
    readonly lastBlockHeaders: ReadonlyArray<BlockHeader>;
    readonly networkIdentifier: Buffer;
    readonly lastBlockReward: bigint;
}
export declare class ChainStateStore {
    private readonly _name;
    private _data;
    private _originalData;
    private _updatedKeys;
    private _originalUpdatedKeys;
    private readonly _dataAccess;
    private readonly _lastBlockHeaders;
    private readonly _networkIdentifier;
    private readonly _lastBlockReward;
    private readonly _initialValue;
    constructor(dataAccess: DataAccess, additionalInformation: AdditionalInformation);
    get networkIdentifier(): Buffer;
    get lastBlockHeaders(): ReadonlyArray<BlockHeader>;
    get lastBlockReward(): bigint;
    createSnapshot(): void;
    restoreSnapshot(): void;
    get(key: string): Promise<Buffer | undefined>;
    getOrDefault(): void;
    find(): void;
    set(key: string, value: Buffer): Promise<void>;
    finalize(batch: BatchChain): StateDiff;
}
export {};
