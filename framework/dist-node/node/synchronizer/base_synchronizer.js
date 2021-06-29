"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSynchronizer = exports.EVENT_SYNCHRONIZER_SYNC_REQUIRED = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const events_1 = require("events");
const errors_1 = require("./errors");
const schemas_1 = require("../transport/schemas");
exports.EVENT_SYNCHRONIZER_SYNC_REQUIRED = 'EVENT_SYNCHRONIZER_SYNC_REQUIRED';
class BaseSynchronizer {
    constructor(logger, channel, chain, network) {
        this._stop = false;
        this._logger = logger;
        this._channel = channel;
        this._chain = chain;
        this._networkModule = network;
        this.events = new events_1.EventEmitter();
    }
    stop() {
        this._stop = true;
    }
    _restartSync(receivedBlock, reason) {
        this._logger.info({ reason }, `Restarting synchronization mechanism with reason: ${reason}`);
        this.events.emit(exports.EVENT_SYNCHRONIZER_SYNC_REQUIRED, {
            block: receivedBlock,
        });
    }
    _applyPenaltyAndRestartSync(peerId, receivedBlock, reason) {
        this._logger.info({ peerId, reason }, 'Applying penalty to peer and restarting synchronizer');
        this._networkModule.applyPenaltyOnPeer({
            peerId,
            penalty: 100,
        });
        this.events.emit(exports.EVENT_SYNCHRONIZER_SYNC_REQUIRED, {
            block: receivedBlock,
            peerId,
        });
    }
    async _getLastBlockFromNetwork(peerId) {
        const { data } = (await this._networkModule.requestFromPeer({
            procedure: 'getLastBlock',
            peerId,
        }));
        if (!data || !data.length) {
            throw new errors_1.ApplyPenaltyAndRestartError(peerId, 'Peer did not provide its last block');
        }
        return this._chain.dataAccess.decode(data);
    }
    async _getHighestCommonBlockFromNetwork(peerId, ids) {
        const blockIds = lisk_codec_1.codec.encode(schemas_1.getHighestCommonBlockRequestSchema, { ids });
        const { data } = (await this._networkModule.requestFromPeer({
            procedure: 'getHighestCommonBlock',
            peerId,
            data: blockIds,
        }));
        if (!data || !data.length) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, 'Peer did not return a common block');
        }
        return this._chain.dataAccess.decodeBlockHeader(data);
    }
    async _getBlocksFromNetwork(peerId, fromID) {
        const blockId = lisk_codec_1.codec.encode(schemas_1.getBlocksFromIdRequestSchema, { blockId: fromID });
        const { data } = (await this._networkModule.requestFromPeer({
            procedure: 'getBlocksFromId',
            peerId,
            data: blockId,
        }));
        if (!data || !data.length) {
            throw new Error('Peer did not respond with block');
        }
        const encodedData = lisk_codec_1.codec.decode(schemas_1.getBlocksFromIdResponseSchema, data);
        return encodedData.blocks.map(block => this._chain.dataAccess.decode(block));
    }
}
exports.BaseSynchronizer = BaseSynchronizer;
//# sourceMappingURL=base_synchronizer.js.map