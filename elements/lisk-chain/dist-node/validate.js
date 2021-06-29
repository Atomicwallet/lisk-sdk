"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGenesisBlockHeader = exports.validateBlockSlot = exports.validateBlockProperties = exports.validateReward = exports.validateSignature = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_tree_1 = require("@liskhq/lisk-tree");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const schema_1 = require("./schema");
const constants_1 = require("./constants");
const validateSignature = (publicKey, dataWithoutSignature, signature, networkIdentifier) => {
    const verified = lisk_cryptography_1.verifyData(constants_1.TAG_BLOCK_HEADER, networkIdentifier, dataWithoutSignature, signature, publicKey);
    if (!verified) {
        throw new Error('Invalid block signature');
    }
};
exports.validateSignature = validateSignature;
const validateReward = (block, maxReward) => {
    if (block.header.reward > maxReward) {
        throw new Error(`Invalid block reward: ${block.header.reward.toString()} maximum allowed: ${maxReward.toString()}`);
    }
};
exports.validateReward = validateReward;
const getTransactionRoot = (ids) => {
    const tree = new lisk_tree_1.MerkleTree(ids);
    return tree.root;
};
const validateBlockProperties = (block, encodedPayload, maxPayloadLength) => {
    if (block.header.previousBlockID.length === 0) {
        throw new Error('Previous block id must not be empty');
    }
    if (encodedPayload.length > maxPayloadLength) {
        throw new Error('Payload length is too long');
    }
    const transactionIds = [];
    for (const transaction of block.payload) {
        transactionIds.push(transaction.id);
    }
    const transactionRoot = getTransactionRoot(transactionIds);
    if (!transactionRoot.equals(block.header.transactionRoot)) {
        throw new Error('Invalid transaction root');
    }
};
exports.validateBlockProperties = validateBlockProperties;
const validateBlockSlot = (block, lastBlock, slots) => {
    const blockSlotNumber = slots.getSlotNumber(block.header.timestamp);
    const lastBlockSlotNumber = slots.getSlotNumber(lastBlock.header.timestamp);
    if (blockSlotNumber > slots.getSlotNumber() || blockSlotNumber <= lastBlockSlotNumber) {
        throw new Error('Invalid block timestamp');
    }
};
exports.validateBlockSlot = validateBlockSlot;
const validateGenesisBlockHeader = (block, accountSchema) => {
    const { header, payload } = block;
    const errors = [];
    const headerErrors = lisk_validator_1.validator.validate(lisk_utils_1.objects.mergeDeep({}, schema_1.blockHeaderSchema, {
        properties: {
            version: {
                const: 0,
            },
        },
    }), { ...header, asset: constants_1.EMPTY_BUFFER });
    if (headerErrors.length) {
        errors.push(...headerErrors);
    }
    const assetErrors = lisk_validator_1.validator.validate(schema_1.getGenesisBlockHeaderAssetSchema(accountSchema), header.asset);
    if (assetErrors.length) {
        errors.push(...assetErrors);
    }
    if (!header.generatorPublicKey.equals(constants_1.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY)) {
        errors.push({
            message: 'should be equal to constant',
            keyword: 'const',
            dataPath: 'header.generatorPublicKey',
            schemaPath: 'properties.generatorPublicKey',
            params: { allowedValue: constants_1.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY },
        });
    }
    if (header.reward !== constants_1.GENESIS_BLOCK_REWARD) {
        errors.push({
            message: 'should be equal to constant',
            keyword: 'const',
            dataPath: 'header.reward',
            schemaPath: 'properties.reward',
            params: { allowedValue: constants_1.GENESIS_BLOCK_REWARD },
        });
    }
    if (!header.signature.equals(constants_1.GENESIS_BLOCK_SIGNATURE)) {
        errors.push({
            message: 'should be equal to constant',
            keyword: 'const',
            dataPath: 'header.signature',
            schemaPath: 'properties.signature',
            params: { allowedValue: constants_1.GENESIS_BLOCK_SIGNATURE },
        });
    }
    if (!header.transactionRoot.equals(constants_1.GENESIS_BLOCK_TRANSACTION_ROOT)) {
        errors.push({
            message: 'should be equal to constant',
            keyword: 'const',
            dataPath: 'header.transactionRoot',
            schemaPath: 'properties.transactionRoot',
            params: { allowedValue: constants_1.GENESIS_BLOCK_TRANSACTION_ROOT },
        });
    }
    if (payload.length !== 0) {
        errors.push({
            message: 'Payload length must be zero',
            keyword: 'const',
            dataPath: 'payload',
            schemaPath: 'properties.payload',
            params: { allowedValue: [] },
        });
    }
    if (!lisk_utils_1.objects.bufferArrayUniqueItems(header.asset.initDelegates)) {
        errors.push({
            dataPath: '.initDelegates',
            keyword: 'uniqueItems',
            message: 'must NOT have duplicate items',
            params: {},
            schemaPath: '#/properties/initDelegates/uniqueItems',
        });
    }
    if (!lisk_utils_1.objects.bufferArrayOrderByLex(header.asset.initDelegates)) {
        errors.push({
            message: 'should be lexicographically ordered',
            keyword: 'initDelegates',
            dataPath: 'header.asset.initDelegates',
            schemaPath: 'properties.initDelegates',
            params: { initDelegates: header.asset.initDelegates },
        });
    }
    const accountAddresses = header.asset.accounts.map(a => a.address);
    const copiedAddresses = [...accountAddresses];
    copiedAddresses.sort((a, b) => {
        if (a.length > b.length) {
            return 1;
        }
        if (a.length < b.length) {
            return -1;
        }
        return a.compare(b);
    });
    if (!lisk_utils_1.objects.bufferArrayEqual(accountAddresses, copiedAddresses)) {
        errors.push({
            message: 'should be length and lexicographically ordered',
            keyword: 'accounts',
            dataPath: 'header.asset.accounts',
            schemaPath: 'properties.accounts',
            params: { orderKey: 'address' },
        });
    }
    if (!lisk_utils_1.objects.bufferArrayUniqueItems(accountAddresses)) {
        errors.push({
            dataPath: '.accounts',
            keyword: 'uniqueItems',
            message: 'must NOT have duplicate items',
            params: {},
            schemaPath: '#/properties/accounts/uniqueItems',
        });
    }
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError(errors);
    }
};
exports.validateGenesisBlockHeader = validateGenesisBlockHeader;
//# sourceMappingURL=validate.js.map