"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusStateStore = void 0;
const constants_1 = require("../data_access/constants");
const constants_2 = require("../constants");
class ConsensusStateStore {
    constructor(dataAccess) {
        this._name = 'ConsensusState';
        this._dataAccess = dataAccess;
        this._data = {};
        this._originalData = {};
        this._initialValue = {};
        this._updatedKeys = new Set();
        this._originalUpdatedKeys = new Set();
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
        const dbValue = await this._dataAccess.getConsensusState(key);
        if (dbValue === undefined) {
            return dbValue;
        }
        if (key !== constants_2.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY) {
            this._initialValue[key] = dbValue;
        }
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
            const dbKey = `${constants_1.DB_KEY_CONSENSUS_STATE}:${key}`;
            const updatedValue = this._data[key];
            batch.put(dbKey, updatedValue);
            if (key === constants_2.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY) {
                continue;
            }
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
exports.ConsensusStateStore = ConsensusStateStore;
//# sourceMappingURL=consensus_state_store.js.map