"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BFT = exports.BFTFinalizedHeightCodecSchema = exports.EVENT_BFT_BLOCK_FINALIZED = void 0;
const lisk_codec_1 = ("../../lisk-codec");
const assert = require("assert");
const events_1 = require("events");
const lisk_chain_1 = ("../../lisk-chain");
const finality_manager_1 = require("./finality_manager");
const forkChoiceRule = require("./fork_choice_rule");
const types_1 = require("./types");
const constant_1 = require("./constant");
exports.EVENT_BFT_BLOCK_FINALIZED = 'EVENT_BFT_BLOCK_FINALIZED';
exports.BFTFinalizedHeightCodecSchema = {
    type: 'object',
    $id: '/BFT/FinalizedHeight',
    title: 'Lisk BFT Finalized Height',
    properties: {
        finalizedHeight: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
    },
    required: ['finalizedHeight'],
};
lisk_codec_1.codec.addSchema(exports.BFTFinalizedHeightCodecSchema);
class BFT extends events_1.EventEmitter {
    constructor({ chain, threshold, genesisHeight, }) {
        super();
        this._chain = chain;
        this.constants = {
            threshold,
            genesisHeight,
        };
    }
    async init(stateStore) {
        this._finalityManager = await this._initFinalityManager(stateStore);
        this.finalityManager.on(finality_manager_1.EVENT_BFT_FINALIZED_HEIGHT_CHANGED, updatedFinalizedHeight => {
            this.emit(finality_manager_1.EVENT_BFT_FINALIZED_HEIGHT_CHANGED, updatedFinalizedHeight);
        });
    }
    get finalityManager() {
        return this._finalityManager;
    }
    async applyBlockHeader(block, stateStore) {
        await this.finalityManager.addBlockHeader(block, stateStore);
        const { finalizedHeight } = this.finalityManager;
        await stateStore.consensus.set(lisk_chain_1.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY, lisk_codec_1.codec.encode(exports.BFTFinalizedHeightCodecSchema, { finalizedHeight }));
    }
    async verifyBlockHeader(blockHeader, stateStore) {
        const isCompliant = await this.isBFTProtocolCompliant(blockHeader, stateStore);
        const reward = this._chain.calculateExpectedReward(blockHeader, stateStore);
        const expectedReward = isCompliant ? reward : reward / BigInt(4);
        if (blockHeader.reward !== expectedReward) {
            throw new Error(`Invalid block reward: ${blockHeader.reward.toString()} expected: ${expectedReward.toString()}`);
        }
        await this.finalityManager.verifyBlockHeaders(blockHeader, stateStore);
    }
    forkChoice(blockHeader, lastBlockHeader) {
        const receivedBlock = {
            ...blockHeader,
            receivedAt: this._chain.slots.timeSinceGenesis(),
        };
        if (forkChoiceRule.isValidBlock(lastBlockHeader, receivedBlock)) {
            return types_1.ForkStatus.VALID_BLOCK;
        }
        if (forkChoiceRule.isIdenticalBlock(lastBlockHeader, receivedBlock)) {
            return types_1.ForkStatus.IDENTICAL_BLOCK;
        }
        if (forkChoiceRule.isDoubleForging(lastBlockHeader, receivedBlock)) {
            return types_1.ForkStatus.DOUBLE_FORGING;
        }
        if (forkChoiceRule.isTieBreak({
            slots: this._chain.slots,
            lastAppliedBlock: lastBlockHeader,
            receivedBlock,
        })) {
            return types_1.ForkStatus.TIE_BREAK;
        }
        if (forkChoiceRule.isDifferentChain(lastBlockHeader, receivedBlock)) {
            return types_1.ForkStatus.DIFFERENT_CHAIN;
        }
        return types_1.ForkStatus.DISCARD;
    }
    async isBFTProtocolCompliant(blockHeader, stateStore) {
        assert(blockHeader, 'No block was provided to be verified');
        const validators = await lisk_chain_1.getValidators(stateStore);
        const numberOfVotingValidators = validators.filter(validator => validator.isConsensusParticipant).length;
        const heightThreshold = numberOfVotingValidators * constant_1.BFT_ROUND_THRESHOLD;
        if (blockHeader.asset.maxHeightPreviouslyForged === 0) {
            return true;
        }
        if (blockHeader.height <= blockHeader.asset.maxHeightPreviouslyForged) {
            return false;
        }
        if (blockHeader.height - blockHeader.asset.maxHeightPreviouslyForged > heightThreshold) {
            return true;
        }
        const maxHeightPreviouslyForgedBlock = stateStore.chain.lastBlockHeaders.find(bftHeader => bftHeader.height === blockHeader.asset.maxHeightPreviouslyForged);
        if (!maxHeightPreviouslyForgedBlock) {
            throw new Error(`Block at height ${blockHeader.asset.maxHeightPreviouslyForged} must be in the lastBlockHeaders.`);
        }
        if (!blockHeader.generatorPublicKey.equals(maxHeightPreviouslyForgedBlock.generatorPublicKey)) {
            return false;
        }
        return true;
    }
    async getMaxHeightPrevoted() {
        return this.finalityManager.getMaxHeightPrevoted();
    }
    get finalizedHeight() {
        return this.finalityManager.finalizedHeight;
    }
    async _initFinalityManager(stateStore) {
        const storedFinalizedHeightBuffer = await stateStore.consensus.get(lisk_chain_1.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY);
        const finalizedHeight = storedFinalizedHeightBuffer === undefined
            ? this.constants.genesisHeight
            : lisk_codec_1.codec.decode(exports.BFTFinalizedHeightCodecSchema, storedFinalizedHeightBuffer).finalizedHeight;
        const finalityManager = new finality_manager_1.FinalityManager({
            chain: this._chain,
            finalizedHeight,
            threshold: this.constants.threshold,
        });
        return finalityManager;
    }
}
exports.BFT = BFT;
//# sourceMappingURL=bft.js.map
