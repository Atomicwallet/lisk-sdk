"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bus = void 0;
const eventemitter2_1 = require("eventemitter2");
const axon = require("pm2-axon");
const pm2_axon_rpc_1 = require("pm2-axon-rpc");
const action_1 = require("./action");
const event_1 = require("./event");
const ipc_server_1 = require("./ipc/ipc_server");
const JSONRPC = require("./jsonrpc");
const ws_server_1 = require("./ws/ws_server");
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["InMemory"] = 0] = "InMemory";
    ChannelType[ChannelType["ChildProcess"] = 1] = "ChildProcess";
})(ChannelType || (ChannelType = {}));
const parseError = (id, err) => {
    if (err instanceof JSONRPC.JSONRPCError) {
        return err;
    }
    return new JSONRPC.JSONRPCError(err.message, JSONRPC.errorResponse(id, JSONRPC.internalError(err.message)));
};
class Bus {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this._emitter = new eventemitter2_1.EventEmitter2({
            wildcard: true,
            delimiter: ':',
            maxListeners: 1000,
        });
        this.actions = {};
        this.events = {};
        this.channels = {};
        this.rpcClients = {};
        if (this.config.rpc.enable) {
            this._ipcServer = new ipc_server_1.IPCServer({
                socketsDir: this.config.socketsPath.root,
                name: 'bus',
            });
        }
        if (this.config.rpc.enable && this.config.rpc.mode === 'ws') {
            this._wsServer = new ws_server_1.WSServer({
                path: '/ws',
                port: config.rpc.port,
                host: config.rpc.host,
                logger: this.logger,
            });
        }
    }
    async setup() {
        if (this.config.rpc.enable) {
            await this._setupIPCServer();
        }
        if (this.config.rpc.enable && this.config.rpc.mode === 'ws') {
            await this._setupWSServer();
        }
        return true;
    }
    async registerChannel(moduleAlias, events, actions, options) {
        events.forEach(eventName => {
            if (this.events[`${moduleAlias}:${eventName}`] !== undefined) {
                throw new Error(`Event "${eventName}" already registered with bus.`);
            }
            this.events[`${moduleAlias}:${eventName}`] = true;
        });
        Object.keys(actions).forEach(actionName => {
            if (this.actions[`${moduleAlias}:${actionName}`] !== undefined) {
                throw new Error(`Action "${actionName}" already registered with bus.`);
            }
            this.actions[`${moduleAlias}:${actionName}`] = actions[actionName];
        });
        if (options.rpcSocketPath) {
            const rpcSocket = axon.socket('req');
            rpcSocket.connect(options.rpcSocketPath);
            const rpcClient = new pm2_axon_rpc_1.Client(rpcSocket);
            this.rpcClients[moduleAlias] = rpcSocket;
            this.channels[moduleAlias] = {
                rpcClient,
                events,
                actions,
                type: ChannelType.ChildProcess,
            };
        }
        else {
            this.channels[moduleAlias] = {
                channel: options.channel,
                events,
                actions,
                type: ChannelType.InMemory,
            };
        }
    }
    async invoke(rawRequest) {
        let request;
        if (!rawRequest) {
            this.logger.error('Empty invoke request.');
            throw new JSONRPC.JSONRPCError('Invalid invoke request.', JSONRPC.errorResponse(null, JSONRPC.invalidRequest()));
        }
        try {
            request =
                typeof rawRequest === 'string'
                    ? JSON.parse(rawRequest)
                    : rawRequest;
        }
        catch (error) {
            throw new JSONRPC.JSONRPCError('Invalid invoke request.', JSONRPC.errorResponse(null, JSONRPC.invalidRequest()));
        }
        try {
            JSONRPC.validateJSONRPCRequest(request);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Invalid invoke request.');
            throw new JSONRPC.JSONRPCError('Invalid invoke request.', JSONRPC.errorResponse(request.id, JSONRPC.invalidRequest()));
        }
        const action = action_1.Action.fromJSONRPCRequest(request);
        const actionFullName = action.key();
        if (this.actions[actionFullName] === undefined) {
            throw new JSONRPC.JSONRPCError(`Action '${actionFullName}' is not registered to bus.`, JSONRPC.errorResponse(action.id, JSONRPC.internalError(`Action '${actionFullName}' is not registered to bus.`)));
        }
        const actionParams = action.params;
        const channelInfo = this.channels[action.module];
        if (channelInfo.type === ChannelType.InMemory) {
            try {
                const result = await channelInfo.channel.invoke(actionFullName, actionParams);
                return action.buildJSONRPCResponse({
                    result,
                });
            }
            catch (error) {
                throw parseError(action.id, error);
            }
        }
        return new Promise((resolve, reject) => {
            channelInfo.rpcClient.call('invoke', action.toJSONRPCRequest(), (err, data) => {
                if (err) {
                    return reject(parseError(action.id, err));
                }
                return resolve(data);
            });
        });
    }
    publish(rawRequest) {
        let request;
        if (!rawRequest) {
            this.logger.error('Empty publish request.');
            throw new JSONRPC.JSONRPCError('Invalid publish request.', JSONRPC.errorResponse(null, JSONRPC.invalidRequest()));
        }
        try {
            request =
                typeof rawRequest === 'string'
                    ? JSON.parse(rawRequest)
                    : rawRequest;
        }
        catch (error) {
            throw new JSONRPC.JSONRPCError('Invalid publish request.', JSONRPC.errorResponse(null, JSONRPC.invalidRequest()));
        }
        try {
            JSONRPC.validateJSONRPCNotification(request);
        }
        catch (error) {
            this.logger.error({ err: error }, 'Invalid publish request.');
            throw new JSONRPC.JSONRPCError('Invalid publish request.', JSONRPC.errorResponse(null, JSONRPC.invalidRequest()));
        }
        const event = event_1.Event.fromJSONRPCNotification(rawRequest);
        const eventName = event.key();
        const notification = event.toJSONRPCNotification();
        if (!this.getEvents().includes(eventName)) {
            throw new JSONRPC.JSONRPCError(`Event ${eventName} is not registered to bus.`, JSONRPC.errorResponse(null, JSONRPC.internalError(`Event ${eventName} is not registered to bus.`)));
        }
        this._emitter.emit(eventName, notification);
        if (this.config.rpc.enable) {
            try {
                this._ipcServer.pubSocket.send(notification);
            }
            catch (error) {
                this.logger.debug({ err: error }, `Failed to publish event: ${eventName} to ipc server.`);
            }
        }
        if (this.config.rpc.enable && this.config.rpc.mode === 'ws') {
            try {
                this._wsServer.broadcast(JSON.stringify(notification));
            }
            catch (error) {
                this.logger.debug({ err: error }, `Failed to publish event: ${eventName} to ws server.`);
            }
        }
    }
    subscribe(eventName, cb) {
        if (!this.getEvents().includes(eventName)) {
            this.logger.info(`Event ${eventName} was subscribed but not registered to the bus yet.`);
        }
        this._emitter.on(eventName, cb);
    }
    once(eventName, cb) {
        if (!this.getEvents().includes(eventName)) {
            this.logger.info(`Event ${eventName} was subscribed but not registered to the bus yet.`);
        }
        this._emitter.once(eventName, cb);
        return this;
    }
    getActions() {
        return Object.keys(this.actions);
    }
    getEvents() {
        return Object.keys(this.events);
    }
    async cleanup() {
        this._emitter.removeAllListeners();
        if (this._ipcServer) {
            this._ipcServer.stop();
        }
        if (this._wsServer) {
            this._wsServer.stop();
        }
    }
    async _setupIPCServer() {
        await this._ipcServer.start();
        this._ipcServer.rpcServer.expose('registerChannel', (moduleAlias, events, actions, options, cb) => {
            this.registerChannel(moduleAlias, events, actions, options)
                .then(() => cb(null))
                .catch(error => cb(error));
        });
        this._ipcServer.rpcServer.expose('invoke', (message, cb) => {
            this.invoke(message)
                .then(data => {
                cb(null, data);
            })
                .catch((error) => {
                cb(error, error.response);
            });
        });
        this._ipcServer.subSocket.on('message', (eventValue) => {
            this.publish(eventValue);
        });
    }
    async _setupWSServer() {
        this._wsServer.start((socket, message) => {
            this.invoke(message)
                .then(data => {
                socket.send(JSON.stringify(data));
            })
                .catch((error) => {
                socket.send(JSON.stringify(error.response));
            });
        });
    }
}
exports.Bus = Bus;
//# sourceMappingURL=bus.js.map