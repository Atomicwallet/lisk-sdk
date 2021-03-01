"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const errors_1 = require("./errors");
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
        return this._chain.dataAccess.decode(Buffer.from(data, 'hex'));
    }
    async _getHighestCommonBlockFromNetwork(peerId, ids) {
        const { data } = (await this._networkModule.requestFromPeer({
            procedure: 'getHighestCommonBlock',
            peerId,
            data: {
                ids: ids.map(id => id.toString('hex')),
            },
        }));
        if (!data || !data.length) {
            throw new errors_1.ApplyPenaltyAndAbortError(peerId, 'Peer did not return a common block');
        }
        return this._chain.dataAccess.decodeBlockHeader(Buffer.from(data, 'hex'));
    }
    async _getBlocksFromNetwork(peerId, fromID) {
        const { data } = (await this._networkModule.requestFromPeer({
            procedure: 'getBlocksFromId',
            peerId,
            data: {
                blockId: fromID.toString('hex'),
            },
        }));
        if (!data || !data.length) {
            throw new Error('Peer did not respond with block');
        }
        return data.map(d => this._chain.dataAccess.decode(Buffer.from(d, 'hex')));
    }
}
exports.BaseSynchronizer = BaseSynchronizer;
//# sourceMappingURL=base_synchronizer.js.map