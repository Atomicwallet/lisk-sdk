"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorPlugin = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_framework_1 = require("lisk-framework");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const middlewares = require("./middlewares");
const config = require("./defaults");
const controllers = require("./controllers");
const schema_1 = require("./schema");
const pJSON = require('../package.json');
class MonitorPlugin extends lisk_framework_1.BasePlugin {
    static get alias() {
        return 'monitor';
    }
    static get info() {
        return {
            author: pJSON.author,
            version: pJSON.version,
            name: pJSON.name,
        };
    }
    get defaults() {
        return config.defaultConfig;
    }
    get events() {
        return [];
    }
    get actions() {
        return {
            getTransactionStats: async () => controllers.transactions.getTransactionStats(this._channel, this._state),
            getBlockStats: async () => controllers.blocks.getBlockStats(this._channel, this._state),
            getNetworkStats: async () => controllers.network.getNetworkStats(this._channel),
            getForkStats: () => controllers.forks.getForkStats(this._state),
        };
    }
    async load(channel) {
        this._app = express();
        const options = lisk_utils_1.objects.mergeDeep({}, config.defaultConfig.default, this.options);
        this._channel = channel;
        this._state = {
            forks: {
                forkEventCount: 0,
                blockHeaders: {},
            },
            transactions: {},
            blocks: {},
        };
        this._channel.once('app:ready', () => {
            this._registerMiddlewares(options);
            this._registerControllers();
            this._registerAfterMiddlewares(options);
            this._subscribeToEvents();
            this._server = this._app.listen(options.port, options.host);
        });
    }
    async unload() {
        await new Promise((resolve, reject) => {
            this._server.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    get state() {
        return this._state;
    }
    _registerMiddlewares(options) {
        this._app.use(cors(options.cors));
        this._app.use(express.json());
        this._app.use(rateLimit(options.limits));
        this._app.use(middlewares.whiteListMiddleware(options));
    }
    _registerAfterMiddlewares(_options) {
        this._app.use(middlewares.errorMiddleware());
    }
    _registerControllers() {
        this._app.get('/api/prometheus/metrics', controllers.prometheusExport.getData(this._channel, this._state));
    }
    _subscribeToEvents() {
        this._channel.subscribe('app:network:event', (eventData) => {
            const { event, data } = eventData;
            if (event === 'postTransactionsAnnouncement') {
                const errors = lisk_validator_1.validator.validate(schema_1.transactionAnnouncementSchema, data);
                if (errors.length > 0) {
                    return;
                }
                this._handlePostTransactionAnnounce(data);
            }
            if (event === 'postBlock') {
                const errors = lisk_validator_1.validator.validate(schema_1.postBlockEventSchema, data);
                if (errors.length > 0) {
                    return;
                }
                this._handlePostBlock(data);
            }
        });
        this._channel.subscribe('app:chain:fork', (data) => {
            const { block } = data;
            this._handleFork(block);
        });
    }
    _handlePostTransactionAnnounce(data) {
        for (const aTransactionId of data.transactionIds) {
            if (this._state.transactions[aTransactionId]) {
                this._state.transactions[aTransactionId].count += 1;
            }
            else {
                this._state.transactions[aTransactionId] = {
                    count: 1,
                    timeReceived: Date.now(),
                };
                this._cleanUpTransactionStats();
            }
        }
    }
    _cleanUpTransactionStats() {
        const expiryTime = 600000;
        for (const transactionID of Object.keys(this._state.transactions)) {
            if (Date.now() - this._state.transactions[transactionID].timeReceived > expiryTime) {
                delete this._state.transactions[transactionID];
            }
        }
    }
    _handleFork(block) {
        this._state.forks.forkEventCount += 1;
        const { header } = lisk_codec_1.codec.decode(this.schemas.block, Buffer.from(block, 'hex'));
        const blockId = lisk_cryptography_1.hash(header).toString('hex');
        if (this._state.forks.blockHeaders[blockId]) {
            this._state.forks.blockHeaders[blockId].timeReceived = Date.now();
        }
        else {
            const decodedHeader = lisk_codec_1.codec.decodeJSON(this.schemas.blockHeader, header);
            this._state.forks.blockHeaders[blockId] = {
                blockHeader: decodedHeader,
                timeReceived: Date.now(),
            };
        }
    }
    _handlePostBlock(data) {
        const decodedBlock = lisk_codec_1.codec.decode(this.schemas.block, Buffer.from(data.block, 'hex'));
        const decodedBlockHeader = lisk_codec_1.codec.decode(this.schemas.blockHeader, decodedBlock.header);
        const blockId = lisk_cryptography_1.hash(decodedBlock.header);
        if (!this._state.blocks[blockId.toString('hex')]) {
            this._state.blocks[blockId.toString('hex')] = {
                count: 0,
                height: decodedBlockHeader.height,
            };
        }
        this._state.blocks[blockId.toString('hex')].count += 1;
        for (const id of Object.keys(this._state.blocks)) {
            const blockInfo = this._state.blocks[id];
            if (blockInfo.height < decodedBlockHeader.height - 300) {
                delete this._state.blocks[id];
            }
        }
    }
}
exports.MonitorPlugin = MonitorPlugin;
//# sourceMappingURL=monitor_plugin.js.map