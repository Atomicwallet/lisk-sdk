"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chain = void 0;
const lisk_codec_1 = ("../../lisk-codec");
const lisk_db_1 = ("../../lisk-db");
const createDebug = require("debug");
const events_1 = require("events");
const lisk_validator_1 = ("../../lisk-validator");
const block_reward_1 = require("./block_reward");
const constants_1 = require("./constants");
const data_access_1 = require("./data_access");
const slots_1 = require("./slots");
const state_store_1 = require("./state_store");
const account_1 = require("./utils/account");
const validate_1 = require("./validate");
const verify_1 = require("./verify");
const schema_1 = require("./schema");
const debug = createDebug('lisk:chain');
class Chain {
    constructor({ db, genesisBlock, accountSchemas, blockTime, networkIdentifier, maxPayloadLength, rewardDistance, rewardOffset, rewardMilestones, minFeePerByte, baseFees, minBlockHeaderCache = constants_1.DEFAULT_MIN_BLOCK_HEADER_CACHE, maxBlockHeaderCache = constants_1.DEFAULT_MAX_BLOCK_HEADER_CACHE, }) {
        this._numberOfValidators = -1;
        this.events = new events_1.EventEmitter();
        const { default: defaultAccount, ...schema } = account_1.getAccountSchemaWithDefault(accountSchemas);
        this._defaultAccount = defaultAccount;
        this._accountSchema = schema;
        this._blockAssetSchema = schema_1.getRegisteredBlockAssetSchema(this._accountSchema);
        lisk_codec_1.codec.addSchema(schema_1.blockSchema);
        lisk_codec_1.codec.addSchema(schema_1.blockHeaderSchema);
        lisk_codec_1.codec.addSchema(schema_1.signingBlockHeaderSchema);
        for (const assetSchema of Object.values(this._blockAssetSchema)) {
            lisk_codec_1.codec.addSchema(assetSchema);
        }
        lisk_codec_1.codec.addSchema(this._accountSchema);
        lisk_codec_1.codec.addSchema(schema_1.stateDiffSchema);
        this.dataAccess = new data_access_1.DataAccess({
            db,
            registeredBlockHeaders: this._blockAssetSchema,
            accountSchema: this._accountSchema,
            minBlockHeaderCache,
            maxBlockHeaderCache,
        });
        this._lastBlock = genesisBlock;
        this._networkIdentifier = networkIdentifier;
        this._genesisBlock = genesisBlock;
        this.slots = new slots_1.Slots({
            genesisBlockTimestamp: genesisBlock.header.timestamp,
            interval: blockTime,
        });
        this._blockRewardArgs = {
            distance: rewardDistance,
            rewardOffset,
            milestones: rewardMilestones,
        };
        this.constants = {
            blockTime,
            maxPayloadLength,
            rewardDistance,
            rewardOffset,
            rewardMilestones,
            networkIdentifier,
            minFeePerByte,
            baseFees,
        };
    }
    get lastBlock() {
        return this._lastBlock;
    }
    get numberOfValidators() {
        return this._numberOfValidators;
    }
    get genesisBlock() {
        return this._genesisBlock;
    }
    get accountSchema() {
        return this._accountSchema;
    }
    get blockAssetSchema() {
        return this._blockAssetSchema;
    }
    async init() {
        let storageLastBlock;
        try {
            storageLastBlock = await this.dataAccess.getLastBlock();
        }
        catch (error) {
            throw new Error('Failed to load last block');
        }
        if (storageLastBlock.header.height !== this.genesisBlock.header.height) {
            await this._cacheBlockHeaders(storageLastBlock);
        }
        const validators = await this.getValidators();
        this._numberOfValidators = validators.length;
        this._lastBlock = storageLastBlock;
    }
    calculateDefaultReward(height) {
        return block_reward_1.calculateDefaultReward(height, this._blockRewardArgs);
    }
    calculateExpectedReward(blockHeader, stateStore) {
        const defaultReward = this.calculateDefaultReward(blockHeader.height);
        const isValid = this.isValidSeedReveal(blockHeader, stateStore);
        return isValid ? defaultReward : BigInt(0);
    }
    resetBlockHeaderCache() {
        this.dataAccess.resetBlockHeaderCache();
    }
    async newStateStore(skipLastHeights = 0) {
        var _a, _b;
        const fromHeight = Math.max(0, this._lastBlock.header.height - this.numberOfValidators * 3 - skipLastHeights);
        const toHeight = Math.max(this._lastBlock.header.height - skipLastHeights, 1);
        const lastBlockHeaders = await this.dataAccess.getBlockHeadersByHeightBetween(fromHeight, toHeight);
        const lastBlockReward = this.calculateDefaultReward((_b = (_a = lastBlockHeaders[0]) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 1);
        return new state_store_1.StateStore(this.dataAccess, {
            networkIdentifier: this._networkIdentifier,
            lastBlockHeaders,
            lastBlockReward,
            defaultAccount: this._defaultAccount,
        });
    }
    async genesisBlockExist(genesisBlock) {
        let matchingGenesisBlock;
        try {
            matchingGenesisBlock = await this.dataAccess.getBlockHeaderByID(genesisBlock.header.id);
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                throw error;
            }
        }
        let lastBlockHeader;
        try {
            lastBlockHeader = await this.dataAccess.getLastBlockHeader();
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                throw error;
            }
        }
        if (lastBlockHeader && !matchingGenesisBlock) {
            throw new Error('Genesis block does not match');
        }
        if (!lastBlockHeader && !matchingGenesisBlock) {
            return false;
        }
        return true;
    }
    isValidSeedReveal(blockHeader, stateStore) {
        return verify_1.isValidSeedReveal(blockHeader, stateStore, this.numberOfValidators);
    }
    validateGenesisBlockHeader(block) {
        validate_1.validateGenesisBlockHeader(block, this._accountSchema);
    }
    async applyGenesisBlock(block, stateStore) {
        for (const account of block.header.asset.accounts) {
            await stateStore.account.set(account.address, account);
        }
        const initialValidators = block.header.asset.initDelegates.map(address => ({
            address,
            minActiveHeight: block.header.height + 1,
            isConsensusParticipant: false,
        }));
        await stateStore.consensus.set(constants_1.CONSENSUS_STATE_VALIDATORS_KEY, lisk_codec_1.codec.encode(schema_1.validatorsSchema, { validators: initialValidators }));
        this._numberOfValidators = block.header.asset.initDelegates.length;
    }
    validateTransaction(transaction) {
        transaction.validate({
            minFeePerByte: this.constants.minFeePerByte,
            baseFees: this.constants.baseFees,
        });
    }
    validateBlockHeader(block) {
        const headerWithoutAsset = {
            ...block.header,
            asset: Buffer.alloc(0),
        };
        const errors = lisk_validator_1.validator.validate(schema_1.blockHeaderSchema, headerWithoutAsset);
        if (errors.length) {
            throw new lisk_validator_1.LiskValidationError(errors);
        }
        const assetSchema = this.dataAccess.getBlockHeaderAssetSchema(block.header.version);
        const assetErrors = lisk_validator_1.validator.validate(assetSchema, block.header.asset);
        if (assetErrors.length) {
            throw new lisk_validator_1.LiskValidationError(assetErrors);
        }
        const encodedBlockHeaderWithoutSignature = this.dataAccess.encodeBlockHeader(block.header, true);
        validate_1.validateSignature(block.header.generatorPublicKey, encodedBlockHeaderWithoutSignature, block.header.signature, this._networkIdentifier);
        validate_1.validateReward(block, this.calculateDefaultReward(block.header.height));
        const encodedPayload = Buffer.concat(block.payload.map(tx => this.dataAccess.encodeTransaction(tx)));
        validate_1.validateBlockProperties(block, encodedPayload, this.constants.maxPayloadLength);
    }
    async verifyBlockHeader(block, stateStore) {
        verify_1.verifyPreviousBlockId(block, this._lastBlock);
        validate_1.validateBlockSlot(block, this._lastBlock, this.slots);
        verify_1.verifyReward(block.header, stateStore, this.numberOfValidators);
        await verify_1.verifyBlockGenerator(block.header, this.slots, stateStore);
    }
    async saveBlock(block, stateStore, finalizedHeight, { removeFromTempTable } = {
        removeFromTempTable: false,
    }) {
        await this.dataAccess.saveBlock(block, stateStore, finalizedHeight, removeFromTempTable);
        this.dataAccess.addBlockHeader(block.header);
        this._lastBlock = block;
        this.events.emit(constants_1.EVENT_NEW_BLOCK, {
            block,
            accounts: stateStore.account.getUpdated(),
        });
    }
    async removeBlock(block, stateStore, { saveTempBlock } = { saveTempBlock: false }) {
        if (block.header.version === this.genesisBlock.header.version) {
            throw new Error('Cannot delete genesis block');
        }
        let secondLastBlock;
        try {
            secondLastBlock = await this.dataAccess.getBlockByID(block.header.previousBlockID);
        }
        catch (error) {
            throw new Error('PreviousBlock is null');
        }
        const updatedAccounts = await this.dataAccess.deleteBlock(block, stateStore, saveTempBlock);
        await this.dataAccess.removeBlockHeader(block.header.id);
        this._lastBlock = secondLastBlock;
        this.events.emit(constants_1.EVENT_DELETE_BLOCK, {
            block,
            accounts: updatedAccounts,
        });
    }
    async getValidator(timestamp) {
        const validators = await this.getValidators();
        const currentSlot = this.slots.getSlotNumber(timestamp);
        return validators[currentSlot % validators.length];
    }
    async getValidators() {
        const validatorsBuffer = await this.dataAccess.getConsensusState(constants_1.CONSENSUS_STATE_VALIDATORS_KEY);
        if (!validatorsBuffer) {
            return [];
        }
        const { validators } = lisk_codec_1.codec.decode(schema_1.validatorsSchema, validatorsBuffer);
        return validators;
    }
    async setValidators(validators, stateStore, blockHeader) {
        if (this._getLastBootstrapHeight() > blockHeader.height) {
            debug(`Skipping updating validator since current height ${blockHeader.height} is lower than last bootstrap height ${this._getLastBootstrapHeight()}`);
            return;
        }
        const validatorsBuffer = await stateStore.consensus.get(constants_1.CONSENSUS_STATE_VALIDATORS_KEY);
        if (!validatorsBuffer) {
            throw new Error('Previous validator set must exist');
        }
        const { validators: previousValidators } = lisk_codec_1.codec.decode(schema_1.validatorsSchema, validatorsBuffer);
        const nextValidatorSet = [];
        for (const nextValidator of validators) {
            const previousInfo = previousValidators.find(pv => pv.address.equals(nextValidator.address));
            nextValidatorSet.push({
                ...nextValidator,
                minActiveHeight: previousInfo !== undefined ? previousInfo.minActiveHeight : blockHeader.height + 1,
            });
        }
        const encodedValidators = lisk_codec_1.codec.encode(schema_1.validatorsSchema, { validators: nextValidatorSet });
        await stateStore.consensus.set(constants_1.CONSENSUS_STATE_VALIDATORS_KEY, encodedValidators);
        this.events.emit(constants_1.EVENT_VALIDATORS_CHANGED, { validators: nextValidatorSet });
    }
    async _cacheBlockHeaders(storageLastBlock) {
        const fromHeight = Math.max(storageLastBlock.header.height - constants_1.DEFAULT_MAX_BLOCK_HEADER_CACHE, 0);
        const toHeight = storageLastBlock.header.height;
        debug({ h: storageLastBlock.header.height, fromHeight, toHeight }, 'Cache block headers during chain init');
        const blockHeaders = await this.dataAccess.getBlockHeadersByHeightBetween(fromHeight, toHeight);
        const sortedBlockHeaders = [...blockHeaders].sort((a, b) => a.height - b.height);
        for (const blockHeader of sortedBlockHeaders) {
            debug({ height: blockHeader.height }, 'Add block header to cache');
            this.dataAccess.addBlockHeader(blockHeader);
        }
    }
    _getLastBootstrapHeight() {
        return (this._numberOfValidators * this._genesisBlock.header.asset.initRounds +
            this._genesisBlock.header.height);
    }
}
exports.Chain = Chain;
//# sourceMappingURL=chain.js.map
