import { NETWORK } from '../constants';
export declare const initDB: (installDir: string) => Promise<string>;
export declare const startDatabase: (installDir: string, name: string) => Promise<string>;
export declare const createUser: (installDir: string, network: NETWORK, name: string) => Promise<string>;
export declare const createDatabase: (installDir: string, network: NETWORK, name: string) => Promise<string>;
export declare const stopDatabase: (installDir: string, name: string) => Promise<string>;
export declare const restoreSnapshot: (installDir: string, network: NETWORK, snapshotFilePath: string, name: string) => Promise<string>;
