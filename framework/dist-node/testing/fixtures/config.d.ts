/// <reference types="node" />
export declare const defaultPassword = "elephant tree paris dragon chair galaxy";
export declare const defaultConfig: {
    label: string;
    version: string;
    networkVersion: string;
    rootPath: string;
    logger: {
        fileLogLevel: string;
        consoleLogLevel: string;
        logFileName: string;
    };
    genesisConfig: {
        blockTime: number;
        communityIdentifier: string;
        maxPayloadLength: number;
        bftThreshold: number;
        minFeePerByte: number;
        baseFees: {
            moduleID: number;
            assetID: number;
            baseFee: string;
        }[];
        rewards: {
            milestones: string[];
            offset: number;
            distance: number;
        };
        minRemainingBalance: string;
        activeDelegates: number;
        standbyDelegates: number;
        delegateListRoundOffset: number;
    };
    forging: {
        force: boolean;
        waitThreshold: number;
        delegates: {
            encryptedPassphrase: string;
            hashOnion: {
                count: number;
                distance: number;
                hashes: string[];
            };
            address: string;
        }[];
        defaultPassword: string;
    };
    network: {
        seedPeers: {
            ip: string;
            port: number;
        }[];
        port: number;
        maxInboundConnection: number;
    };
    transactionPool: {
        maxTransactions: number;
        maxTransactionsPerAccount: number;
        transactionExpiryTime: number;
        minEntranceFeePriority: string;
        minReplacementFeeDifference: string;
    };
    plugins: {};
    rpc: {
        enable: boolean;
        port: number;
        mode: string;
    };
};
export declare const getPassphraseFromDefaultConfig: (address: Buffer) => string;
export declare const getHashOnionFromDefaultConfig: (address: Buffer, count: number) => Buffer;
