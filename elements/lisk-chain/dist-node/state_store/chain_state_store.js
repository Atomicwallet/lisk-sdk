"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainStateStore = void 0;
const constants_1 = require("../data_access/constants");
class ChainStateStore {
    constructor(dataAccess, additionalInformation) {
        this._name = 'ChainState';
        this._dataAccess = dataAccess;
        this._lastBlockHeaders = additionalInformation.lastBlockHeaders;
        this._networkIdentifier = additionalInformation.networkIdentifier;
        this._lastBlockReward = additionalInformation.lastBlockReward;
        this._data = {};
        this._originalData = {};
        this._initialValue = {};
        this._updatedKeys = new Set();
        this._originalUpdatedKeys = new Set();
    }
    get networkIdentifier() {
        return this._networkIdentifier;
    }
    get lastBlockHeaders() {
        return this._lastBlockHeaders;
    }
    get lastBlockReward() {
        return this._lastBlockReward;
    }
    createSnapshot() {
        this._originalData = { ...this._data };
        this._originalUpdatedKeys = new Set(this._updatedKeys);
    }
    restoreSnapshot() {
        this._data = { ...this._originalData };
        this._updatedKeys = new Set(this._originalUpdatedKeys);
    }
    async get(key) {
        const value = this._data[key];
        if (value) {
            return value;
        }
        const dbValue = await this._dataAccess.getChainState(key);
        if (dbValue === undefined) {
            return dbValue;
        }
        this._initialValue[key] = dbValue;
        this._data[key] = dbValue;
        return this._data[key];
    }
    getOrDefault() {
        throw new Error(`getOrDefault cannot be called for ${this._name}`);
    }
    find() {
        throw new Error(`getOrDefault cannot be called for ${this._name}`);
    }
    async set(key, value) {
        this._data[key] = value;
        this._updatedKeys.add(key);
    }
    finalize(batch) {
        const stateDiff = { updated: [], created: [], deleted: [] };
        if (this._updatedKeys.size === 0) {
            return stateDiff;
        }
        for (const key of Array.from(this._updatedKeys)) {
            const dbKey = `${constants_1.DB_KEY_CHAIN_STATE}:${key}`;
            const updatedValue = this._data[key];
            batch.put(dbKey, updatedValue);
            const initialValue = this._initialValue[key];
            if (initialValue !== undefined && !initialValue.equals(updatedValue)) {
                stateDiff.updated.push({
                    key: dbKey,
                    value: initialValue,
                });
            }
            else if (initialValue === undefined) {
                stateDiff.created.push(dbKey);
            }
        }
        return stateDiff;
    }
}
exports.ChainStateStore = ChainStateStore;
//# sourceMappingURL=chain_state_store.js.map