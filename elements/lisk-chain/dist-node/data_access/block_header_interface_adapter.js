"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockHeaderInterfaceAdapter = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const schema_1 = require("../schema");
class BlockHeaderInterfaceAdapter {
    constructor(registeredBlocks = {}) {
        this._blockSchemaMap = new Map();
        Object.keys(registeredBlocks).forEach(version => {
            this._blockSchemaMap.set(Number(version), registeredBlocks[Number(version)]);
        });
    }
    getSchema(version) {
        const assetSchema = this._blockSchemaMap.get(version);
        if (!assetSchema) {
            throw new Error(`Asset Schema not found for block version: ${version}.`);
        }
        return assetSchema;
    }
    decode(buffer) {
        const blockHeader = lisk_codec_1.codec.decode(schema_1.blockHeaderSchema, buffer);
        const assetSchema = this.getSchema(blockHeader.version);
        const asset = lisk_codec_1.codec.decode(assetSchema, blockHeader.asset);
        const id = lisk_cryptography_1.hash(buffer);
        return { ...blockHeader, asset, id };
    }
    encode(header, skipSignature = false) {
        const assetSchema = this.getSchema(header.version);
        const encodedAsset = lisk_codec_1.codec.encode(assetSchema, header.asset);
        const rawHeader = { ...header, asset: encodedAsset };
        const schema = skipSignature ? schema_1.signingBlockHeaderSchema : schema_1.blockHeaderSchema;
        return lisk_codec_1.codec.encode(schema, rawHeader);
    }
}
exports.BlockHeaderInterfaceAdapter = BlockHeaderInterfaceAdapter;
//# sourceMappingURL=block_header_interface_adapter.js.map