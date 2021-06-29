"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlock = exports.createFakeBlockHeader = exports.createBlockHeaderWithDefaults = exports.encodeBlockHeader = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_tree_1 = require("@liskhq/lisk-tree");
const encodeBlockHeader = (header, skipSignature = false) => {
    const encodedAsset = lisk_codec_1.codec.encode(lisk_chain_1.blockHeaderAssetSchema, header.asset);
    const rawHeader = { ...header, asset: encodedAsset };
    const schema = skipSignature ? lisk_chain_1.signingBlockHeaderSchema : lisk_chain_1.blockHeaderSchema;
    return lisk_codec_1.codec.encode(schema, rawHeader);
};
exports.encodeBlockHeader = encodeBlockHeader;
const createBlockHeaderWithDefaults = (header) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return ({
        version: (_a = header === null || header === void 0 ? void 0 : header.version) !== null && _a !== void 0 ? _a : 2,
        timestamp: (_b = header === null || header === void 0 ? void 0 : header.timestamp) !== null && _b !== void 0 ? _b : 0,
        height: (_c = header === null || header === void 0 ? void 0 : header.height) !== null && _c !== void 0 ? _c : 1,
        previousBlockID: (_d = header === null || header === void 0 ? void 0 : header.previousBlockID) !== null && _d !== void 0 ? _d : lisk_cryptography_1.hash(lisk_cryptography_1.getRandomBytes(4)),
        transactionRoot: (_e = header === null || header === void 0 ? void 0 : header.transactionRoot) !== null && _e !== void 0 ? _e : lisk_cryptography_1.hash(lisk_cryptography_1.getRandomBytes(4)),
        generatorPublicKey: (_f = header === null || header === void 0 ? void 0 : header.generatorPublicKey) !== null && _f !== void 0 ? _f : lisk_cryptography_1.getRandomBytes(32),
        reward: (_g = header === null || header === void 0 ? void 0 : header.reward) !== null && _g !== void 0 ? _g : BigInt(0),
        asset: ((_h = header === null || header === void 0 ? void 0 : header.asset) !== null && _h !== void 0 ? _h : {
            maxHeightPreviouslyForged: 0,
            maxHeightPrevoted: 0,
            seedReveal: lisk_cryptography_1.getRandomBytes(16),
        }),
    });
};
exports.createBlockHeaderWithDefaults = createBlockHeaderWithDefaults;
const createFakeBlockHeader = (header) => {
    const headerWithDefault = exports.createBlockHeaderWithDefaults(header);
    const headerWithSignature = lisk_utils_1.objects.mergeDeep({}, headerWithDefault, {
        signature: lisk_cryptography_1.getRandomBytes(64),
    });
    const id = lisk_cryptography_1.hash(exports.encodeBlockHeader(headerWithSignature));
    return {
        ...headerWithSignature,
        id,
    };
};
exports.createFakeBlockHeader = createFakeBlockHeader;
const createBlock = ({ passphrase, networkIdentifier, timestamp, previousBlockID, payload, header, }) => {
    var _a;
    const { publicKey, privateKey } = lisk_cryptography_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const txTree = new lisk_tree_1.MerkleTree(payload === null || payload === void 0 ? void 0 : payload.map(tx => tx.id));
    const asset = {
        maxHeightPreviouslyForged: 0,
        maxHeightPrevoted: 0,
        seedReveal: lisk_cryptography_1.getRandomBytes(16),
        ...header === null || header === void 0 ? void 0 : header.asset,
    };
    const blockHeader = exports.createBlockHeaderWithDefaults({
        previousBlockID,
        timestamp,
        transactionRoot: (_a = header === null || header === void 0 ? void 0 : header.transactionRoot) !== null && _a !== void 0 ? _a : txTree.root,
        generatorPublicKey: publicKey,
        ...header,
        asset,
    });
    const headerBytesWithoutSignature = exports.encodeBlockHeader(blockHeader, true);
    const signature = lisk_cryptography_1.signDataWithPrivateKey(lisk_chain_1.TAG_BLOCK_HEADER, networkIdentifier, headerBytesWithoutSignature, privateKey);
    const headerBytes = exports.encodeBlockHeader({
        ...blockHeader,
        signature,
    });
    const id = lisk_cryptography_1.hash(headerBytes);
    const block = {
        header: {
            ...blockHeader,
            signature,
            id,
        },
        payload,
    };
    return block;
};
exports.createBlock = createBlock;
//# sourceMappingURL=create_block.js.map