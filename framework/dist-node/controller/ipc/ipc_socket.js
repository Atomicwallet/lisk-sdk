"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCSocket = void 0;
const axon = require("pm2-axon");
const path_1 = require("path");
const pm2_axon_rpc_1 = require("pm2-axon-rpc");
class IPCSocket {
    constructor(options) {
        this._eventPubSocketPath = `unix://${path_1.join(options.socketsDir, 'pub_socket.sock')}`;
        this._eventSubSocketPath = `unix://${path_1.join(options.socketsDir, 'sub_socket.sock')}`;
        this._actionRpcSeverSocketPath = `unix://${path_1.join(options.socketsDir, `${options.name}_rpc_socket.sock`)}`;
        this.rpcServer = new pm2_axon_rpc_1.Server(axon.socket('rep'));
    }
    get rpcServerSocketPath() {
        return this._actionRpcSeverSocketPath;
    }
    stop() {
        this.subSocket.removeAllListeners();
        this.pubSocket.close();
        this.subSocket.close();
        this.rpcServer.sock.close();
    }
    async start() {
        await new Promise((resolve, reject) => {
            this.rpcServer.sock.on('bind', resolve);
            this.rpcServer.sock.on('error', reject);
            this.rpcServer.sock.bind(this._actionRpcSeverSocketPath);
        }).finally(() => {
            this.rpcServer.sock.removeAllListeners('bind');
            this.rpcServer.sock.removeAllListeners('error');
        });
    }
}
exports.IPCSocket = IPCSocket;
//# sourceMappingURL=ipc_socket.js.map