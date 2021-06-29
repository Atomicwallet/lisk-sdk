"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCServer = void 0;
const axon = require("pm2-axon");
const ipc_socket_1 = require("./ipc_socket");
class IPCServer extends ipc_socket_1.IPCSocket {
    constructor(options) {
        super(options);
        this.pubSocket = axon.socket('pub', {});
        this.subSocket = axon.socket('pull', {});
    }
    async start() {
        await super.start();
        await new Promise((resolve, reject) => {
            this.pubSocket.on('bind', resolve);
            this.pubSocket.on('error', reject);
            this.pubSocket.bind(this._eventPubSocketPath);
        }).finally(() => {
            this.pubSocket.removeAllListeners('bind');
            this.pubSocket.removeAllListeners('error');
        });
        await new Promise((resolve, reject) => {
            this.subSocket.on('bind', resolve);
            this.subSocket.on('error', reject);
            this.subSocket.bind(this._eventSubSocketPath);
        }).finally(() => {
            this.subSocket.removeAllListeners('bind');
            this.subSocket.removeAllListeners('error');
        });
    }
}
exports.IPCServer = IPCServer;
//# sourceMappingURL=ipc_server.js.map