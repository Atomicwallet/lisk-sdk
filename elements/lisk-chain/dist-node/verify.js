"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyReward = exports.isValidSeedReveal = exports.verifyBlockGenerator = exports.matchGenesisBlock = exports.verifyPreviousBlockId = exports.verifyBlockNotExists = void 0;
const createDebug = require("debug");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const constants_1 = require("./constants");
const schema_1 = require("./schema");
const debug = createDebug('lisk:chain:verify');
const verifyBlockNotExists = async (dataAccess, block) => {
    const isPersisted = await dataAccess.isBlockPersisted(block.header.id);
    if (isPersisted) {
        throw new Error(`Block ${block.header.id.toString('hex')} already exists`);
    }
};
exports.verifyBlockNotExists = verifyBlockNotExists;
const verifyPreviousBlockId = (block, lastBlock) => {
    const isConsecutiveBlock = lastBlock.header.height + 1 === block.header.height &&
        block.header.previousBlockID.equals(lastBlock.header.id);
    if (!isConsecutiveBlock) {
        throw new Error('Invalid previous block');
    }
};
exports.verifyPreviousBlockId = verifyPreviousBlockId;
const matchGenesisBlock = (genesisBlock, block) => block.id.equals(genesisBlock.header.id) &&
    block.version === genesisBlock.header.version &&
    block.transactionRoot.equals(genesisBlock.header.transactionRoot) &&
    block.signature.equals(genesisBlock.header.signature);
exports.matchGenesisBlock = matchGenesisBlock;
const verifyBlockGenerator = async (header, slots, stateStore) => {
    const currentSlot = slots.getSlotNumber(header.timestamp);
    const validatorsBuffer = await stateStore.consensus.get(constants_1.CONSENSUS_STATE_VALIDATORS_KEY);
    if (!validatorsBuffer) {
        throw new Error(`Failed to verify slot: ${currentSlot.toString()} for block Height: ${header.height} - No validator was found`);
    }
    const { validators } = lisk_codec_1.codec.decode(schema_1.validatorsSchema, validatorsBuffer);
    const expectedValidator = validators[currentSlot % validators.length];
    const generatorAddress = lisk_cryptography_1.getAddressFromPublicKey(header.generatorPublicKey);
    if (!generatorAddress.equals(expectedValidator.address)) {
        throw new Error(`Failed to verify generator: ${generatorAddress.toString('hex')} Expected: ${expectedValidator.address.toString('hex')}. Block Height: ${header.height}`);
    }
};
exports.verifyBlockGenerator = verifyBlockGenerator;
const lastValidatorsSetHeight = (height, numberOfValidators) => Math.max(Math.ceil(height / numberOfValidators) - 2, 0) * numberOfValidators + 1;
const isValidSeedReveal = (blockHeader, stateStore, numberOfValidators) => {
    const { lastBlockHeaders } = stateStore.chain;
    const lastForgedBlock = lastBlockHeaders.filter(block => block.generatorPublicKey.equals(blockHeader.generatorPublicKey) &&
        block.height >= lastValidatorsSetHeight(blockHeader.height, numberOfValidators));
    if (!lastForgedBlock.length) {
        debug('Validator did not create any block in current or last validator set', {
            generatorPublicKey: blockHeader.generatorPublicKey,
            height: blockHeader.height,
        });
        return true;
    }
    const { asset: { seedReveal: previousBlockSeedReveal }, } = lastForgedBlock[0];
    const { asset: { seedReveal: newBlockSeedReveal }, } = blockHeader;
    const SEED_REVEAL_BYTE_SIZE = 16;
    const newBlockSeedRevealBuffer = lisk_cryptography_1.hash(newBlockSeedReveal).slice(0, SEED_REVEAL_BYTE_SIZE);
    if (previousBlockSeedReveal.equals(newBlockSeedRevealBuffer)) {
        return true;
    }
    debug('New block SeedReveal is not the preimage of last block', {
        newBlockSeedReveal: newBlockSeedRevealBuffer.toString('hex'),
        previousBlockSeedReveal,
        delegate: blockHeader.generatorPublicKey,
        height: blockHeader.height,
    });
    return false;
};
exports.isValidSeedReveal = isValidSeedReveal;
const verifyReward = (blockHeader, stateStore, numberOfValidators) => {
    if (!exports.isValidSeedReveal(blockHeader, stateStore, numberOfValidators) &&
        blockHeader.reward !== BigInt(0)) {
        throw new Error(`Invalid block reward: ${blockHeader.reward.toString()} expected: 0`);
    }
};
exports.verifyReward = verifyReward;
//# sourceMappingURL=verify.js.map