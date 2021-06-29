"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = void 0;
const node_1 = require("./node");
const account_1 = require("./account");
const block_1 = require("./block");
const transaction_1 = require("./transaction");
class APIClient {
    constructor(channel) {
        this._channel = channel;
    }
    async init() {
        this._schemas = await this._channel.invoke('app:getSchema');
        this._node = new node_1.Node(this._channel);
        this._account = new account_1.Account(this._channel, this._schemas);
        this._block = new block_1.Block(this._channel, this._schemas);
        this._nodeInfo = await this._node.getNodeInfo();
        this._transaction = new transaction_1.Transaction(this._channel, this._schemas, this._nodeInfo);
    }
    async disconnect() {
        return this._channel.disconnect();
    }
    async invoke(actionName, params) {
        return this._channel.invoke(actionName, params);
    }
    subscribe(eventName, cb) {
        this._channel.subscribe(eventName, cb);
    }
    get schemas() {
        return this._schemas;
    }
    get node() {
        return this._node;
    }
    get account() {
        return this._account;
    }
    get block() {
        return this._block;
    }
    get transaction() {
        return this._transaction;
    }
}
exports.APIClient = APIClient;
//# sourceMappingURL=api_client.js.map