"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDB = exports.createDB = exports.getDBPath = exports.defaultAccountSchema = exports.waitUntilBlockHeight = exports.getModuleInstance = exports.getAccountSchemaFromModules = void 0;
const fs = require("fs-extra");
const lisk_db_1 = require("@liskhq/lisk-db");
const channel_mock_1 = require("./mocks/channel_mock");
const data_access_mock_1 = require("./mocks/data_access_mock");
const logger_mock_1 = require("./mocks/logger_mock");
const constants_1 = require("../constants");
const getAccountSchemaFromModules = (modules, genesisConfig) => {
    const accountSchemas = {};
    for (const Klass of modules) {
        const m = new Klass(genesisConfig !== null && genesisConfig !== void 0 ? genesisConfig : {});
        if (m.accountSchema) {
            accountSchemas[m.name] = { ...m.accountSchema, fieldNumber: m.id };
        }
    }
    return accountSchemas;
};
exports.getAccountSchemaFromModules = getAccountSchemaFromModules;
const getModuleInstance = (Module, opts) => {
    var _a, _b, _c, _d;
    const module = new Module((_a = opts === null || opts === void 0 ? void 0 : opts.genesisConfig) !== null && _a !== void 0 ? _a : {});
    module.init({
        channel: (_b = opts === null || opts === void 0 ? void 0 : opts.channel) !== null && _b !== void 0 ? _b : channel_mock_1.channelMock,
        logger: (_c = opts === null || opts === void 0 ? void 0 : opts.logger) !== null && _c !== void 0 ? _c : logger_mock_1.loggerMock,
        dataAccess: (_d = opts === null || opts === void 0 ? void 0 : opts.dataAccess) !== null && _d !== void 0 ? _d : new data_access_mock_1.DataAccessMock(),
    });
    return module;
};
exports.getModuleInstance = getModuleInstance;
const waitUntilBlockHeight = async ({ apiClient, height, timeout, }) => new Promise((resolve, reject) => {
    if (timeout) {
        setTimeout(() => {
            reject(new Error(`'waitUntilBlockHeight' timed out after ${timeout} ms`));
        }, timeout);
    }
    apiClient.subscribe(constants_1.APP_EVENT_BLOCK_NEW, data => {
        const { block } = data;
        const { header } = apiClient.block.decode(block);
        if (header.height >= height) {
            resolve();
        }
    });
});
exports.waitUntilBlockHeight = waitUntilBlockHeight;
exports.defaultAccountSchema = {
    token: {
        type: 'object',
        fieldNumber: 2,
        properties: {
            balance: {
                fieldNumber: 1,
                dataType: 'uint64',
            },
        },
        default: {
            balance: BigInt(0),
        },
    },
    sequence: {
        type: 'object',
        fieldNumber: 3,
        properties: {
            nonce: {
                fieldNumber: 1,
                dataType: 'uint64',
            },
        },
        default: {
            nonce: BigInt(0),
        },
    },
    keys: {
        type: 'object',
        fieldNumber: 4,
        properties: {
            numberOfSignatures: { dataType: 'uint32', fieldNumber: 1 },
            mandatoryKeys: {
                type: 'array',
                items: { dataType: 'bytes' },
                fieldNumber: 2,
            },
            optionalKeys: {
                type: 'array',
                items: { dataType: 'bytes' },
                fieldNumber: 3,
            },
        },
        default: {
            numberOfSignatures: 0,
            mandatoryKeys: [],
            optionalKeys: [],
        },
    },
    dpos: {
        type: 'object',
        fieldNumber: 5,
        properties: {
            delegate: {
                type: 'object',
                fieldNumber: 1,
                properties: {
                    username: { dataType: 'string', fieldNumber: 1 },
                    pomHeights: {
                        type: 'array',
                        items: { dataType: 'uint32' },
                        fieldNumber: 2,
                    },
                    consecutiveMissedBlocks: { dataType: 'uint32', fieldNumber: 3 },
                    lastForgedHeight: { dataType: 'uint32', fieldNumber: 4 },
                    isBanned: { dataType: 'boolean', fieldNumber: 5 },
                    totalVotesReceived: { dataType: 'uint64', fieldNumber: 6 },
                },
                required: [
                    'username',
                    'pomHeights',
                    'consecutiveMissedBlocks',
                    'lastForgedHeight',
                    'isBanned',
                    'totalVotesReceived',
                ],
            },
            sentVotes: {
                type: 'array',
                fieldNumber: 2,
                items: {
                    type: 'object',
                    properties: {
                        delegateAddress: {
                            dataType: 'bytes',
                            fieldNumber: 1,
                        },
                        amount: {
                            dataType: 'uint64',
                            fieldNumber: 2,
                        },
                    },
                    required: ['delegateAddress', 'amount'],
                },
            },
            unlocking: {
                type: 'array',
                fieldNumber: 3,
                items: {
                    type: 'object',
                    properties: {
                        delegateAddress: {
                            dataType: 'bytes',
                            fieldNumber: 1,
                        },
                        amount: {
                            dataType: 'uint64',
                            fieldNumber: 2,
                        },
                        unvoteHeight: {
                            dataType: 'uint32',
                            fieldNumber: 3,
                        },
                    },
                    required: ['delegateAddress', 'amount', 'unvoteHeight'],
                },
            },
        },
        default: {
            delegate: {
                username: '',
                pomHeights: [],
                consecutiveMissedBlocks: 0,
                lastForgedHeight: 0,
                isBanned: false,
                totalVotesReceived: BigInt(0),
            },
            sentVotes: [],
            unlocking: [],
        },
    },
};
const defaultDatabasePath = '/tmp/lisk-framework/test';
const getDBPath = (name, dbPath = defaultDatabasePath) => `${dbPath}/${name}.db`;
exports.getDBPath = getDBPath;
const createDB = (name, dbPath = defaultDatabasePath) => {
    fs.ensureDirSync(dbPath);
    const filePath = exports.getDBPath(name, dbPath);
    return new lisk_db_1.KVStore(filePath);
};
exports.createDB = createDB;
const removeDB = (dbPath = defaultDatabasePath) => ['forger', 'blockchain', 'node'].forEach(name => fs.removeSync(exports.getDBPath(name, dbPath)));
exports.removeDB = removeDB;
//# sourceMappingURL=utils.js.map