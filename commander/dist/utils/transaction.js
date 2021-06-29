"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiClient = exports.transactionToJSON = exports.encodeTransaction = exports.decodeTransaction = exports.getAssetSchema = void 0;
const liskApiClient = require("@liskhq/lisk-api-client");
const cryptography = require("@liskhq/lisk-cryptography");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const path_1 = require("./path");
const application_1 = require("./application");
const getAssetSchema = (registeredSchema, moduleID, assetID) => {
    const transactionsAsset = registeredSchema.transactionsAssets.find(schema => schema.moduleID === Number(moduleID) && schema.assetID === Number(assetID));
    if (!transactionsAsset) {
        throw new Error(`Transaction moduleID:${moduleID} with assetID:${assetID} is not registered in the application.`);
    }
    return transactionsAsset.schema;
};
exports.getAssetSchema = getAssetSchema;
const decodeTransaction = (schema, transactionHexStr, apiClient) => {
    const transactionBytes = Buffer.from(transactionHexStr, 'hex');
    if (apiClient) {
        return apiClient.transaction.decode(transactionBytes);
    }
    const id = cryptography.hash(transactionBytes);
    const transaction = lisk_codec_1.codec.decode(schema.transaction, transactionBytes);
    const assetSchema = exports.getAssetSchema(schema, transaction.moduleID, transaction.assetID);
    const asset = lisk_codec_1.codec.decode(assetSchema, transaction.asset);
    return {
        ...transaction,
        asset,
        id,
    };
};
exports.decodeTransaction = decodeTransaction;
const encodeTransaction = (schema, transaction, apiClient) => {
    if (apiClient) {
        return apiClient.transaction.encode(transaction);
    }
    const assetSchema = exports.getAssetSchema(schema, transaction.moduleID, transaction.assetID);
    const assetBytes = lisk_codec_1.codec.encode(assetSchema, transaction.asset);
    const txBytes = lisk_codec_1.codec.encode(schema.transaction, { ...transaction, asset: assetBytes });
    return txBytes;
};
exports.encodeTransaction = encodeTransaction;
const transactionToJSON = (schema, transaction, apiClient) => {
    if (apiClient) {
        return apiClient.transaction.toJSON(transaction);
    }
    const assetSchema = exports.getAssetSchema(schema, transaction.moduleID, transaction.assetID);
    const assetJSON = lisk_codec_1.codec.toJSON(assetSchema, transaction.asset);
    const { id, asset, ...txWithoutAsset } = transaction;
    const txJSON = lisk_codec_1.codec.toJSON(schema.transaction, txWithoutAsset);
    return {
        ...txJSON,
        asset: assetJSON,
        id: Buffer.isBuffer(id) ? id.toString('hex') : undefined,
    };
};
exports.transactionToJSON = transactionToJSON;
const getApiClient = async (appDataPath, name) => {
    const dataPath = appDataPath !== null && appDataPath !== void 0 ? appDataPath : path_1.getDefaultPath(name);
    if (!application_1.isApplicationRunning(dataPath)) {
        throw new Error(`Application at data path ${dataPath} is not running.`);
    }
    const client = await liskApiClient.createIPCClient(dataPath);
    return client;
};
exports.getApiClient = getApiClient;
//# sourceMappingURL=transaction.js.map