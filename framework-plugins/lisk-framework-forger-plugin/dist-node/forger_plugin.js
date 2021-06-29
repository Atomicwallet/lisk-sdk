"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgerPlugin = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_framework_1 = require("lisk-framework");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const db_1 = require("./db");
const config = require("./defaults");
const controllers = require("./controllers");
const BLOCKS_BATCH_TO_SYNC = 1000;
const packageJSON = require('../package.json');
const getBinaryAddress = (hexAddressStr) => Buffer.from(hexAddressStr, 'hex').toString('binary');
const getAddressBuffer = (hexAddressStr) => Buffer.from(hexAddressStr, 'hex');
class ForgerPlugin extends lisk_framework_1.BasePlugin {
    static get alias() {
        return 'forger';
    }
    static get info() {
        return {
            author: packageJSON.author,
            version: packageJSON.version,
            name: packageJSON.name,
        };
    }
    get defaults() {
        return config.defaultConfig;
    }
    get events() {
        return ['block:created', 'block:missed'];
    }
    get actions() {
        return {
            getVoters: async () => controllers.voters.getVoters(this._channel, this.codec, this._forgerPluginDB),
            getForgingInfo: async () => controllers.forgingInfo.getForgingInfo(this._channel, this.codec, this._forgerPluginDB),
        };
    }
    async load(channel) {
        const options = lisk_utils_1.objects.mergeDeep({}, config.defaultConfig.default, this.options);
        this._channel = channel;
        this._forgerPluginDB = await db_1.getDBInstance(options.dataPath);
        this._channel.once('app:ready', async () => {
            await this._setForgersList();
            await this._setTransactionFees();
            this._syncingWithNode = true;
            await this._syncForgerInfo();
            this._syncingWithNode = false;
            this._subscribeToChannel();
        });
    }
    async unload() {
        await this._forgerPluginDB.close();
    }
    async _setForgersList() {
        this._forgersList = new lisk_utils_1.dataStructures.BufferMap();
        const forgersList = await this._channel.invoke('app:getForgingStatus');
        for (const { address, forging } of forgersList) {
            this._forgersList.set(Buffer.from(address, 'hex'), forging);
        }
    }
    async _setTransactionFees() {
        const { genesisConfig } = await this._channel.invoke('app:getNodeInfo');
        this._transactionFees = {
            minFeePerByte: genesisConfig.minFeePerByte,
            baseFees: genesisConfig.baseFees,
        };
    }
    _getForgerHeaderAndPayloadInfo(block) {
        const { header, payload } = this.codec.decodeBlock(block);
        const forgerAddress = lisk_cryptography_1.getAddressFromPublicKey(Buffer.from(header.generatorPublicKey, 'hex')).toString('hex');
        const forgerAddressBuffer = getAddressBuffer(forgerAddress);
        const forgerAddressBinary = getBinaryAddress(forgerAddress);
        return {
            forgerAddress,
            forgerAddressBuffer,
            forgerAddressBinary,
            header,
            payload,
        };
    }
    async _syncForgerInfo() {
        const { header: { height: lastBlockHeight }, } = this.codec.decodeBlock(await this._channel.invoke('app:getLastBlock'));
        const { syncUptoHeight } = await db_1.getForgerSyncInfo(this._forgerPluginDB);
        if (syncUptoHeight === lastBlockHeight) {
            return;
        }
        let needleHeight;
        if (syncUptoHeight > lastBlockHeight) {
            await this._forgerPluginDB.clear();
            needleHeight = 1;
        }
        else {
            needleHeight = syncUptoHeight + 1;
        }
        while (needleHeight <= lastBlockHeight) {
            const toHeight = needleHeight +
                (needleHeight + BLOCKS_BATCH_TO_SYNC <= lastBlockHeight
                    ? BLOCKS_BATCH_TO_SYNC
                    : lastBlockHeight - needleHeight);
            const blocks = await this._channel.invoke('app:getBlocksByHeightBetween', {
                from: needleHeight,
                to: toHeight,
            });
            for (const block of blocks.reverse()) {
                const forgerPayloadInfo = this._getForgerHeaderAndPayloadInfo(block);
                await this._addForgerInfo(block, forgerPayloadInfo);
            }
            needleHeight = toHeight + 1;
        }
        await db_1.setForgerSyncInfo(this._forgerPluginDB, lastBlockHeight);
        await this._syncForgerInfo();
    }
    _subscribeToChannel() {
        this._channel.subscribe('app:block:new', async (data) => {
            const { block } = data;
            const forgerPayloadInfo = this._getForgerHeaderAndPayloadInfo(block);
            const { header: { height }, } = forgerPayloadInfo;
            await this._addForgerInfo(block, forgerPayloadInfo);
            await db_1.setForgerSyncInfo(this._forgerPluginDB, height);
        });
        this._channel.subscribe('app:block:delete', async (data) => {
            const { block } = data;
            const forgerPayloadInfo = this._getForgerHeaderAndPayloadInfo(block);
            const { header: { height }, } = forgerPayloadInfo;
            await this._revertForgerInfo(block, forgerPayloadInfo);
            await db_1.setForgerSyncInfo(this._forgerPluginDB, height);
        });
    }
    async _addForgerInfo(encodedBlock, forgerPayloadInfo) {
        const { forgerAddress, forgerAddressBuffer, forgerAddressBinary, header: { reward, height }, payload, } = forgerPayloadInfo;
        const forgerInfo = await db_1.getForgerInfo(this._forgerPluginDB, forgerAddressBinary);
        if (this._forgersList.has(forgerAddressBuffer)) {
            forgerInfo.totalProducedBlocks += 1;
            forgerInfo.totalReceivedRewards += BigInt(reward);
            forgerInfo.totalReceivedFees += this._getFee(payload, encodedBlock);
            this._channel.publish('forger:block:created', {
                reward,
                forgerAddress,
                height,
                timestamp: Date.now(),
            });
            await db_1.setForgerInfo(this._forgerPluginDB, forgerAddressBinary, { ...forgerInfo });
        }
        await this._addVotesReceived(payload);
        await this._updateMissedBlock(encodedBlock);
    }
    async _revertForgerInfo(encodedBlock, forgerPayloadInfo) {
        const { forgerAddressBuffer, forgerAddressBinary, header: { reward }, payload, } = forgerPayloadInfo;
        const forgerInfo = await db_1.getForgerInfo(this._forgerPluginDB, forgerAddressBinary);
        if (this._forgersList.has(forgerAddressBuffer)) {
            forgerInfo.totalProducedBlocks -= 1;
            forgerInfo.totalReceivedRewards -= BigInt(reward);
            forgerInfo.totalReceivedFees -= this._getFee(payload, encodedBlock);
            await db_1.setForgerInfo(this._forgerPluginDB, forgerAddressBinary, { ...forgerInfo });
        }
        await this._revertVotesReceived(payload);
    }
    _getForgerReceivedVotes(payload) {
        const forgerReceivedVotes = {};
        for (const trx of payload) {
            if (trx.moduleID === 5 && trx.assetID === 1) {
                const senderAddress = lisk_cryptography_1.getAddressFromPublicKey(Buffer.from(trx.senderPublicKey, 'hex'));
                trx.asset.votes.reduce((acc, curr) => {
                    if (this._forgersList.has(getAddressBuffer(curr.delegateAddress)) &&
                        acc[curr.delegateAddress]) {
                        acc[curr.delegateAddress].amount += BigInt(curr.amount);
                    }
                    else {
                        acc[curr.delegateAddress] = {
                            address: senderAddress,
                            amount: BigInt(curr.amount),
                        };
                    }
                    return acc;
                }, forgerReceivedVotes);
            }
        }
        return forgerReceivedVotes;
    }
    async _addVotesReceived(payload) {
        const forgerReceivedVotes = this._getForgerReceivedVotes(payload);
        for (const [delegateAddress, votesReceived] of Object.entries(forgerReceivedVotes)) {
            const forgerInfo = await db_1.getForgerInfo(this._forgerPluginDB, getBinaryAddress(delegateAddress));
            const voterIndex = forgerInfo.votesReceived.findIndex(aVote => aVote.address.equals(votesReceived.address));
            if (voterIndex === -1) {
                forgerInfo.votesReceived.push(votesReceived);
            }
            else {
                forgerInfo.votesReceived[voterIndex].amount += votesReceived.amount;
                if (forgerInfo.votesReceived[voterIndex].amount === BigInt(0)) {
                    forgerInfo.votesReceived.splice(voterIndex, 1);
                }
            }
            await db_1.setForgerInfo(this._forgerPluginDB, getBinaryAddress(delegateAddress), forgerInfo);
        }
    }
    async _revertVotesReceived(payload) {
        const forgerReceivedVotes = this._getForgerReceivedVotes(payload);
        for (const [delegateAddress, votesReceived] of Object.entries(forgerReceivedVotes)) {
            const forgerInfo = await db_1.getForgerInfo(this._forgerPluginDB, getBinaryAddress(delegateAddress));
            const voterIndex = forgerInfo.votesReceived.findIndex(aVote => aVote.address.equals(votesReceived.address));
            if (voterIndex !== -1) {
                forgerInfo.votesReceived[voterIndex].amount -= BigInt(votesReceived.amount);
                if (forgerInfo.votesReceived[voterIndex].amount === BigInt(0)) {
                    forgerInfo.votesReceived.splice(voterIndex, 1);
                }
                await db_1.setForgerInfo(this._forgerPluginDB, getBinaryAddress(delegateAddress), forgerInfo);
            }
        }
    }
    _getFee(payload, block) {
        var _a, _b;
        const { payload: payloadBuffer } = this.codec.decodeRawBlock(block);
        let fee = BigInt(0);
        for (let index = 0; index < payload.length; index += 1) {
            const trx = payload[index];
            const baseFee = (_b = (_a = this._transactionFees.baseFees.find(bf => bf.moduleID === trx.moduleID && bf.assetID === trx.assetID)) === null || _a === void 0 ? void 0 : _a.baseFee) !== null && _b !== void 0 ? _b : '0';
            const minFeeRequired = BigInt(baseFee) +
                BigInt(this._transactionFees.minFeePerByte) * BigInt(payloadBuffer[index].length);
            fee += BigInt(trx.fee) - minFeeRequired;
        }
        return fee;
    }
    async _updateMissedBlock(block) {
        const { header: { height, timestamp }, forgerAddress, } = this._getForgerHeaderAndPayloadInfo(block);
        const previousBlockStr = await this._channel.invoke('app:getBlockByHeight', {
            height: height - 1,
        });
        const { genesisConfig: { blockTime }, } = await this._channel.invoke('app:getNodeInfo');
        const { header: previousBlock } = this.codec.decodeBlock(previousBlockStr);
        const missedBlocks = Math.ceil((timestamp - previousBlock.timestamp) / blockTime) - 1;
        if (missedBlocks > 0) {
            const forgersInfo = await this._channel.invoke('app:getForgers');
            const forgersRoundLength = forgersInfo.length;
            const forgerIndex = forgersInfo.findIndex(f => f.address === forgerAddress);
            const missedBlocksByAddress = {};
            for (let index = 0; index < missedBlocks; index += 1) {
                const rawIndex = (forgerIndex - 1 - index) % forgersRoundLength;
                const forgerRoundIndex = rawIndex >= 0 ? rawIndex : rawIndex + forgersRoundLength;
                const missedForgerInfo = forgersInfo[forgerRoundIndex];
                missedBlocksByAddress[missedForgerInfo.address] =
                    missedBlocksByAddress[missedForgerInfo.address] === undefined
                        ? 1
                        : (missedBlocksByAddress[missedForgerInfo.address] += 1);
            }
            if (!this._syncingWithNode) {
                this._channel.publish('forger:block:missed', {
                    missedBlocksByAddress,
                    height,
                    timestamp: Date.now(),
                });
            }
        }
    }
}
exports.ForgerPlugin = ForgerPlugin;
//# sourceMappingURL=forger_plugin.js.map