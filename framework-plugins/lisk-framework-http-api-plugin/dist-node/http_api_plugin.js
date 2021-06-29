"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPAPIPlugin = void 0;
const lisk_framework_1 = require("lisk-framework");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const controllers = require("./controllers");
const middlewares = require("./middlewares");
const config = require("./defaults");
const pJSON = require('../package.json');
class HTTPAPIPlugin extends lisk_framework_1.BasePlugin {
    static get alias() {
        return 'httpApi';
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
        return {};
    }
    async load(channel) {
        this._app = express();
        const options = lisk_utils_1.objects.mergeDeep({}, config.defaultConfig.default, this.options);
        this._channel = channel;
        this._channel.once('app:ready', () => {
            this._registerMiddlewares(options);
            this._registerControllers();
            this._registerAfterMiddlewares(options);
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
        this._app.get('/api/transactions/:id', controllers.transactions.getTransaction(this._channel, this.codec));
        this._app.post('/api/transactions', controllers.transactions.postTransaction(this._channel, this.codec));
        this._app.get('/api/accounts/:address', controllers.accounts.getAccount(this._channel, this.codec));
        this._app.get('/api/node/info', controllers.node.getNodeInfo(this._channel));
        this._app.get('/api/blocks/:id', controllers.blocks.getBlockById(this._channel, this.codec));
        this._app.get('/api/blocks', controllers.blocks.getBlockByHeight(this._channel, this.codec));
        this._app.get('/api/node/transactions', controllers.node.getTransactions(this._channel, this.codec));
        this._app.get('/api/peers', controllers.peers.getPeers(this._channel));
        this._app.get('/api/delegates', controllers.delegates.getDelegates(this._channel, this.codec));
        this._app.get('/api/forgers', controllers.forgers.getForgers(this._channel, this.codec));
        this._app.get('/api/forging/info', controllers.forging.getForgingStatus(this._channel));
        this._app.patch('/api/forging', controllers.forging.updateForging(this._channel));
    }
}
exports.HTTPAPIPlugin = HTTPAPIPlugin;
//# sourceMappingURL=http_api_plugin.js.map