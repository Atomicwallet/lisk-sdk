"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCClient = void 0;
const axon = require("pm2-axon");
const pm2_axon_rpc_1 = require("pm2-axon-rpc");
const ipc_socket_1 = require("./ipc_socket");
const CONNECTION_TIME_OUT = 2000;
class IPCClient extends ipc_socket_1.IPCSocket {
    constructor(options) {
        super(options);
        this._actionRPCConnectingServerSocketPath = options.rpcServerSocketPath;
        this.pubSocket = axon.socket('push', {});
        this.subSocket = axon.socket('sub', {});
        this.rpcClient = new pm2_axon_rpc_1.Client(axon.socket('req'));
    }
    async start() {
        await super.start();
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this.pubSocket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            this.pubSocket.on('error', reject);
            this.pubSocket.connect(this._eventSubSocketPath);
        }).finally(() => {
            this.pubSocket.removeAllListeners('connect');
            this.pubSocket.removeAllListeners('error');
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this.subSocket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            this.subSocket.on('error', reject);
            this.subSocket.connect(this._eventPubSocketPath);
        }).finally(() => {
            this.subSocket.removeAllListeners('connect');
            this.subSocket.removeAllListeners('error');
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('IPC Socket client connection timeout. Please check if IPC server is running.'));
            }, CONNECTION_TIME_OUT);
            this.rpcClient.sock.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            this.rpcClient.sock.on('error', reject);
            this.rpcClient.sock.connect(this._actionRPCConnectingServerSocketPath);
        }).finally(() => {
            this.rpcClient.sock.removeAllListeners('connect');
            this.rpcClient.sock.removeAllListeners('error');
        });
    }
    stop() {
        super.stop();
        this.rpcClient.sock.close();
    }
}
exports.IPCClient = IPCClient;
//# sourceMappingURL=ipc_client.js.map