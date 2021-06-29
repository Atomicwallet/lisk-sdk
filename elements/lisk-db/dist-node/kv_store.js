"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KVStore = void 0;
const fs = require("fs");
const path = require("path");
const debug_1 = require("debug");
const levelup_1 = require("levelup");
const rocksdb_1 = require("rocksdb");
const errors_1 = require("./errors");
const logger = debug_1.debug('db');
class KVStore {
    constructor(filePath) {
        logger('opening file', { filePath });
        const parentDir = path.resolve(path.join(filePath, '../'));
        if (!fs.existsSync(parentDir)) {
            throw new Error(`${parentDir} does not exist`);
        }
        this._db = levelup_1.default(rocksdb_1.default(filePath));
    }
    async close() {
        await this._db.close();
    }
    async get(key) {
        logger('get', { key });
        try {
            const result = (await this._db.get(key));
            return result;
        }
        catch (error) {
            if (error.notFound) {
                throw new errors_1.NotFoundError(key);
            }
            throw error;
        }
    }
    async exists(key) {
        try {
            logger('exists', { key });
            await this._db.get(key);
            return true;
        }
        catch (error) {
            if (error.notFound) {
                return false;
            }
            throw error;
        }
    }
    async clear(options) {
        await this._db.clear(options);
    }
    async put(key, val) {
        logger('put', { key });
        await this._db.put(key, val);
    }
    async del(key) {
        logger('del', { key });
        await this._db.del(key);
    }
    createReadStream(options) {
        logger('readStream', { options });
        const updatedOption = options ? { ...options, keyAsBuffer: false } : { keyAsBuffer: false };
        return this._db.createReadStream(updatedOption);
    }
    batch() {
        return this._db.batch();
    }
}
exports.KVStore = KVStore;
//# sourceMappingURL=kv_store.js.map