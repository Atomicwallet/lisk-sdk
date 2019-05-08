import { NETWORK } from '../constants';
export declare const isCacheRunning: (installDir: string, name: string) => Promise<boolean>;
export declare const startCache: (installDir: string, name: string) => Promise<string>;
export declare const stopCache: (installDir: string, network: NETWORK, name: string) => Promise<string>;
export declare const isCacheEnabled: (installDir: string, network: NETWORK) => Promise<boolean>;
