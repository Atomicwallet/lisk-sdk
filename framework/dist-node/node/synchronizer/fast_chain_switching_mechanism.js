"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastChainSwitchingMechanism = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const base_synchronizer_1 = require("./base_synchronizer");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
class FastChainSwitchingMechanism extends base_synchronizer_1.BaseSynchronizer {
    constructor({ logger, channel, chain, bft, processor, networkModule, }) {
        super(logger, channel, chain, networkModule);
        this._chain = chain;
        this.bft = bft;
        this.processor = processor;
    }
    async run(receivedBlock, peerId) {
        try {
            const highestCommonBlock = await this._requestLastCommonBlock(peerId);
            const blocks = await this._queryBlocks(receivedBlock, highestCommonBlock, peerId);
            this._validateBlocks(blocks, peerId);
            await this._switchChain(highestCommonBlock, blocks, peerId);
        }
        catch (error) {
            if (error instanceof errors_1.ApplyPenaltyAndAbortError) {
                this._applyPenaltyAndRestartSync(error.peerId, receivedBlock, error.reason);
                return;
            }
            if (error instanceof errors_1.RestartError) {
                this._restartSync(receivedBlock, error.reason);
                return;
            }
            if (error instanceof errors_1.AbortError) {
                this._logger.info({ err: error, reason: error.reason }, `Aborting synchronization mechanism with reason: ${error.reason}`);
                return;
            }
            throw error;
        }
    }
    async isValidFor(receivedBlock, peerId) {
        if (!peerId) {
            return false;
        }
        const { lastBlock } = this._chain;
        const twoRounds = this._chain.numberOfValidators * 2;
        if (Math.abs(receivedBlock.header.height - lastBlock.header.height) > twoRounds) {
            return false;
        }
        const generatorAddress = lisk_cryptography_1.getAddressFromPublicKey(receivedBlock.header.generatorPublicKey);
        const validators = await this._chain.getValidators();
        return (validators.find(v => v.address.equals(generatorAddress) && v.isConsensusParticipant) !==
            undefined);
    }
    async _requestBlocksWithinIDs(peerId, fromId, toId) {
        const maxFailedAttempts = 10;
        const blocks = [];
        let failedAttempts = 0;
        let lastFetchedID = fromId;
        while (failedAttempts < maxFailedAttempts) {
            let chunkOfBlocks = [];
            try {
                chunkOfBlocks = await this._getBlocksFromNetwork(peerId, lastFetchedID);
            }
            catch (error) {
                failedAttempts += 1;
                continue;
            }
            chunkOfBlocks.sort((a, b) => a.header.height - b.header.height);
            blocks.push(...chunkOfBlocks);
            [
                {
                    header: { id: lastFetchedID },
                },
            ] = chunkOfBlocks.slice(-1);
            const index = blocks.findIndex(block => block.header.id.equals(toId));
            if (index > -1) {
                return blocks.splice(0, index + 1);
            }
        }
        return blocks;
    }
    async _queryBlocks(receivedBlock, highestCommonBlock, peerId) {
        if (!highestCommonBlock) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, "Peer didn't return a common block");
        }
        if (highestCommonBlock.height < this.bft.finalizedHeight) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, `Common block height ${highestCommonBlock.height} is lower than the finalized height of the chain ${this.bft.finalizedHeight}`);
        }
        if (this._chain.lastBlock.header.height - highestCommonBlock.height >
            this._chain.numberOfValidators * 2 ||
            receivedBlock.header.height - highestCommonBlock.height > this._chain.numberOfValidators * 2) {
            throw new errors_1.AbortError(`Height difference between both chains is higher than ${this._chain.numberOfValidators * 2}`);
        }
        this._logger.debug({
            peerId,
            fromBlockId: highestCommonBlock.id,
            toBlockId: receivedBlock.header.id,
        }, 'Requesting blocks within ID range from peer');
        const blocks = await this._requestBlocksWithinIDs(peerId, highestCommonBlock.id, receivedBlock.header.id);
        if (!blocks.length) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, `Peer didn't return any requested block within IDs ${highestCommonBlock.id.toString('hex')} and ${receivedBlock.header.id.toString('hex')}`);
        }
        return blocks;
    }
    _validateBlocks(blocks, peerId) {
        this._logger.debug({
            blocks: blocks.map(block => ({
                blockId: block.header.id,
                height: block.header.height,
            })),
        }, 'Validating blocks');
        try {
            for (const block of blocks) {
                this._logger.trace({
                    blockId: block.header.id,
                    height: block.header.height,
                }, 'Validating block');
                this.processor.validate(block);
            }
        }
        catch (err) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, 'Block validation failed');
        }
        this._logger.debug('Successfully validated blocks');
    }
    async _applyBlocks(blocksToApply) {
        try {
            for (const block of blocksToApply) {
                if (this._stop) {
                    return;
                }
                this._logger.trace({
                    blockId: block.header.id,
                    height: block.header.height,
                }, 'Applying blocks');
                await this.processor.processValidated(block);
            }
        }
        catch (e) {
            throw new errors_1.BlockProcessingError();
        }
    }
    async _handleBlockProcessingFailure(error, highestCommonBlock, peerId) {
        this._logger.error({ err: error }, 'Error while processing blocks');
        this._logger.debug({ height: highestCommonBlock.height }, 'Deleting blocks after height');
        await utils_1.deleteBlocksAfterHeight(this.processor, this._chain, this._logger, highestCommonBlock.height);
        this._logger.debug('Restoring blocks from temporary table');
        await utils_1.restoreBlocks(this._chain, this.processor);
        throw new errors_1.ApplyPenaltyAndAbortError(peerId, 'Detected invalid block while processing list of requested blocks');
    }
    async _switchChain(highestCommonBlock, blocksToApply, peerId) {
        this._logger.info('Switching chain');
        this._logger.debug({ height: highestCommonBlock.height }, `Deleting blocks after height ${highestCommonBlock.height}`);
        await utils_1.deleteBlocksAfterHeight(this.processor, this._chain, this._logger, highestCommonBlock.height, true);
        try {
            this._logger.debug({
                blocks: blocksToApply.map(block => ({
                    blockId: block.header.id,
                    height: block.header.height,
                })),
            }, 'Applying blocks');
            await this._applyBlocks(blocksToApply);
            this._logger.info({
                currentHeight: this._chain.lastBlock.header.height,
                highestCommonBlockHeight: highestCommonBlock.height,
            }, 'Successfully switched chains. Node is now up to date');
        }
        catch (err) {
            if (err instanceof errors_1.BlockProcessingError) {
                await this._handleBlockProcessingFailure(err, highestCommonBlock, peerId);
            }
            else {
                throw err;
            }
        }
        finally {
            this._logger.debug('Cleaning blocks temp table');
            await utils_1.clearBlocksTempTable(this._chain);
        }
    }
    _computeLastTwoRoundsHeights() {
        return new Array(Math.min(this._chain.numberOfValidators * 2, this._chain.lastBlock.header.height))
            .fill(0)
            .map((_, index) => this._chain.lastBlock.header.height - index);
    }
    async _requestLastCommonBlock(peerId) {
        this._logger.debug({ peerId }, 'Requesting the last common block with peer');
        const requestLimit = 10;
        let numberOfRequests = 1;
        const heightList = this._computeLastTwoRoundsHeights();
        while (numberOfRequests < requestLimit) {
            const blockIds = (await this._chain.dataAccess.getBlockHeadersWithHeights(heightList)).map(block => block.id);
            try {
                const commonBlock = await this._getHighestCommonBlockFromNetwork(peerId, blockIds);
                return commonBlock;
            }
            catch (error) {
                numberOfRequests += 1;
            }
        }
        return undefined;
    }
}
exports.FastChainSwitchingMechanism = FastChainSwitchingMechanism;
//# sourceMappingURL=fast_chain_switching_mechanism.js.map