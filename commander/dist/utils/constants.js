"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lisk_constants_1 = require("@liskhq/lisk-constants");
exports.COMMAND_TYPES = [
    'accounts',
    'addresses',
    'blocks',
    'delegates',
    'transactions',
];
exports.PLURALS = {
    account: 'accounts',
    address: 'addresses',
    block: 'blocks',
    delegate: 'delegates',
    transaction: 'transactions',
};
exports.QUERY_INPUT_MAP = {
    accounts: 'address',
    blocks: 'blockId',
    delegates: 'username',
    transactions: 'id',
};
exports.CONFIG_VARIABLES = [
    'api.nodes',
    'api.network',
    'json',
    'pretty',
];
exports.API_PROTOCOLS = ['http:', 'https:'];
exports.NETHASHES = {
    main: lisk_constants_1.MAINNET_NETHASH,
    test: lisk_constants_1.TESTNET_NETHASH,
};
exports.SORT_FIELDS = [
    'publicKey:asc',
    'publicKey:desc',
    'balance:asc',
    'balance:desc',
    'username:asc',
    'username:desc',
];
var NETWORK;
(function (NETWORK) {
    NETWORK["MAINNET"] = "mainnet";
    NETWORK["TESTNET"] = "testnet";
    NETWORK["BETANET"] = "betanet";
    NETWORK["ALPHANET"] = "alphanet";
    NETWORK["DEVNET"] = "devnet";
})(NETWORK = exports.NETWORK || (exports.NETWORK = {}));
exports.POSTGRES_PORT = 5432;
exports.REDIS_PORT = 6380;
exports.HTTP_PORTS = {
    mainnet: 8000,
    testnet: 7000,
    betanet: 6000,
    alphanet: 5000,
    devnet: 4000,
};
exports.WS_PORTS = {
    mainnet: 8001,
    testnet: 7001,
    betanet: 6001,
    alphanet: 5001,
    devnet: 4001,
};
var OS;
(function (OS) {
    OS["Darwin"] = "MACOS";
    OS["Linux"] = "LINUX";
})(OS = exports.OS || (exports.OS = {}));
exports.RELEASE_URL = 'https://downloads.lisk.io/lisk';
exports.SNAPSHOT_URL = 'https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz';
//# sourceMappingURL=constants.js.map