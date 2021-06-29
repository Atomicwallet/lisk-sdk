"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBlock = exports.decodeBlock = exports.encodeTransaction = exports.decodeTransaction = exports.decodeAccount = exports.getTransactionAssetSchema = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const getTransactionAssetSchema = (transaction, registeredSchema) => {
    const txAssetSchema = registeredSchema.transactionsAssets.find(assetSchema => assetSchema.moduleID === transaction.moduleID && assetSchema.assetID === transaction.assetID);
    if (!txAssetSchema) {
        throw new Error(`ModuleID: ${transaction.moduleID} AssetID: ${transaction.assetID} is not registered.`);
    }
    return txAssetSchema.schema;
};
exports.getTransactionAssetSchema = getTransactionAssetSchema;
const decodeAccount = (encodedAccount, registeredSchema) => lisk_codec_1.codec.decode(registeredSchema.account, encodedAccount);
exports.decodeAccount = decodeAccount;
const decodeTransaction = (encodedTransaction, registeredSchema) => {
    const transaction = lisk_codec_1.codec.decode(registeredSchema.transaction, encodedTransaction);
    const assetSchema = exports.getTransactionAssetSchema(transaction, registeredSchema);
    const asset = lisk_codec_1.codec.decode(assetSchema, transaction.asset);
    const id = lisk_cryptography_1.hash(encodedTransaction);
    return {
        ...transaction,
        asset,
        id,
    };
};
exports.decodeTransaction = decodeTransaction;
const encodeTransaction = (transaction, registeredSchema) => {
    const assetSchema = exports.getTransactionAssetSchema(transaction, registeredSchema);
    const encodedAsset = lisk_codec_1.codec.encode(assetSchema, transaction.asset);
    const decodedTransaction = lisk_codec_1.codec.encode(registeredSchema.transaction, {
        ...transaction,
        asset: encodedAsset,
    });
    return decodedTransaction;
};
exports.encodeTransaction = encodeTransaction;
const decodeBlock = (encodedBlock, registeredSchema) => {
    const block = lisk_codec_1.codec.decode(registeredSchema.block, encodedBlock);
    const header = lisk_codec_1.codec.decode(registeredSchema.blockHeader, block.header);
    const id = lisk_cryptography_1.hash(block.header);
    const assetSchema = registeredSchema.blockHeadersAssets[header.version];
    if (!assetSchema) {
        throw new Error(`Block header asset version ${header.version} is not registered.`);
    }
    const asset = lisk_codec_1.codec.decode(assetSchema, header.asset);
    const payload = [];
    for (const tx of block.payload) {
        payload.push(exports.decodeTransaction(tx, registeredSchema));
    }
    return {
        header: {
            ...header,
            asset,
            id,
        },
        payload,
    };
};
exports.decodeBlock = decodeBlock;
const encodeBlock = (block, registeredSchema) => {
    const encodedPayload = block.payload.map(p => exports.encodeTransaction(p, registeredSchema));
    const assetSchema = registeredSchema.blockHeadersAssets[block.header.version];
    if (!assetSchema) {
        throw new Error(`Block header asset version ${block.header.version} is not registered.`);
    }
    const encodedBlockAsset = lisk_codec_1.codec.encode(assetSchema, block.header.asset);
    const encodedBlockHeader = lisk_codec_1.codec.encode(registeredSchema.blockHeader, {
        ...block.header,
        asset: encodedBlockAsset,
    });
    return lisk_codec_1.codec.encode(registeredSchema.block, {
        header: encodedBlockHeader,
        payload: encodedPayload,
    });
};
exports.encodeBlock = encodeBlock;
//# sourceMappingURL=codec.js.map