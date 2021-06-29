"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCChannel = void 0;
const eventemitter2_1 = require("eventemitter2");
const action_1 = require("../action");
const event_1 = require("../event");
const base_channel_1 = require("./base_channel");
const ipc_client_1 = require("../ipc/ipc_client");
class IPCChannel extends base_channel_1.BaseChannel {
    constructor(moduleAlias, events, actions, options) {
        super(moduleAlias, events, actions, options);
        this._ipcClient = new ipc_client_1.IPCClient({
            socketsDir: options.socketsPath.root,
            name: moduleAlias,
            rpcServerSocketPath: `unix://${options.socketsPath.root}/bus_rpc_socket.sock`,
        });
        this._emitter = new eventemitter2_1.EventEmitter2({
            wildcard: true,
            delimiter: ':',
            maxListeners: 1000,
        });
    }
    async startAndListen() {
        await this._ipcClient.start();
        this._subSocket.on('message', (eventData) => {
            const event = event_1.Event.fromJSONRPCNotification(eventData);
            if (event.module !== this.moduleAlias) {
                this._emitter.emit(event.key(), event.toJSONRPCNotification());
            }
        });
    }
    async registerToBus() {
        await this.startAndListen();
        await new Promise((resolve, reject) => {
            let actionsInfo = {};
            actionsInfo = Object.keys(this.actions).reduce((accumulator, value) => {
                accumulator[value] = {
                    name: value,
                    module: this.moduleAlias,
                };
                return accumulator;
            }, actionsInfo);
            this._rpcClient.call('registerChannel', this.moduleAlias, this.eventsList.map((event) => event), actionsInfo, {
                type: 'ipcSocket',
                rpcSocketPath: this._ipcClient.rpcServerSocketPath,
            }, (err, result) => {
                if (err !== undefined && err !== null) {
                    reject(err);
                }
                resolve(result);
            });
        });
        if (this.actionsList.length > 0) {
            this._rpcServer.expose('invoke', (action, cb) => {
                const parsedAction = action_1.Action.fromJSONRPCRequest(action);
                this.invoke(parsedAction.key(), parsedAction.params)
                    .then(data => cb(null, parsedAction.buildJSONRPCResponse({ result: data })))
                    .catch(error => cb(error));
            });
        }
    }
    subscribe(eventName, cb) {
        const event = new event_1.Event(eventName);
        this._emitter.on(event.key(), (notification) => setImmediate(cb, event_1.Event.fromJSONRPCNotification(notification).data));
    }
    once(eventName, cb) {
        const event = new event_1.Event(eventName);
        this._emitter.once(event.key(), (notification) => {
            setImmediate(cb, event_1.Event.fromJSONRPCNotification(notification).data);
        });
    }
    publish(eventName, data) {
        const event = new event_1.Event(eventName, data);
        if (event.module !== this.moduleAlias || !this.eventsList.includes(event.name)) {
            throw new Error(`Event "${eventName}" not registered in "${this.moduleAlias}" module.`);
        }
        this._pubSocket.send(event.toJSONRPCNotification());
    }
    async invoke(actionName, params) {
        var _a;
        const action = new action_1.Action(null, actionName, params);
        if (action.module === this.moduleAlias) {
            const handler = (_a = this.actions[action.name]) === null || _a === void 0 ? void 0 : _a.handler;
            if (!handler) {
                throw new Error('Handler does not exist.');
            }
            return handler(action.params);
        }
        return new Promise((resolve, reject) => {
            this._rpcClient.call('invoke', action.toJSONRPCRequest(), (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res.result);
            });
        });
    }
    cleanup(_status, _message) {
        this._ipcClient.stop();
    }
    get _rpcServer() {
        return this._ipcClient.rpcServer;
    }
    get _rpcClient() {
        return this._ipcClient.rpcClient;
    }
    get _pubSocket() {
        return this._ipcClient.pubSocket;
    }
    get _subSocket() {
        return this._ipcClient.subSocket;
    }
}
exports.IPCChannel = IPCChannel;
//# sourceMappingURL=ipc_channel.js.map