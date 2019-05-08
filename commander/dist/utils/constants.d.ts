export declare const COMMAND_TYPES: ReadonlyArray<string>;
export declare const PLURALS: {
	account: string;
	address: string;
	block: string;
	delegate: string;
	transaction: string;
};
export declare const QUERY_INPUT_MAP: {
	accounts: string;
	blocks: string;
	delegates: string;
	transactions: string;
};
export declare const CONFIG_VARIABLES: ReadonlyArray<string>;
export declare const API_PROTOCOLS: ReadonlyArray<string>;
export declare const NETHASHES: {
	readonly [key: string]: string;
};
export declare const SORT_FIELDS: ReadonlyArray<string>;
export declare enum NETWORK {
	MAINNET = 'mainnet',
	TESTNET = 'testnet',
	BETANET = 'betanet',
	ALPHANET = 'alphanet',
	DEVNET = 'devnet',
}
export declare const POSTGRES_PORT = 5432;
export declare const REDIS_PORT = 6380;
export declare const HTTP_PORTS: {
	mainnet: number;
	testnet: number;
	betanet: number;
	alphanet: number;
	devnet: number;
};
export declare const WS_PORTS: {
	mainnet: number;
	testnet: number;
	betanet: number;
	alphanet: number;
	devnet: number;
};
export declare enum OS {
	Darwin = 'MACOS',
	Linux = 'LINUX',
}
export declare const RELEASE_URL = 'https://downloads.lisk.io/lisk';
export declare const SNAPSHOT_URL =
	'https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz';
