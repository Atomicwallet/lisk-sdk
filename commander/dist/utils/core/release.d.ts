import { NETWORK } from '../constants';
export declare const getLatestVersion: (url: string) => Promise<string>;
export interface ReleaseInfo {
	readonly liskTarSHA256Url: string;
	readonly liskTarUrl: string;
	readonly version: string;
}
export declare const getReleaseInfo: (
	releaseUrl: string,
	network?: NETWORK,
	installVersion?: string,
) => Promise<ReleaseInfo>;
