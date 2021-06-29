"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const lisk_db_1 = ("../../lisk-db");
const lisk_codec_1 = ("../../lisk-codec");
const lisk_cryptography_1 = ("../../lisk-cryptography");
const constants_1 = require("./constants");
const utils_1 = require("../utils");
const schema_1 = require("../schema");
class Storage {
    constructor(db) {
        this._db = db;
    }
    async getBlockHeaderByID(id) {
        const block = await this._db.get(`${constants_1.DB_KEY_BLOCKS_ID}:${utils_1.keyString(id)}`);
        return block;
    }
    async getBlockHeadersByIDs(arrayOfBlockIds) {
        const blocks = [];
        for (const id of arrayOfBlockIds) {
            try {
                const block = await this._db.get(`${constants_1.DB_KEY_BLOCKS_ID}:${utils_1.keyString(id)}`);
                blocks.push(block);
            }
            catch (dbError) {
                if (dbError instanceof lisk_db_1.NotFoundError) {
                    continue;
                }
                throw dbError;
            }
        }
        return blocks;
    }
    async getBlockHeaderByHeight(height) {
        const stringHeight = lisk_db_1.formatInt(height);
        const id = await this._db.get(`${constants_1.DB_KEY_BLOCKS_HEIGHT}:${stringHeight}`);
        return this.getBlockHeaderByID(id);
    }
    async getBlockHeadersByHeightBetween(fromHeight, toHeight) {
        const stream = this._db.createReadStream({
            gte: `${constants_1.DB_KEY_BLOCKS_HEIGHT}:${lisk_db_1.formatInt(fromHeight)}`,
            lte: `${constants_1.DB_KEY_BLOCKS_HEIGHT}:${lisk_db_1.formatInt(toHeight)}`,
            reverse: true,
        });
        const blockIDs = await new Promise((resolve, reject) => {
            const ids = [];
            stream
                .on('data', ({ value }) => {
                ids.push(value);
            })
                .on('error', error => {
                reject(error);
            })
                .on('end', () => {
                resolve(ids);
            });
        });
        return this.getBlockHeadersByIDs(blockIDs);
    }
    async getBlockHeadersWithHeights(heightList) {
        const blocks = [];
        for (const height of heightList) {
            try {
                const block = await this.getBlockHeaderByHeight(height);
                blocks.push(block);
            }
            catch (dbError) {
                if (dbError instanceof lisk_db_1.NotFoundError) {
                    continue;
                }
                throw dbError;
            }
        }
        return blocks;
    }
    async getLastBlockHeader() {
        const stream = this._db.createReadStream({
            gte: lisk_db_1.getFirstPrefix(constants_1.DB_KEY_BLOCKS_HEIGHT),
            lte: lisk_db_1.getLastPrefix(constants_1.DB_KEY_BLOCKS_HEIGHT),
            reverse: true,
            limit: 1,
        });
        const [blockID] = await new Promise((resolve, reject) => {
            const ids = [];
            stream
                .on('data', ({ value }) => {
                ids.push(value);
            })
                .on('error', error => {
                reject(error);
            })
                .on('end', () => {
                resolve(ids);
            });
        });
        if (!blockID) {
            throw new lisk_db_1.NotFoundError('Last block header not found');
        }
        return this.getBlockHeaderByID(blockID);
    }
    async getBlockByID(id) {
        const blockHeader = await this.getBlockHeaderByID(id);
        const transactions = await this._getTransactions(id);
        return {
            header: blockHeader,
            payload: transactions,
        };
    }
    async getBlocksByIDs(arrayOfBlockIds) {
        const blocks = [];
        for (const id of arrayOfBlockIds) {
            try {
                const block = await this.getBlockByID(id);
                blocks.push(block);
            }
            catch (dbError) {
                if (dbError instanceof lisk_db_1.NotFoundError) {
                    continue;
                }
                throw dbError;
            }
        }
        return blocks;
    }
    async getBlockByHeight(height) {
        const header = await this.getBlockHeaderByHeight(height);
        const blockID = lisk_cryptography_1.hash(header);
        const transactions = await this._getTransactions(blockID);
        return {
            header,
            payload: transactions,
        };
    }
    async getBlocksByHeightBetween(fromHeight, toHeight) {
        const headers = await this.getBlockHeadersByHeightBetween(fromHeight, toHeight);
        const blocks = [];
        for (const header of headers) {
            const blockID = lisk_cryptography_1.hash(header);
            const transactions = await this._getTransactions(blockID);
            blocks.push({ header, payload: transactions });
        }
        return blocks;
    }
    async getLastBlock() {
        const header = await this.getLastBlockHeader();
        const blockID = lisk_cryptography_1.hash(header);
        const transactions = await this._getTransactions(blockID);
        return {
            header,
            payload: transactions,
        };
    }
    async getTempBlocks() {
        const stream = this._db.createReadStream({
            gte: lisk_db_1.getFirstPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
            lte: lisk_db_1.getLastPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
            reverse: true,
        });
        const tempBlocks = await new Promise((resolve, reject) => {
            const blocks = [];
            stream
                .on('data', ({ value }) => {
                blocks.push(value);
            })
                .on('error', error => {
                reject(error);
            })
                .on('end', () => {
                resolve(blocks);
            });
        });
        return tempBlocks;
    }
    async isTempBlockEmpty() {
        const stream = this._db.createReadStream({
            gte: lisk_db_1.getFirstPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
            lte: lisk_db_1.getLastPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
            limit: 1,
        });
        const tempBlocks = await new Promise((resolve, reject) => {
            const blocks = [];
            stream
                .on('data', ({ value }) => {
                blocks.push(value);
            })
                .on('error', error => {
                reject(error);
            })
                .on('end', () => {
                resolve(blocks);
            });
        });
        return tempBlocks.length === 0;
    }
    async clearTempBlocks() {
        await this._db.clear({
            gte: lisk_db_1.getFirstPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
            lte: lisk_db_1.getLastPrefix(constants_1.DB_KEY_TEMPBLOCKS_HEIGHT),
        });
    }
    async isBlockPersisted(blockID) {
        return this._db.exists(`${constants_1.DB_KEY_BLOCKS_ID}:${utils_1.keyString(blockID)}`);
    }
    async getChainState(key) {
        try {
            const value = await this._db.get(`${constants_1.DB_KEY_CHAIN_STATE}:${key}`);
            return value;
        }
        catch (error) {
            if (error instanceof lisk_db_1.NotFoundError) {
                return undefined;
            }
            throw error;
        }
    }
    async getConsensusState(key) {
        try {
            const value = await this._db.get(`${constants_1.DB_KEY_CONSENSUS_STATE}:${key}`);
            return value;
        }
        catch (error) {
            if (error instanceof lisk_db_1.NotFoundError) {
                return undefined;
            }
            throw error;
        }
    }
    async getAccountByAddress(address) {
        const account = await this._db.get(`${constants_1.DB_KEY_ACCOUNTS_ADDRESS}:${utils_1.keyString(address)}`);
        return account;
    }
    async getAccountsByPublicKey(arrayOfPublicKeys) {
        const addresses = arrayOfPublicKeys.map(lisk_cryptography_1.getAddressFromPublicKey);
        return this.getAccountsByAddress(addresses);
    }
    async getAccountsByAddress(arrayOfAddresses) {
        const accounts = [];
        for (const address of arrayOfAddresses) {
            try {
                const account = await this.getAccountByAddress(address);
                accounts.push(account);
            }
            catch (dbError) {
                if (dbError instanceof lisk_db_1.NotFoundError) {
                    continue;
                }
                throw dbError;
            }
        }
        return accounts;
    }
    async getTransactionByID(id) {
        const transaction = await this._db.get(`${constants_1.DB_KEY_TRANSACTIONS_ID}:${utils_1.keyString(id)}`);
        return transaction;
    }
    async getTransactionsByIDs(arrayOfTransactionIds) {
        const transactions = [];
        for (const id of arrayOfTransactionIds) {
            try {
                const transaction = await this.getTransactionByID(id);
                transactions.push(transaction);
            }
            catch (dbError) {
                if (dbError instanceof lisk_db_1.NotFoundError) {
                    continue;
                }
                throw dbError;
            }
        }
        return transactions;
    }
    async isTransactionPersisted(transactionId) {
        return this._db.exists(`${constants_1.DB_KEY_TRANSACTIONS_ID}:${utils_1.keyString(transactionId)}`);
    }
    async saveBlock(id, height, finalizedHeight, header, payload, stateStore, removeFromTemp = false) {
        const heightStr = lisk_db_1.formatInt(height);
        const batch = this._db.batch();
        batch.put(`${constants_1.DB_KEY_BLOCKS_ID}:${utils_1.keyString(id)}`, header);
        batch.put(`${constants_1.DB_KEY_BLOCKS_HEIGHT}:${heightStr}`, id);
        if (payload.length > 0) {
            const ids = [];
            for (const { id: txID, value } of payload) {
                ids.push(txID);
                batch.put(`${constants_1.DB_KEY_TRANSACTIONS_ID}:${utils_1.keyString(txID)}`, value);
            }
            batch.put(`${constants_1.DB_KEY_TRANSACTIONS_BLOCK_ID}:${utils_1.keyString(id)}`, Buffer.concat(ids));
        }
        if (removeFromTemp) {
            batch.del(`${constants_1.DB_KEY_TEMPBLOCKS_HEIGHT}:${heightStr}`);
        }
        stateStore.finalize(heightStr, batch);
        await batch.write();
        await this._cleanUntil(finalizedHeight);
    }
    async deleteBlock(id, height, txIDs, fullBlock, stateStore, saveToTemp = false) {
        const batch = this._db.batch();
        const heightStr = lisk_db_1.formatInt(height);
        batch.del(`${constants_1.DB_KEY_BLOCKS_ID}:${utils_1.keyString(id)}`);
        batch.del(`${constants_1.DB_KEY_BLOCKS_HEIGHT}:${heightStr}`);
        if (txIDs.length > 0) {
            for (const txID of txIDs) {
                batch.del(`${constants_1.DB_KEY_TRANSACTIONS_ID}:${utils_1.keyString(txID)}`);
            }
            batch.del(`${constants_1.DB_KEY_TRANSACTIONS_BLOCK_ID}:${utils_1.keyString(id)}`);
        }
        if (saveToTemp) {
            batch.put(`${constants_1.DB_KEY_TEMPBLOCKS_HEIGHT}:${heightStr}`, fullBlock);
        }
        const diffKey = `${constants_1.DB_KEY_DIFF_STATE}:${heightStr}`;
        const stateDiff = await this._db.get(diffKey);
        const { created: createdStates, updated: updatedStates, deleted: deletedStates, } = lisk_codec_1.codec.decode(schema_1.stateDiffSchema, stateDiff);
        for (const key of createdStates) {
            batch.del(key);
        }
        for (const { key, value: previousValue } of deletedStates) {
            batch.put(key, previousValue);
        }
        for (const { key, value: previousValue } of updatedStates) {
            batch.put(key, previousValue);
        }
        stateStore.finalize(heightStr, batch);
        batch.del(diffKey);
        await batch.write();
        return {
            deleted: deletedStates,
            created: createdStates,
            updated: updatedStates,
        };
    }
    async _cleanUntil(height) {
        await this._db.clear({
            gte: `${constants_1.DB_KEY_DIFF_STATE}:${lisk_db_1.formatInt(0)}`,
            lt: `${constants_1.DB_KEY_DIFF_STATE}:${lisk_db_1.formatInt(height)}`,
        });
    }
    async _getTransactions(blockID) {
        const txIDs = [];
        try {
            const ids = await this._db.get(`${constants_1.DB_KEY_TRANSACTIONS_BLOCK_ID}:${utils_1.keyString(blockID)}`);
            const idLength = 32;
            for (let i = 0; i < ids.length; i += idLength) {
                txIDs.push(ids.slice(i, i + idLength));
            }
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                throw error;
            }
        }
        if (txIDs.length === 0) {
            return [];
        }
        const transactions = [];
        for (const txID of txIDs) {
            const tx = await this._db.get(`${constants_1.DB_KEY_TRANSACTIONS_ID}:${utils_1.keyString(txID)}`);
            transactions.push(tx);
        }
        return transactions;
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map
