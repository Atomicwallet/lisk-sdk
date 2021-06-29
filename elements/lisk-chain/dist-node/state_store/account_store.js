"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStore = void 0;
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("../data_access/constants");
const utils_1 = require("../utils");
class AccountStore {
    constructor(dataAccess, additionalInformation) {
        this._dataAccess = dataAccess;
        this._data = new lisk_utils_1.dataStructures.BufferMap();
        this._updatedKeys = new lisk_utils_1.dataStructures.BufferSet();
        this._deletedKeys = new lisk_utils_1.dataStructures.BufferSet();
        this._originalData = new lisk_utils_1.dataStructures.BufferMap();
        this._originalUpdatedKeys = new lisk_utils_1.dataStructures.BufferSet();
        this._originalDeletedKeys = new lisk_utils_1.dataStructures.BufferSet();
        this._defaultAccount = additionalInformation.defaultAccount;
        this._initialAccountValue = new lisk_utils_1.dataStructures.BufferMap();
    }
    createSnapshot() {
        this._originalData = this._data.clone();
        this._originalUpdatedKeys = this._updatedKeys.clone();
        this._originalDeletedKeys = this._deletedKeys.clone();
    }
    restoreSnapshot() {
        this._data = this._originalData;
        this._updatedKeys = this._originalUpdatedKeys;
        this._deletedKeys = this._originalDeletedKeys;
        this._originalData = new lisk_utils_1.dataStructures.BufferMap();
        this._originalUpdatedKeys = new lisk_utils_1.dataStructures.BufferSet();
        this._originalDeletedKeys = new lisk_utils_1.dataStructures.BufferSet();
    }
    async get(address) {
        const cachedAccount = this._data.get(address);
        if (cachedAccount) {
            return lisk_utils_1.objects.cloneDeep(cachedAccount);
        }
        if (this._deletedKeys.has(address)) {
            throw new lisk_db_1.NotFoundError(`Account ${address.toString('hex')} has been deleted`);
        }
        const encodedAccount = await this._dataAccess.getEncodedAccountByAddress(address);
        const account = this._getAccountInstance(encodedAccount);
        this._data.set(address, account);
        this._initialAccountValue.set(address, encodedAccount);
        return account;
    }
    async getOrDefault(address) {
        const cachedAccount = this._data.get(address);
        if (cachedAccount) {
            return lisk_utils_1.objects.cloneDeep(cachedAccount);
        }
        try {
            const encodedAccount = await this._dataAccess.getEncodedAccountByAddress(address);
            const account = this._getAccountInstance(encodedAccount);
            this._data.set(address, account);
            this._initialAccountValue.set(address, encodedAccount);
            return account;
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                throw error;
            }
        }
        const defaultAccount = {
            address,
            ...lisk_utils_1.objects.cloneDeep(this._defaultAccount),
        };
        this._data.set(address, defaultAccount);
        return defaultAccount;
    }
    getUpdated() {
        return [...this._data.values()];
    }
    async set(address, updatedElement) {
        this._data.set(address, updatedElement);
        this._updatedKeys.add(address);
        this._deletedKeys.delete(address);
    }
    async del(address) {
        await this.get(address);
        const initialAccount = this._initialAccountValue.get(address);
        if (initialAccount !== undefined) {
            this._deletedKeys.add(address);
        }
        this._updatedKeys.delete(address);
        this._data.delete(address);
    }
    finalize(batch) {
        const stateDiff = { updated: [], created: [], deleted: [] };
        for (const updatedAccount of this._data.values()) {
            if (this._updatedKeys.has(updatedAccount.address)) {
                const encodedAccount = this._dataAccess.encodeAccount(updatedAccount);
                const dbKey = `${constants_1.DB_KEY_ACCOUNTS_ADDRESS}:${utils_1.keyString(updatedAccount.address)}`;
                batch.put(dbKey, encodedAccount);
                const initialAccount = this._initialAccountValue.get(updatedAccount.address);
                if (initialAccount !== undefined && !initialAccount.equals(encodedAccount)) {
                    stateDiff.updated.push({
                        key: dbKey,
                        value: initialAccount,
                    });
                }
                else if (initialAccount === undefined) {
                    stateDiff.created.push(dbKey);
                }
            }
        }
        for (const deletedAddress of this._deletedKeys) {
            const initialAccount = this._initialAccountValue.get(deletedAddress);
            if (!initialAccount) {
                throw new Error('Deleting account should have initial account');
            }
            const dbKey = `${constants_1.DB_KEY_ACCOUNTS_ADDRESS}:${utils_1.keyString(deletedAddress)}`;
            batch.del(dbKey);
            stateDiff.deleted.push({
                key: dbKey,
                value: initialAccount,
            });
        }
        return stateDiff;
    }
    _getAccountInstance(encodedAccount) {
        const decodedAccount = this._dataAccess.decodeAccount(encodedAccount);
        return lisk_utils_1.objects.cloneDeep(decodedAccount);
    }
}
exports.AccountStore = AccountStore;
//# sourceMappingURL=account_store.js.map