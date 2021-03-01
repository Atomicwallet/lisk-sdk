import { KVStore } from '@liskhq/lisk-db';
import { ForgerInfo, ForgetSyncInfo } from './types';
export declare const getDBInstance: (dataPath: string, dbName?: string) => Promise<KVStore>;
export declare const getForgerSyncInfo: (db: KVStore) => Promise<ForgetSyncInfo>;
export declare const setForgerSyncInfo: (db: KVStore, blockHeight: number) => Promise<void>;
export declare const setForgerInfo: (db: KVStore, forgerAddress: string, forgerInfo: ForgerInfo) => Promise<void>;
export declare const getForgerInfo: (db: KVStore, forgerAddress: string) => Promise<ForgerInfo>;
