/// <reference types="node" />
import { BatchChain } from '@liskhq/lisk-db';
import { DataAccess } from '../data_access';
import { StateDiff, Account, AccountDefaultProps } from '../types';
interface AdditionalInformation {
    readonly defaultAccount: Record<string, unknown>;
}
export declare class AccountStore {
    private _data;
    private _originalData;
    private _updatedKeys;
    private _deletedKeys;
    private _originalUpdatedKeys;
    private _originalDeletedKeys;
    private readonly _dataAccess;
    private readonly _defaultAccount;
    private readonly _initialAccountValue;
    constructor(dataAccess: DataAccess, additionalInformation: AdditionalInformation);
    createSnapshot(): void;
    restoreSnapshot(): void;
    get<T = AccountDefaultProps>(address: Buffer): Promise<Account<T>>;
    getOrDefault<T = AccountDefaultProps>(address: Buffer): Promise<Account<T>>;
    getUpdated<T = AccountDefaultProps>(): ReadonlyArray<Account<T>>;
    set<T = AccountDefaultProps>(address: Buffer, updatedElement: Account<T>): Promise<void>;
    del(address: Buffer): Promise<void>;
    finalize(batch: BatchChain): StateDiff;
    private _getAccountInstance;
}
export {};
