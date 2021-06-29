"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broadcaster = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const schemas_1 = require("./schemas");
const ENDPOINT_BROADCAST_TRANSACTIONS = 'postTransactionsAnnouncement';
class Broadcaster {
    constructor({ transactionPool, releaseLimit, interval, logger, networkModule, }) {
        this._logger = logger;
        this._transactionPool = transactionPool;
        this._networkModule = networkModule;
        this._config = {
            releaseLimit,
            interval,
        };
        this._transactionIdQueue = [];
        setInterval(() => {
            try {
                this._broadcast();
            }
            catch (err) {
                this._logger.error({ err }, 'Failed to broadcast information');
            }
        }, this._config.interval);
    }
    enqueueTransactionId(transactionId) {
        if (this._transactionIdQueue.find(id => id.equals(transactionId)) !== undefined) {
            return false;
        }
        this._transactionIdQueue.push(transactionId);
        return true;
    }
    _broadcast() {
        this._transactionIdQueue = this._transactionIdQueue.filter(id => this._transactionPool.contains(id));
        if (this._transactionIdQueue.length > 0) {
            const transactionIds = this._transactionIdQueue.slice(0, this._config.releaseLimit);
            const data = lisk_codec_1.codec.encode(schemas_1.transactionIdsSchema, { transactionIds });
            this._networkModule.broadcast({
                event: ENDPOINT_BROADCAST_TRANSACTIONS,
                data,
            });
            this._transactionIdQueue = this._transactionIdQueue.filter(id => !transactionIds.includes(id));
        }
    }
}
exports.Broadcaster = Broadcaster;
//# sourceMappingURL=broadcaster.js.map