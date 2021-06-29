"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCChannel = void 0;
const path = require("path");
const axon = require("pm2-axon");
const os_1 = require("os");
const pm2_axon_rpc_1 = require("pm2-axon-rpc");
const events_1 = require("events");
const utils_1 = require("./utils");
const CONNECTION_TIME_OUT = 2000;
const getSocketsPath = (dataPath) => {
    const socketDir = path.join(path.resolve(dataPath.replace('~', os_1.homedir())), 'tmp', 'sockets');
    return {
        root: `unix://${socketDir}`,
        pub: `unix://${socketDir}/pub_socket.sock`,
        sub: `unix://${socketDir}/sub_socket.sock`,
        rpc: `unix://${socketDir}/bus_rpc_socket.sock`,
    };
};
class IPCChannel {
    constructor(dataPath) {
        const socketsDir = getSocketsPath(dataPath);
        this._eventPubSocketPath = socketsDir.pub;
        this._eventSubSocketPath = socketsDir.sub;
        this._rpcServerSocketPath = socketsDir.rpc;
        this._pubSocket = axon.socket('push', {});
        this._subSocket = axon.socket('sub', {});
        this._rpcClient = new pm2_axon_rpc_1.Client(axon.socket('req'));
        this._events = new events_1.EventEmitter();
        this._id = 0;
    }
    async connect() {
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this._pubSocket.on('connect', () => {
                clearTimeout(timeout);
                resolve(undefined);
            });
            this._pubSocket.on('error', reject);
            this._pubSocket.connect(this._eventSubSocketPath);
        }).finally(() => {
            this._pubSocket.removeAllListeners('connect');
            this._pubSocket.removeAllListeners('error');
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this._subSocket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            this._subSocket.on('error', reject);
            this._subSocket.connect(this._eventPubSocketPath);
        }).finally(() => {
            this._subSocket.removeAllListeners('connect');
            this._subSocket.removeAllListeners('error');
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this._rpcClient.sock.on('connect', () => {
                clearTimeout(timeout);
                resolve(undefined);
            });
            this._rpcClient.sock.on('error', reject);
            this._rpcClient.sock.connect(this._rpcServerSocketPath);
        }).finally(() => {
            this._rpcClient.sock.removeAllListeners('connect');
            this._rpcClient.sock.removeAllListeners('error');
        });
        this._subSocket.on('message', (eventData) => {
            this._events.emit(eventData.method, eventData.params);
        });
    }
    async disconnect() {
        this._subSocket.removeAllListeners();
        this._pubSocket.close();
        this._subSocket.close();
        this._rpcClient.sock.close();
    }
    async invoke(actionName, params) {
        this._id += 1;
        const action = {
            id: this._id,
            jsonrpc: '2.0',
            method: actionName,
            params: params !== null && params !== void 0 ? params : {},
        };
        return new Promise((resolve, reject) => {
            this._rpcClient.call('invoke', action, (err, data) => {
                if (err) {
                    reject(utils_1.convertRPCError(err));
                    return;
                }
                if (data.error) {
                    reject(utils_1.convertRPCError(data.error));
                    return;
                }
                resolve(data.result);
            });
        });
    }
    subscribe(eventName, cb) {
        this._events.on(eventName, cb);
    }
}
exports.IPCChannel = IPCChannel;
//# sourceMappingURL=ipc_channel.js.map