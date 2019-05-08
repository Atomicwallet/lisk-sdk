import { NETWORK } from '../constants';
export declare const liskInstall: (installPath: string) => string;
export declare const installDirectory: (
	installPath: string,
	name: string,
) => string;
export declare const liskVersion: (version: string) => string;
export declare const liskTar: (version: string) => string;
export declare const liskTarSHA256: (version: string) => string;
export declare const liskLatestUrl: (url: string, network: NETWORK) => string;
export declare const liskSnapshotUrl: (url: string, network: NETWORK) => string;
export declare const logsDir: (installPath: string) => string;
export declare const SH_LOG_FILE = 'logs/lisk.out';
export declare const validateNotARootUser: () => void;
export declare const isSupportedOS: () => boolean;
export declare const validateNetwork: (network: NETWORK) => void;
export declare const createDirectory: (dirPath: string) => void;
export declare const validURL: (url: string) => void;
export declare const getVersionToInstall: (
	network: NETWORK,
	version?: string,
) => Promise<string>;
export declare const backupLisk: (installDir: string) => Promise<void>;
export declare const upgradeLisk: (
	installDir: string,
	name: string,
	network: NETWORK,
	currentVersion: string,
) => Promise<void>;
export declare const validateVersion: (
	network: NETWORK,
	version: string,
) => Promise<void>;
export declare const getSemver: (str: string) => string;
export declare const dateDiff: (date1: Date, date2: Date) => number;
interface FileInfo {
	readonly fileName: string;
	readonly fileDir: string;
	readonly filePath: string;
}
export declare const getDownloadedFileInfo: (
	url: string,
	cacheDir: string,
) => FileInfo;
export declare const generateEnvConfig: (network: NETWORK) => Promise<object>;
export {};
