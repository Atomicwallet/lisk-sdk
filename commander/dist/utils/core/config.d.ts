import { NETWORK } from '../constants';
interface AppConfig {
	readonly version: string;
	readonly minVersion: string;
	readonly protocolVersion: string;
}
interface StorageConfig {
	readonly database: string;
	readonly user: string;
	readonly password: string;
}
interface CacheConfig {
	readonly password: string;
	readonly enabled: boolean;
}
interface ComponentsConfig {
	readonly storage: StorageConfig;
	readonly cache: CacheConfig;
}
interface Config {
	readonly app: AppConfig;
	readonly components: ComponentsConfig;
}
export interface LiskConfig {
	readonly config: Config;
}
export declare const defaultLiskPath: string;
export declare const defaultLiskPm2Path: string;
export declare const defaultLiskInstancePath: string;
export declare const defaultBackupPath: string;
export declare const getLiskConfig: (
	installDir: string,
	network: NETWORK,
) => Promise<LiskConfig>;
export {};
