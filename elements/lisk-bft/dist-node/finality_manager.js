"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalityManager = exports.BFTVotingLedgerSchema = exports.CONSENSUS_STATE_VALIDATOR_LEDGER_KEY = exports.EVENT_BFT_FINALIZED_HEIGHT_CHANGED = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const assert = require("assert");
const createDebug = require("debug");
const events_1 = require("events");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constant_1 = require("./constant");
const types_1 = require("./types");
const header_contradicting_1 = require("./header_contradicting");
const debug = createDebug('lisk:bft:consensus_manager');
exports.EVENT_BFT_FINALIZED_HEIGHT_CHANGED = 'EVENT_BFT_FINALIZED_HEIGHT_CHANGED';
exports.CONSENSUS_STATE_VALIDATOR_LEDGER_KEY = 'bft:votingLedger';
exports.BFTVotingLedgerSchema = {
    type: 'object',
    $id: '/bft/validators',
    title: 'Lisk BFT Validator ledger',
    required: ['validators', 'ledger'],
    properties: {
        validators: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['address', 'maxPreVoteHeight', 'maxPreCommitHeight'],
                properties: {
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    maxPreVoteHeight: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                    maxPreCommitHeight: {
                        dataType: 'uint32',
                        fieldNumber: 3,
                    },
                },
            },
        },
        ledger: {
            type: 'array',
            fieldNumber: 2,
            items: {
                type: 'object',
                required: ['height', 'prevotes', 'precommits'],
                properties: {
                    height: {
                        dataType: 'uint32',
                        fieldNumber: 1,
                    },
                    prevotes: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                    precommits: {
                        dataType: 'uint32',
                        fieldNumber: 3,
                    },
                },
            },
        },
    },
};
lisk_codec_1.codec.addSchema(exports.BFTVotingLedgerSchema);
class FinalityManager extends events_1.EventEmitter {
    constructor({ chain, finalizedHeight, threshold, }) {
        super();
        assert(threshold > 0, 'Must provide a positive threshold');
        this._chain = chain;
        this.preVoteThreshold = threshold;
        this.preCommitThreshold = threshold;
        if (this._chain.numberOfValidators <= 0) {
            throw new Error('Invalid number of validators for BFT property');
        }
        this.processingThreshold = this._chain.numberOfValidators * constant_1.BFT_ROUND_THRESHOLD - 1;
        this.maxHeaders = this._chain.numberOfValidators * 5;
        this.finalizedHeight = finalizedHeight;
    }
    async addBlockHeader(blockHeader, stateStore) {
        debug('addBlockHeader invoked');
        debug('validateBlockHeader invoked');
        const { lastBlockHeaders } = stateStore.chain;
        await this.verifyBlockHeaders(blockHeader, stateStore);
        await this.updatePrevotesPrecommits(blockHeader, stateStore, lastBlockHeaders);
        await this.updateFinalizedHeight(stateStore);
        debug('after adding block header', {
            finalizedHeight: this.finalizedHeight,
        });
        return this;
    }
    async updatePrevotesPrecommits(header, stateStore, bftBlockHeaders) {
        var _a;
        debug('updatePrevotesPrecommits invoked');
        if (header.asset.maxHeightPreviouslyForged >= header.height) {
            return false;
        }
        const { generatorPublicKey } = header;
        const generatorAddress = lisk_cryptography_1.getAddressFromPublicKey(generatorPublicKey);
        const validators = await lisk_chain_1.getValidators(stateStore);
        const validator = validators.find(v => v.address.equals(generatorAddress));
        if (!validator) {
            throw new Error(`Generator ${generatorPublicKey.toString('hex')} is not in validators set`);
        }
        if (!validator.isConsensusParticipant) {
            return false;
        }
        const votingLedger = await this._getVotingLedger(stateStore);
        const { validators: validatorsMap, ledger: ledgerMap } = votingLedger;
        const validatorState = (_a = validatorsMap.get(generatorAddress)) !== null && _a !== void 0 ? _a : {
            maxPreVoteHeight: 0,
            maxPreCommitHeight: 0,
        };
        const minValidHeightToPreCommit = this._getMinValidHeightToPreCommit(header, bftBlockHeaders);
        const validatorMinHeightActive = validator.minActiveHeight;
        const minPreCommitHeight = Math.max(header.height - this.processingThreshold, validatorMinHeightActive, minValidHeightToPreCommit, validatorState.maxPreCommitHeight + 1);
        const maxPreCommitHeight = header.height - 1;
        for (let j = minPreCommitHeight; j <= maxPreCommitHeight; j += 1) {
            const ledgerState = ledgerMap[j] || {
                prevotes: 0,
                precommits: 0,
            };
            if (ledgerState.prevotes >= this.preVoteThreshold) {
                ledgerState.precommits += 1;
                validatorState.maxPreCommitHeight = j;
                ledgerMap[j] = ledgerState;
                validatorsMap.set(generatorAddress, validatorState);
            }
        }
        const minPreVoteHeight = Math.max(validatorMinHeightActive, header.asset.maxHeightPreviouslyForged + 1, header.height - this.processingThreshold);
        const maxPreVoteHeight = header.height;
        for (let j = minPreVoteHeight; j <= maxPreVoteHeight; j += 1) {
            const ledgerState = ledgerMap[j] || {
                prevotes: 0,
                precommits: 0,
            };
            ledgerState.prevotes += 1;
            ledgerMap[j] = ledgerState;
        }
        validatorState.maxPreVoteHeight = maxPreVoteHeight;
        validatorsMap.set(generatorAddress, validatorState);
        Object.keys(ledgerMap)
            .slice(0, this.maxHeaders * -1)
            .forEach(key => {
            delete ledgerMap[key];
        });
        await this._setVotingLedger(stateStore, {
            validators: validatorsMap,
            ledger: ledgerMap,
        });
        return true;
    }
    async updateFinalizedHeight(stateStore) {
        debug('updatePreVotedAndFinalizedHeight invoked');
        const { ledger } = await this._getVotingLedger(stateStore);
        const highestHeightPreCommitted = Object.keys(ledger)
            .reverse()
            .find(key => ledger[key].precommits >= this.preCommitThreshold);
        if (!highestHeightPreCommitted) {
            return false;
        }
        const previouslyFinalizedHeight = this.finalizedHeight;
        const nextFinalizedHeight = parseInt(highestHeightPreCommitted, 10);
        if (nextFinalizedHeight <= previouslyFinalizedHeight) {
            return false;
        }
        this.finalizedHeight = nextFinalizedHeight;
        this.emit(exports.EVENT_BFT_FINALIZED_HEIGHT_CHANGED, this.finalizedHeight);
        return true;
    }
    async verifyBlockHeaders(blockHeader, stateStore) {
        debug('verifyBlockHeaders invoked');
        debug(blockHeader);
        const bftBlockHeaders = stateStore.chain.lastBlockHeaders;
        const { ledger } = await this._getVotingLedger(stateStore);
        const chainMaxHeightPrevoted = this._calculateMaxHeightPrevoted(ledger);
        if (bftBlockHeaders.length >= this.processingThreshold &&
            blockHeader.asset.maxHeightPrevoted !== chainMaxHeightPrevoted) {
            throw new types_1.BFTInvalidAttributeError(`Wrong maxHeightPrevoted in blockHeader. maxHeightPrevoted: ${blockHeader.asset.maxHeightPrevoted}, : ${chainMaxHeightPrevoted}`);
        }
        const validatorLastBlock = bftBlockHeaders.find(header => header.generatorPublicKey.equals(blockHeader.generatorPublicKey));
        if (!validatorLastBlock) {
            return true;
        }
        if (header_contradicting_1.areHeadersContradicting(validatorLastBlock, blockHeader)) {
            throw new types_1.BFTError();
        }
        return true;
    }
    async getMaxHeightPrevoted() {
        const bftState = await this._chain.dataAccess.getConsensusState(exports.CONSENSUS_STATE_VALIDATOR_LEDGER_KEY);
        const { ledger } = this._decodeVotingLedger(bftState);
        return this._calculateMaxHeightPrevoted(ledger);
    }
    _calculateMaxHeightPrevoted(ledger) {
        debug('updatePreVotedAndFinalizedHeight invoked');
        const maxHeightPreVoted = Object.keys(ledger)
            .reverse()
            .find(key => ledger[key].prevotes >= this.preVoteThreshold);
        return maxHeightPreVoted ? parseInt(maxHeightPreVoted, 10) : this.finalizedHeight;
    }
    _getMinValidHeightToPreCommit(header, bftApplicableBlocks) {
        let needleHeight = Math.max(header.asset.maxHeightPreviouslyForged, header.height - this.processingThreshold);
        const searchTillHeight = Math.max(1, header.height - this.processingThreshold);
        let previousBlockHeight = header.asset.maxHeightPreviouslyForged;
        const blocksIncludingCurrent = [header, ...bftApplicableBlocks];
        while (needleHeight >= searchTillHeight) {
            if (needleHeight === previousBlockHeight) {
                const previousBlockHeader = blocksIncludingCurrent.find(bftHeader => bftHeader.height === needleHeight);
                if (!previousBlockHeader) {
                    debug('Fail to get cached block header');
                    return 0;
                }
                if (!previousBlockHeader.generatorPublicKey.equals(header.generatorPublicKey) ||
                    previousBlockHeader.asset.maxHeightPreviouslyForged >= needleHeight) {
                    return needleHeight + 1;
                }
                previousBlockHeight = previousBlockHeader.asset.maxHeightPreviouslyForged;
                needleHeight = previousBlockHeader.asset.maxHeightPreviouslyForged;
            }
            else {
                needleHeight -= 1;
            }
        }
        return Math.max(needleHeight + 1, searchTillHeight);
    }
    async _getVotingLedger(stateStore) {
        const votingLedgerBuffer = await stateStore.consensus.get(exports.CONSENSUS_STATE_VALIDATOR_LEDGER_KEY);
        return this._decodeVotingLedger(votingLedgerBuffer);
    }
    _decodeVotingLedger(bftVotingLedgerBuffer) {
        const votingLedger = bftVotingLedgerBuffer === undefined
            ? {
                ledger: [],
                validators: [],
            }
            : lisk_codec_1.codec.decode(exports.BFTVotingLedgerSchema, bftVotingLedgerBuffer);
        const ledger = votingLedger.ledger.reduce((prev, curr) => {
            prev[curr.height] = {
                prevotes: curr.prevotes,
                precommits: curr.precommits,
            };
            return prev;
        }, {});
        const validators = votingLedger.validators.reduce((prev, curr) => {
            prev.set(curr.address, {
                maxPreVoteHeight: curr.maxPreVoteHeight,
                maxPreCommitHeight: curr.maxPreCommitHeight,
            });
            return prev;
        }, new lisk_utils_1.dataStructures.BufferMap());
        return { ledger, validators };
    }
    async _setVotingLedger(stateStore, votingLedgerMap) {
        const ledgerState = [];
        for (const height of Object.keys(votingLedgerMap.ledger)) {
            const intHeight = parseInt(height, 10);
            ledgerState.push({
                height: intHeight,
                ...votingLedgerMap.ledger[intHeight],
            });
        }
        const validatorsState = [];
        for (const [key, value] of votingLedgerMap.validators.entries()) {
            validatorsState.push({
                address: key,
                ...value,
            });
        }
        await stateStore.consensus.set(exports.CONSENSUS_STATE_VALIDATOR_LEDGER_KEY, lisk_codec_1.codec.encode(exports.BFTVotingLedgerSchema, {
            validators: validatorsState,
            ledger: ledgerState,
        }));
    }
}
exports.FinalityManager = FinalityManager;
//# sourceMappingURL=finality_manager.js.map