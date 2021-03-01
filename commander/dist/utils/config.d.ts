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
    rpc: {
        enable: boolean;
        mode: string;
        port: number;
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
        delegates: never[];
    };
    network: {
        seedPeers: {
            ip: string;
            port: number;
        }[];
        port: number;
    };
    transactionPool: {
        maxTransactions: number;
        maxTransactionsPerAccount: number;
        transactionExpiryTime: number;
        minEntranceFeePriority: string;
        minReplacementFeeDifference: string;
    };
    plugins: {};
};
