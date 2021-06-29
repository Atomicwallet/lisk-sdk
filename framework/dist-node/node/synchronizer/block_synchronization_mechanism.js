"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSynchronizationMechanism = void 0;
const lisk_bft_1 = require("@liskhq/lisk-bft");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const base_synchronizer_1 = require("./base_synchronizer");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const groupByPeer = (peers) => {
    const groupedPeers = new lisk_utils_1.dataStructures.BufferMap();
    for (const peer of peers) {
        let grouped = groupedPeers.get(peer.options.lastBlockID);
        if (grouped === undefined) {
            grouped = [];
        }
        grouped.push(peer);
        groupedPeers.set(peer.options.lastBlockID, grouped);
    }
    return groupedPeers;
};
class BlockSynchronizationMechanism extends base_synchronizer_1.BaseSynchronizer {
    constructor({ logger, channel, bft, chain, processorModule, networkModule, }) {
        super(logger, channel, chain, networkModule);
        this.bft = bft;
        this._chain = chain;
        this.processorModule = processorModule;
    }
    async run(receivedBlock) {
        try {
            const bestPeer = this._computeBestPeer();
            await this._requestAndValidateLastBlock(bestPeer.peerId);
            const lastCommonBlock = await this._revertToLastCommonBlock(bestPeer.peerId);
            await this._requestAndApplyBlocksToCurrentChain(receivedBlock, lastCommonBlock, bestPeer.peerId);
        }
        catch (error) {
            if (error instanceof errors_1.ApplyPenaltyAndRestartError) {
                this._applyPenaltyAndRestartSync(error.peerId, receivedBlock, error.reason);
                return;
            }
            if (error instanceof errors_1.RestartError) {
                this._restartSync(receivedBlock, error.reason);
                return;
            }
            if (error instanceof errors_1.AbortError) {
                this._logger.info({ error, reason: error.reason }, 'Aborting synchronization mechanism');
                return;
            }
            throw error;
        }
    }
    async isValidFor() {
        const finalizedBlock = await this._chain.dataAccess.getBlockHeaderByHeight(this.bft.finalizedHeight);
        const finalizedBlockSlot = this._chain.slots.getSlotNumber(finalizedBlock.timestamp);
        const currentBlockSlot = this._chain.slots.getSlotNumber();
        const threeRounds = this._chain.numberOfValidators * 3;
        return currentBlockSlot - finalizedBlockSlot > threeRounds;
    }
    async _requestAndApplyBlocksWithinIDs(peerId, fromId, toId) {
        const maxFailedAttempts = 10;
        let failedAttempts = 0;
        let lastFetchedID = fromId;
        let finished = false;
        while (!finished && failedAttempts < maxFailedAttempts) {
            let blocks = [];
            try {
                blocks = await this._getBlocksFromNetwork(peerId, lastFetchedID);
            }
            catch (error) {
                failedAttempts += 1;
                continue;
            }
            blocks.sort((a, b) => a.header.height - b.header.height);
            [
                {
                    header: { id: lastFetchedID },
                },
            ] = blocks.slice(-1);
            const index = blocks.findIndex(block => block.header.id.equals(toId));
            if (index > -1) {
                blocks.splice(index + 1);
            }
            this._logger.debug({
                fromId: blocks[0].header.id,
                toId: blocks[blocks.length - 1].header.id,
            }, 'Applying obtained blocks from peer');
            try {
                for (const block of blocks) {
                    if (this._stop) {
                        return;
                    }
                    this.processorModule.validate(block);
                    await this.processorModule.processValidated(block);
                }
            }
            catch (err) {
                this._logger.error({ err: err }, 'Block processing failed');
                throw new errors_1.BlockProcessingError();
            }
            finished = this._chain.lastBlock.header.id.equals(toId);
        }
        if (failedAttempts === maxFailedAttempts) {
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, "Peer didn't return any block after requesting blocks");
        }
    }
    async _handleBlockProcessingError(lastCommonBlock, peerId) {
        this._logger.debug('Failed to apply obtained blocks from peer');
        const tempBlocks = await this._chain.dataAccess.getTempBlocks();
        const [tipBeforeApplying] = [...tempBlocks].sort((a, b) => b.header.height - a.header.height);
        if (!tipBeforeApplying) {
            this._logger.error('Blocks temp table should not be empty');
            throw new errors_1.RestartError('Blocks temp table should not be empty');
        }
        const forkStatus = this.bft.forkChoice(this._chain.lastBlock.header, tipBeforeApplying.header);
        const newTipHasPreference = forkStatus === lisk_bft_1.ForkStatus.DIFFERENT_CHAIN;
        if (!newTipHasPreference) {
            this._logger.debug({
                currentTip: this._chain.lastBlock.header.id,
                previousTip: tipBeforeApplying.header.id,
            }, 'Previous tip of the chain has preference over current tip. Restoring chain from temp table');
            try {
                this._logger.debug({ height: lastCommonBlock.height }, 'Deleting blocks after height');
                await utils_1.deleteBlocksAfterHeight(this.processorModule, this._chain, this._logger, lastCommonBlock.height);
                this._logger.debug('Restoring blocks from temporary table');
                await utils_1.restoreBlocks(this._chain, this.processorModule);
                this._logger.debug('Cleaning blocks temp table');
                await utils_1.clearBlocksTempTable(this._chain);
            }
            catch (error) {
                this._logger.error({ err: error }, 'Failed to restore blocks from blocks temp table');
            }
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, 'New tip of the chain has no preference over the previous tip before synchronizing');
        }
        this._logger.debug({
            currentTip: this._chain.lastBlock.header.id,
            previousTip: tipBeforeApplying.header.id,
        }, 'Current tip of the chain has preference over previous tip');
        this._logger.debug('Cleaning blocks temporary table');
        await utils_1.clearBlocksTempTable(this._chain);
        this._logger.info('Restarting block synchronization');
        throw new errors_1.RestartError('The list of blocks has not been fully applied. Trying again');
    }
    async _requestAndApplyBlocksToCurrentChain(receivedBlock, lastCommonBlock, peerId) {
        this._logger.debug({
            peerId,
            from: {
                blockId: lastCommonBlock.id,
                height: lastCommonBlock.height,
            },
            to: {
                blockId: receivedBlock.header.id,
                height: receivedBlock.header.height,
            },
        }, 'Requesting blocks within ID range from peer');
        try {
            await this._requestAndApplyBlocksWithinIDs(peerId, lastCommonBlock.id, receivedBlock.header.id);
        }
        catch (err) {
            if (!(err instanceof errors_1.BlockProcessingError)) {
                throw err;
            }
            await this._handleBlockProcessingError(lastCommonBlock, peerId);
        }
        this._logger.debug('Cleaning up blocks temporary table');
        await utils_1.clearBlocksTempTable(this._chain);
        this._logger.debug({ peerId }, 'Successfully requested and applied blocks from peer');
        return true;
    }
    async _revertToLastCommonBlock(peerId) {
        this._logger.debug({ peerId }, 'Reverting chain to the last common block with peer');
        this._logger.debug({ peerId }, 'Requesting the last common block from peer');
        const lastCommonBlock = await this._requestLastCommonBlock(peerId);
        if (!lastCommonBlock) {
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, 'No common block has been found between the chain and the targeted peer');
        }
        this._logger.debug({
            blockId: lastCommonBlock.id,
            height: lastCommonBlock.height,
        }, 'Found common block');
        if (lastCommonBlock.height < this.bft.finalizedHeight) {
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, 'The last common block height is less than the finalized height of the current chain');
        }
        this._logger.debug({
            blockId: lastCommonBlock.id,
            height: lastCommonBlock.height,
        }, 'Deleting blocks after common block');
        await utils_1.deleteBlocksAfterHeight(this.processorModule, this._chain, this._logger, lastCommonBlock.height, true);
        this._logger.debug({ lastBlockID: this._chain.lastBlock.header.id }, 'Successfully deleted blocks');
        return lastCommonBlock;
    }
    async _requestLastCommonBlock(peerId) {
        const blocksPerRequestLimit = 10;
        const requestLimit = 3;
        let numberOfRequests = 1;
        let highestCommonBlock;
        let currentRound = Math.ceil(this._chain.lastBlock.header.height / this._chain.numberOfValidators);
        let currentHeight = currentRound * this._chain.numberOfValidators;
        while (!highestCommonBlock &&
            numberOfRequests < requestLimit &&
            currentHeight >= this.bft.finalizedHeight) {
            const heightList = utils_1.computeBlockHeightsList(this.bft.finalizedHeight, this._chain.numberOfValidators, blocksPerRequestLimit, currentRound);
            const blockHeaders = await this._chain.dataAccess.getBlockHeadersWithHeights(heightList);
            let data;
            try {
                data = await this._getHighestCommonBlockFromNetwork(peerId, blockHeaders.map(block => block.id));
            }
            catch (e) {
                numberOfRequests += 1;
                continue;
            }
            highestCommonBlock = data;
            currentRound -= blocksPerRequestLimit;
            currentHeight = currentRound * this._chain.numberOfValidators;
        }
        return highestCommonBlock;
    }
    async _requestAndValidateLastBlock(peerId) {
        this._logger.debug({ peerId }, 'Requesting tip of the chain from peer');
        const networkLastBlock = await this._getLastBlockFromNetwork(peerId);
        this._logger.debug({ peerId, blockId: networkLastBlock.header.id }, 'Received tip of the chain from peer');
        const { valid: validBlock } = this._blockDetachedStatus(networkLastBlock);
        const forkStatus = this.bft.forkChoice(networkLastBlock.header, this._chain.lastBlock.header);
        const inDifferentChain = forkStatus === lisk_bft_1.ForkStatus.DIFFERENT_CHAIN ||
            networkLastBlock.header.id.equals(this._chain.lastBlock.header.id);
        if (!validBlock || !inDifferentChain) {
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, 'The tip of the chain of the peer is not valid or is not in a different chain');
        }
    }
    _blockDetachedStatus(networkLastBlock) {
        try {
            this.processorModule.validate(networkLastBlock);
            return { valid: true, err: null };
        }
        catch (err) {
            return { valid: false, err: err };
        }
    }
    _computeBestPeer() {
        const peers = this._networkModule.getConnectedPeers();
        if (!peers.length) {
            throw new Error('List of connected peers is empty');
        }
        this._logger.trace({ peers: peers.map(peer => peer.peerId) }, 'List of connected peers');
        const requiredProps = ['blockVersion', 'maxHeightPrevoted', 'height'];
        const compatiblePeers = peers.filter(p => requiredProps.every(prop => Object.keys(p.options).includes(prop)));
        if (!compatiblePeers.length) {
            throw new Error('Connected compatible peers list is empty');
        }
        this._logger.trace({ peers: compatiblePeers.map(peer => peer.peerId) }, 'List of compatible peers connected peers');
        this._logger.debug('Computing the best peer to synchronize from');
        const largestSubsetBymaxHeightPrevoted = utils_1.computeLargestSubsetMaxBy(compatiblePeers, peer => peer.options.maxHeightPrevoted);
        const largestSubsetByHeight = utils_1.computeLargestSubsetMaxBy(largestSubsetBymaxHeightPrevoted, peer => peer.options.height);
        const peersGroupedByBlockId = groupByPeer(largestSubsetByHeight);
        const blockIds = peersGroupedByBlockId.entries();
        let maxNumberOfPeersInSet = 0;
        let selectedPeers = [];
        let selectedBlockId = blockIds[0][0];
        for (const [blockId, peersByBlockId] of blockIds) {
            const numberOfPeersInSet = peersByBlockId.length;
            if (numberOfPeersInSet > maxNumberOfPeersInSet ||
                (numberOfPeersInSet === maxNumberOfPeersInSet && selectedBlockId.compare(blockId) > 0)) {
                maxNumberOfPeersInSet = numberOfPeersInSet;
                selectedPeers = peersByBlockId;
                selectedBlockId = blockId;
            }
        }
        const randomPeerIndex = Math.floor(Math.random() * selectedPeers.length);
        const peersTip = {
            id: Buffer.alloc(0),
            height: selectedPeers[randomPeerIndex].options.height,
            version: selectedPeers[randomPeerIndex].options.blockVersion,
            previousBlockID: Buffer.alloc(0),
            asset: {
                maxHeightPrevoted: selectedPeers[randomPeerIndex].options.maxHeightPrevoted,
            },
        };
        const forkStatus = this.bft.forkChoice(peersTip, this._chain.lastBlock.header);
        const tipHasPreference = forkStatus === lisk_bft_1.ForkStatus.DIFFERENT_CHAIN;
        if (!tipHasPreference) {
            throw new errors_1.AbortError(`Peer tip does not have preference over current tip. Fork status: ${forkStatus}`);
        }
        const bestPeer = selectedPeers[Math.floor(Math.random() * selectedPeers.length)];
        this._logger.debug({ peer: bestPeer }, 'Successfully computed the best peer');
        return bestPeer;
    }
}
exports.BlockSynchronizationMechanism = BlockSynchronizationMechanism;
//# sourceMappingURL=block_synchronization_mechanism.js.map