"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const codec_1 = require("./codec");
class Block {
    constructor(channel, registeredSchema) {
        this._channel = channel;
        this._schemas = registeredSchema;
    }
    async get(id) {
        const idString = Buffer.isBuffer(id) ? id.toString('hex') : id;
        const blockHex = await this._channel.invoke('app:getBlockByID', {
            id: idString,
        });
        const blockBytes = Buffer.from(blockHex, 'hex');
        return codec_1.decodeBlock(blockBytes, this._schemas);
    }
    async getByHeight(height) {
        const blockHex = await this._channel.invoke('app:getBlockByHeight', { height });
        const blockBytes = Buffer.from(blockHex, 'hex');
        return codec_1.decodeBlock(blockBytes, this._schemas);
    }
    encode(input) {
        return codec_1.encodeBlock(input, this._schemas);
    }
    decode(input) {
        const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'hex');
        return codec_1.decodeBlock(inputBuffer, this._schemas);
    }
    toJSON(block) {
        const { asset, ...headerRoot } = block.header;
        const tmpBlockId = headerRoot.id;
        delete headerRoot.id;
        const header = {
            ...lisk_codec_1.codec.toJSON(this._schemas.blockHeader, headerRoot),
            asset: {},
            id: tmpBlockId === null || tmpBlockId === void 0 ? void 0 : tmpBlockId.toString('hex'),
        };
        const headerAssetJson = lisk_codec_1.codec.toJSON(this._schemas.blockHeadersAssets[block.header.version], asset);
        header.asset = headerAssetJson;
        const payload = [];
        for (const tx of block.payload) {
            const { asset: txAsset, ...txRoot } = tx;
            const tmpId = txRoot.id;
            delete txRoot.id;
            const schemaAsset = codec_1.getTransactionAssetSchema(tx, this._schemas);
            const jsonTxAsset = lisk_codec_1.codec.toJSON(schemaAsset, txAsset);
            const jsonTxRoot = lisk_codec_1.codec.toJSON(this._schemas.transaction, txRoot);
            const jsonTx = {
                ...jsonTxRoot,
                id: tmpId === null || tmpId === void 0 ? void 0 : tmpId.toString('hex'),
                asset: jsonTxAsset,
            };
            payload.push(jsonTx);
        }
        return { header, payload };
    }
    fromJSON(block) {
        const { asset, ...headerRoot } = block.header;
        const tmpBlockId = headerRoot.id ? Buffer.from(headerRoot.id, 'hex') : Buffer.alloc(0);
        delete headerRoot.id;
        const header = {
            ...lisk_codec_1.codec.fromJSON(this._schemas.blockHeader, headerRoot),
            asset: {},
            id: tmpBlockId,
        };
        const headerAssetJson = lisk_codec_1.codec.fromJSON(this._schemas.blockHeadersAssets[block.header.version], asset);
        header.asset = headerAssetJson;
        const payload = [];
        for (const tx of block.payload) {
            const { asset: txAsset, ...txRoot } = tx;
            const tmpId = txRoot.id ? Buffer.from(txRoot.id, 'hex') : Buffer.alloc(0);
            delete txRoot.id;
            const schemaAsset = codec_1.getTransactionAssetSchema(tx, this._schemas);
            const txAssetObject = lisk_codec_1.codec.fromJSON(schemaAsset, txAsset);
            const txRootObject = lisk_codec_1.codec.fromJSON(this._schemas.transaction, txRoot);
            const txObject = {
                ...txRootObject,
                id: tmpId,
                asset: txAssetObject,
            };
            payload.push(txObject);
        }
        return { header, payload };
    }
}
exports.Block = Block;
//# sourceMappingURL=block.js.map