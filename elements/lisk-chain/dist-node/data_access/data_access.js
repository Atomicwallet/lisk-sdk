"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccess = void 0;
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const transaction_1 = require("../transaction");
const cache_1 = require("./cache");
const storage_1 = require("./storage");
const block_header_interface_adapter_1 = require("./block_header_interface_adapter");
const schema_1 = require("../schema");
const constants_1 = require("./constants");
class DataAccess {
    constructor({ db, registeredBlockHeaders, accountSchema, minBlockHeaderCache, maxBlockHeaderCache, }) {
        this._storage = new storage_1.Storage(db);
        this._blocksCache = new cache_1.BlockCache(minBlockHeaderCache, maxBlockHeaderCache);
        this._accountSchema = accountSchema;
        this._blockHeaderAdapter = new block_header_interface_adapter_1.BlockHeaderInterfaceAdapter(registeredBlockHeaders);
    }
    addBlockHeader(blockHeader) {
        return this._blocksCache.add(blockHeader);
    }
    async removeBlockHeader(id) {
        var _a;
        const cachedItems = this._blocksCache.remove(id);
        if (!this._blocksCache.needsRefill) {
            return cachedItems;
        }
        const upperHeightToFetch = ((_a = this._blocksCache.items[0]) === null || _a === void 0 ? void 0 : _a.height) - 1 || 0;
        const lowerHeightToFetch = Math.max(upperHeightToFetch - (this._blocksCache.maxCachedItems - this._blocksCache.minCachedItems), 1);
        if (upperHeightToFetch - lowerHeightToFetch > 0) {
            const blockHeaders = await this.getBlockHeadersByHeightBetween(lowerHeightToFetch, upperHeightToFetch);
            this._blocksCache.refill(blockHeaders.reverse());
        }
        return cachedItems;
    }
    resetBlockHeaderCache() {
        this._blocksCache.empty();
    }
    getBlockHeaderAssetSchema(version) {
        return this._blockHeaderAdapter.getSchema(version);
    }
    async getBlockHeaderByID(id) {
        const cachedBlock = this._blocksCache.getByID(id);
        if (cachedBlock) {
            return cachedBlock;
        }
        const blockHeaderBuffer = await this._storage.getBlockHeaderByID(id);
        return this._blockHeaderAdapter.decode(blockHeaderBuffer);
    }
    async getBlockHeadersByIDs(arrayOfBlockIds) {
        const cachedBlocks = this._blocksCache.getByIDs(arrayOfBlockIds);
        if (cachedBlocks.length) {
            return cachedBlocks;
        }
        const blocks = await this._storage.getBlockHeadersByIDs(arrayOfBlockIds);
        return blocks.map(block => this._blockHeaderAdapter.decode(block));
    }
    async getBlockHeaderByHeight(height) {
        const cachedBlock = this._blocksCache.getByHeight(height);
        if (cachedBlock) {
            return cachedBlock;
        }
        const header = await this._storage.getBlockHeaderByHeight(height);
        return this._blockHeaderAdapter.decode(header);
    }
    async getBlockHeadersByHeightBetween(fromHeight, toHeight) {
        const cachedBlocks = this._blocksCache.getByHeightBetween(fromHeight, toHeight);
        if (cachedBlocks.length) {
            return cachedBlocks;
        }
        const blocks = await this._storage.getBlockHeadersByHeightBetween(fromHeight, toHeight);
        return blocks.map(block => this._blockHeaderAdapter.decode(block));
    }
    async getBlockHeadersWithHeights(heightList) {
        const cachedBlocks = this._blocksCache.getByHeights(heightList);
        if (cachedBlocks.length) {
            return cachedBlocks;
        }
        const blocks = await this._storage.getBlockHeadersWithHeights(heightList);
        return blocks.map(block => this._blockHeaderAdapter.decode(block));
    }
    async getLastBlockHeader() {
        const cachedBlock = this._blocksCache.last;
        if (cachedBlock) {
            return cachedBlock;
        }
        const block = await this._storage.getLastBlockHeader();
        return this._blockHeaderAdapter.decode(block);
    }
    async getHighestCommonBlockHeader(arrayOfBlockIds) {
        const headers = this._blocksCache.getByIDs(arrayOfBlockIds);
        headers.sort((a, b) => b.height - a.height);
        const cachedBlockHeader = headers[0];
        if (cachedBlockHeader) {
            return cachedBlockHeader;
        }
        const storageBlockHeaders = [];
        for (const id of arrayOfBlockIds) {
            try {
                const blockHeader = await this.getBlockHeaderByID(id);
                storageBlockHeaders.push(blockHeader);
            }
            catch (error) {
                if (!(error instanceof lisk_db_1.NotFoundError)) {
                    throw error;
                }
            }
        }
        storageBlockHeaders.sort((a, b) => b.height - a.height);
        return storageBlockHeaders[0];
    }
    async getBlockByID(id) {
        const block = await this._storage.getBlockByID(id);
        return this._decodeRawBlock(block);
    }
    async getBlocksByIDs(arrayOfBlockIds) {
        const blocks = await this._storage.getBlocksByIDs(arrayOfBlockIds);
        return blocks.map(block => this._decodeRawBlock(block));
    }
    async getBlockByHeight(height) {
        const block = await this._storage.getBlockByHeight(height);
        return this._decodeRawBlock(block);
    }
    async getBlocksByHeightBetween(fromHeight, toHeight) {
        const blocks = await this._storage.getBlocksByHeightBetween(fromHeight, toHeight);
        return blocks.map(block => this._decodeRawBlock(block));
    }
    async getLastBlock() {
        const block = await this._storage.getLastBlock();
        return this._decodeRawBlock(block);
    }
    async isBlockPersisted(blockId) {
        const isPersisted = await this._storage.isBlockPersisted(blockId);
        return isPersisted;
    }
    async getTempBlocks() {
        const blocks = await this._storage.getTempBlocks();
        return blocks.map(block => this.decode(block));
    }
    async isTempBlockEmpty() {
        const isEmpty = await this._storage.isTempBlockEmpty();
        return isEmpty;
    }
    async clearTempBlocks() {
        await this._storage.clearTempBlocks();
    }
    async getChainState(key) {
        return this._storage.getChainState(key);
    }
    async getConsensusState(key) {
        return this._storage.getConsensusState(key);
    }
    async getAccountsByPublicKey(arrayOfPublicKeys) {
        const accounts = await this._storage.getAccountsByPublicKey(arrayOfPublicKeys);
        return accounts.map(account => this.decodeAccount(account));
    }
    async getAccountByAddress(address) {
        const account = await this._storage.getAccountByAddress(address);
        return this.decodeAccount(account);
    }
    async getEncodedAccountByAddress(address) {
        const account = await this._storage.getAccountByAddress(address);
        return account;
    }
    async getAccountsByAddress(arrayOfAddresses) {
        const accounts = await this._storage.getAccountsByAddress(arrayOfAddresses);
        return accounts.map(account => this.decodeAccount(account));
    }
    async getTransactionByID(id) {
        const transaction = await this._storage.getTransactionByID(id);
        return transaction_1.Transaction.decode(transaction);
    }
    async getTransactionsByIDs(arrayOfTransactionIds) {
        const transactions = await this._storage.getTransactionsByIDs(arrayOfTransactionIds);
        return transactions.map(transaction => transaction_1.Transaction.decode(transaction));
    }
    async isTransactionPersisted(transactionId) {
        const isPersisted = await this._storage.isTransactionPersisted(transactionId);
        return isPersisted;
    }
    decode(buffer) {
        const block = lisk_codec_1.codec.decode(schema_1.blockSchema, buffer);
        const header = this._blockHeaderAdapter.decode(block.header);
        const payload = [];
        for (const rawTx of block.payload) {
            const tx = transaction_1.Transaction.decode(rawTx);
            payload.push(tx);
        }
        return {
            header,
            payload,
        };
    }
    encode(block) {
        const header = this.encodeBlockHeader(block.header);
        const payload = [];
        for (const rawTx of block.payload) {
            const tx = rawTx.getBytes();
            payload.push(tx);
        }
        return lisk_codec_1.codec.encode(schema_1.blockSchema, { header, payload });
    }
    decodeBlockHeader(buffer) {
        return this._blockHeaderAdapter.decode(buffer);
    }
    encodeBlockHeader(blockHeader, skipSignature = false) {
        return this._blockHeaderAdapter.encode(blockHeader, skipSignature);
    }
    decodeAccount(buffer) {
        return lisk_codec_1.codec.decode(this._accountSchema, buffer);
    }
    encodeAccount(account) {
        return lisk_codec_1.codec.encode(this._accountSchema, account);
    }
    decodeTransaction(buffer) {
        return transaction_1.Transaction.decode(buffer);
    }
    encodeTransaction(tx) {
        return tx.getBytes();
    }
    async saveBlock(block, stateStore, finalizedHeight, removeFromTemp = false) {
        const { id: blockID, height } = block.header;
        const encodedHeader = this._blockHeaderAdapter.encode(block.header);
        const encodedPayload = [];
        for (const tx of block.payload) {
            const txID = tx.id;
            const encodedTx = tx.getBytes();
            encodedPayload.push({ id: txID, value: encodedTx });
        }
        await this._storage.saveBlock(blockID, height, finalizedHeight, encodedHeader, encodedPayload, stateStore, removeFromTemp);
    }
    async deleteBlock(block, stateStore, saveToTemp = false) {
        const { id: blockID, height } = block.header;
        const txIDs = block.payload.map(tx => tx.id);
        const encodedBlock = this.encode(block);
        const diff = await this._storage.deleteBlock(blockID, height, txIDs, encodedBlock, stateStore, saveToTemp);
        const updatedAccounts = [];
        for (const created of diff.deleted) {
            if (created.key.includes(constants_1.DB_KEY_ACCOUNTS_ADDRESS)) {
                updatedAccounts.push(this.decodeAccount(created.value));
            }
        }
        for (const updated of diff.updated) {
            if (updated.key.includes(constants_1.DB_KEY_ACCOUNTS_ADDRESS)) {
                updatedAccounts.push(this.decodeAccount(updated.value));
            }
        }
        return updatedAccounts;
    }
    _decodeRawBlock(block) {
        const header = this._blockHeaderAdapter.decode(block.header);
        const payload = [];
        for (const rawTx of block.payload) {
            const tx = transaction_1.Transaction.decode(rawTx);
            payload.push(tx);
        }
        return {
            header,
            payload,
        };
    }
}
exports.DataAccess = DataAccess;
//# sourceMappingURL=data_access.js.map