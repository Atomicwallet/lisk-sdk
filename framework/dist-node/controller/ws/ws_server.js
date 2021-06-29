"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSServer = void 0;
const WebSocket = require("ws");
class WSServer {
    constructor(options) {
        this.port = options.port;
        this.host = options.host;
        this.path = options.path;
        this.logger = options.logger;
    }
    start(messageHandler) {
        this.server = new WebSocket.Server({
            path: this.path,
            port: this.port,
            host: this.host,
            clientTracking: true,
        });
        this.server.on('connection', socket => this._handleConnection(socket, messageHandler));
        this.server.on('error', error => {
            this.logger.error(error);
        });
        this.server.on('listening', () => {
            this.logger.info('Websocket Server Ready');
        });
        this.server.on('close', () => {
            clearInterval(this.pingTimer);
        });
        this.pingTimer = this._setUpPing();
        return this.server;
    }
    stop() {
        if (this.server) {
            this.server.close();
        }
    }
    broadcast(message) {
        for (const client of this.server.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
    _handleConnection(socket, messageHandler) {
        socket.isAlive = true;
        socket.on('message', (message) => messageHandler(socket, message));
        socket.on('pong', () => this._handleHeartbeat(socket));
        this.logger.info('New web socket client connected');
    }
    _handleHeartbeat(socket) {
        socket.isAlive = true;
    }
    _setUpPing() {
        return setInterval(() => {
            for (const socket of this.server.clients) {
                const aClient = socket;
                if (aClient.isAlive === false) {
                    return socket.terminate();
                }
                aClient.isAlive = false;
                aClient.ping(() => { });
            }
            return null;
        }, 3000);
    }
}
exports.WSServer = WSServer;
//# sourceMappingURL=ws_server.js.map