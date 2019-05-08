import { NETWORK } from '../constants';
export declare type ProcessStatus = 'online' | 'stopping' | 'stopped' | 'launching' | 'errored' | 'one-launch-status';
export interface Pm2Env {
    readonly LISK_NETWORK: NETWORK;
    readonly LISK_DB_PORT: string;
    readonly LISK_REDIS_PORT: string;
    readonly LISK_WS_PORT: string;
    readonly LISK_HTTP_PORT: string;
    readonly pm_cwd: string;
    readonly pm_uptime: number;
    readonly status: ProcessStatus;
    readonly unstable_restarts: number;
    readonly version: string;
}
export declare type ReadableInstanceType = string | undefined | number;
interface InstanceIndex {
    readonly [key: string]: ReadableInstanceType;
}
interface Instance {
    readonly name: string | undefined;
    readonly pid: number | undefined;
    readonly status: ProcessStatus;
    readonly version: string;
    readonly network: NETWORK;
    readonly started_at: string;
    readonly cpu?: number;
    readonly memory?: number;
    readonly dbPort: string;
    readonly redisPort: string;
    readonly wsPort: string;
    readonly httpPort: string;
    readonly installationPath: string;
}
export declare type PM2ProcessInstance = Instance & InstanceIndex;
export declare const registerApplication: (installPath: string, network: NETWORK, name: string, envConfig: object) => Promise<void>;
export declare const unRegisterApplication: (name: string) => Promise<void>;
export declare const restartApplication: (name: string) => Promise<void>;
export declare const stopApplication: (name: string) => Promise<void>;
export declare const listApplication: () => Promise<ReadonlyArray<PM2ProcessInstance>>;
export declare const describeApplication: (name: string) => Promise<PM2ProcessInstance>;
export {};
