/// <reference types="node" />
import { BatchChain } from '@liskhq/lisk-db';
import { StateDiff } from '../types';
import { DataAccess } from '../data_access';
export declare class ConsensusStateStore {
    private readonly _name;
    private _data;
    private _originalData;
    private _updatedKeys;
    private _originalUpdatedKeys;
    private readonly _dataAccess;
    private _initialValue;
    constructor(dataAccess: DataAccess);
    createSnapshot(): void;
    restoreSnapshot(): void;
    get(key: string): Promise<Buffer | undefined>;
    getOrDefault(): void;
    find(): void;
    set(key: string, value: Buffer): Promise<void>;
    finalize(batch: BatchChain): StateDiff;
}
