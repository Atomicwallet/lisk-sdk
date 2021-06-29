"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    label: 'beta-sdk-app',
    version: '0.0.0',
    networkVersion: '1.0',
    rootPath: '~/.lisk',
    logger: {
        fileLogLevel: 'info',
        consoleLogLevel: 'info',
        logFileName: 'lisk.log',
    },
    rpc: {
        enable: false,
        mode: 'ipc',
        port: 8080,
    },
    genesisConfig: {
        blockTime: 10,
        communityIdentifier: 'sdk',
        maxPayloadLength: 15 * 1024,
        bftThreshold: 68,
        minFeePerByte: 1000,
        baseFees: [
            {
                moduleID: 5,
                assetID: 0,
                baseFee: '1000000000',
            },
        ],
        rewards: {
            milestones: [
                '500000000',
                '400000000',
                '300000000',
                '200000000',
                '100000000',
            ],
            offset: 2160,
            distance: 3000000,
        },
        minRemainingBalance: '5000000',
        activeDelegates: 101,
        standbyDelegates: 2,
        delegateListRoundOffset: 2,
    },
    forging: {
        force: false,
        waitThreshold: 2,
        delegates: [],
    },
    network: {
        seedPeers: [
            {
                ip: '127.0.0.1',
                port: 5000,
            },
        ],
        port: 5000,
    },
    transactionPool: {
        maxTransactions: 4096,
        maxTransactionsPerAccount: 64,
        transactionExpiryTime: 3 * 60 * 60 * 1000,
        minEntranceFeePriority: '0',
        minReplacementFeeDifference: '10',
    },
    plugins: {},
};
//# sourceMappingURL=config.js.map