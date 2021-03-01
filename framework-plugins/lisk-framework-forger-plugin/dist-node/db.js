"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const os = require("os");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const constants_1 = require("./constants");
const schema_1 = require("./schema");
const debug = createDebug('plugin:forger:db');
exports.getDBInstance = async (dataPath, dbName = 'lisk-framework-forger-plugin.db') => {
    const dirPath = path_1.join(dataPath.replace('~', os.homedir()), 'plugins/data', dbName);
    await fs_extra_1.ensureDir(dirPath);
    return new lisk_db_1.KVStore(dirPath);
};
exports.getForgerSyncInfo = async (db) => {
    try {
        const encodedSyncInfo = await db.get(constants_1.DB_KEY_FORGER_SYNC_INFO);
        return lisk_codec_1.codec.decode(schema_1.forgerSyncSchema, encodedSyncInfo);
    }
    catch (error) {
        debug('Forger sync info does not exists');
        return {
            syncUptoHeight: 0,
        };
    }
};
exports.setForgerSyncInfo = async (db, blockHeight) => {
    const encodedSyncInfo = lisk_codec_1.codec.encode(schema_1.forgerSyncSchema, { syncUptoHeight: blockHeight });
    await db.put(constants_1.DB_KEY_FORGER_SYNC_INFO, encodedSyncInfo);
};
exports.setForgerInfo = async (db, forgerAddress, forgerInfo) => {
    const encodedForgerInfo = lisk_codec_1.codec.encode(schema_1.forgerInfoSchema, forgerInfo);
    await db.put(`${constants_1.DB_KEY_FORGER_INFO}:${forgerAddress}`, encodedForgerInfo);
};
exports.getForgerInfo = async (db, forgerAddress) => {
    let forgerInfo;
    try {
        forgerInfo = await db.get(`${constants_1.DB_KEY_FORGER_INFO}:${forgerAddress}`);
    }
    catch (error) {
        debug(`Forger info does not exists for delegate: ${forgerAddress}`);
        return {
            totalProducedBlocks: 0,
            totalReceivedFees: BigInt(0),
            totalReceivedRewards: BigInt(0),
            votesReceived: [],
        };
    }
    return lisk_codec_1.codec.decode(schema_1.forgerInfoSchema, forgerInfo);
};
//# sourceMappingURL=db.js.map