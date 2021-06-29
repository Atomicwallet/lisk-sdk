"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerServer = void 0;
const events_1 = require("events");
const http = require("http");
const socketcluster_server_1 = require("socketcluster-server");
const url = require("url");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const events_2 = require("../events");
const utils_1 = require("../utils");
const BASE_10_RADIX = 10;
class PeerServer extends events_1.EventEmitter {
    constructor(config) {
        super();
        this._nodeInfo = config.nodeInfo;
        this._hostIp = config.hostIp;
        this._port = config.port;
        this._secret = config.secret;
        this._peerBook = config.peerBook;
        this._httpServer = http.createServer();
        this._scServer = socketcluster_server_1.attach(this._httpServer, {
            path: constants_1.DEFAULT_HTTP_PATH,
            wsEngineServerOptions: {
                maxPayload: config.maxPayload,
            },
        });
        this._maxPeerInfoSize = config.maxPeerInfoSize;
        this._peerHandshakeCheck = config.peerHandshakeCheck;
        this._invalidMessageCounter = new Map();
    }
    async stop() {
        if (this._invalidMessageInterval) {
            clearTimeout(this._invalidMessageInterval);
        }
        await this._stopWSServer();
        await this._stopHTTPServer();
    }
    async start() {
        this._invalidMessageInterval = setInterval(() => {
            this._invalidMessageCounter = new Map();
        }, constants_1.DEFAULT_RATE_CALCULATION_INTERVAL);
        this._scServer.addMiddleware(this._scServer.MIDDLEWARE_HANDSHAKE_WS, (req, next) => {
            if (this._peerBook.bannedIPs.has(req.socket.remoteAddress)) {
                next(new errors_1.PeerInboundHandshakeError(constants_1.FORBIDDEN_CONNECTION_REASON, constants_1.FORBIDDEN_CONNECTION, req.socket.remoteAddress));
                return;
            }
            next();
        });
        this._scServer.on('handshake', (socket) => {
            if (this._peerBook.bannedIPs.has(socket.remoteAddress)) {
                if (socket.socket) {
                    socket.socket.terminate();
                }
            }
            this._bindInvalidControlFrameEvents(socket);
        });
        this._scServer.wsServer.on('connection', (ws, req) => {
            this._handleIncomingPayload(ws, req);
        });
        this._scServer.on('connection', (socket) => {
            this._handleIncomingConnection(socket);
        });
        this._httpServer.listen(this._port, this._hostIp || constants_1.DEFAULT_NODE_HOST_IP);
        if (this._scServer.isReady) {
            return;
        }
        return new Promise(resolve => {
            this._scServer.once('ready', () => {
                resolve();
            });
        });
    }
    _terminateIncomingSocket(socket, error, addToBannedPeers) {
        if (socket.socket) {
            socket.socket.terminate();
        }
        this.emit(events_2.EVENT_INBOUND_SOCKET_ERROR, error);
        if (addToBannedPeers) {
            const peerId = `${socket.remoteAddress}:${socket.remotePort}`;
            this.emit(events_2.EVENT_BAN_PEER, peerId);
        }
    }
    _disconnectSocketDueToFailedHandshake(socket, statusCode, closeReason) {
        socket.disconnect(statusCode, closeReason);
        this.emit(events_2.EVENT_FAILED_TO_ADD_INBOUND_PEER, new errors_1.PeerInboundHandshakeError(closeReason, statusCode, socket.remoteAddress, socket.request.url));
    }
    _validateQueryObject(socket) {
        if (!socket.request.url) {
            this._disconnectSocketDueToFailedHandshake(socket, constants_1.INVALID_CONNECTION_URL_CODE, constants_1.INVALID_CONNECTION_URL_REASON);
            return undefined;
        }
        const { query: queryObject } = url.parse(socket.request.url, true);
        if (!queryObject) {
            return undefined;
        }
        if (queryObject.nonce === this._nodeInfo.nonce) {
            this._disconnectSocketDueToFailedHandshake(socket, constants_1.INVALID_CONNECTION_SELF_CODE, constants_1.INVALID_CONNECTION_SELF_REASON);
            const selfport = queryObject.port ? +queryObject.port : this._port;
            this._peerBook.removePeer({
                peerId: utils_1.constructPeerId(socket.remoteAddress, selfport),
                ipAddress: socket.remoteAddress,
                port: selfport,
            });
            return undefined;
        }
        if (typeof queryObject.networkVersion !== 'string' ||
            typeof queryObject.networkIdentifier !== 'string') {
            this._disconnectSocketDueToFailedHandshake(socket, constants_1.INVALID_CONNECTION_QUERY_CODE, constants_1.INVALID_CONNECTION_QUERY_REASON);
            return undefined;
        }
        return queryObject;
    }
    _constructPeerInfoForInboundConnection(queryObject, socket) {
        var _a;
        const remoteport = parseInt(queryObject.port, BASE_10_RADIX);
        const peerId = utils_1.constructPeerId(socket.remoteAddress, remoteport);
        const { advertiseAddress, nonce, networkIdentifier, networkVersion } = queryObject;
        const peerInPeerBook = this._peerBook.getPeer({
            peerId,
            ipAddress: socket.remoteAddress,
            port: remoteport,
        });
        const incomingPeerInfo = peerInPeerBook
            ? {
                ...peerInPeerBook,
                sharedState: {
                    ...peerInPeerBook.sharedState,
                    nonce: nonce,
                    networkVersion: networkVersion,
                    networkIdentifier: networkIdentifier,
                    options: { ...(_a = peerInPeerBook.sharedState) === null || _a === void 0 ? void 0 : _a.options },
                },
                internalState: {
                    ...(peerInPeerBook.internalState
                        ? peerInPeerBook.internalState
                        : utils_1.assignInternalInfo(peerInPeerBook, this._secret)),
                    advertiseAddress: advertiseAddress !== 'false',
                    connectionKind: constants_1.ConnectionKind.INBOUND,
                },
            }
            : {
                sharedState: {
                    networkIdentifier: networkIdentifier,
                    nonce: nonce,
                    networkVersion: networkVersion,
                    options: {},
                },
                internalState: {
                    ...utils_1.assignInternalInfo({
                        peerId,
                        ipAddress: socket.remoteAddress,
                        port: remoteport,
                    }, this._secret),
                    advertiseAddress: advertiseAddress !== 'false',
                    connectionKind: constants_1.ConnectionKind.INBOUND,
                },
                peerId,
                ipAddress: socket.remoteAddress,
                port: remoteport,
            };
        try {
            const validPeerInfo = utils_1.validatePeerInfo(incomingPeerInfo, this._maxPeerInfoSize ? this._maxPeerInfoSize : constants_1.DEFAULT_MAX_PEER_INFO_SIZE);
            return validPeerInfo;
        }
        catch (error) {
            this._disconnectSocketDueToFailedHandshake(socket, constants_1.INCOMPATIBLE_PEER_INFO_CODE, error);
            return undefined;
        }
    }
    _checkPeerCompatibility(peerInfo, socket) {
        const { success, error } = this._peerHandshakeCheck(peerInfo, this._nodeInfo);
        if (!success) {
            const errorReason = error !== null && error !== void 0 ? error : constants_1.INCOMPATIBLE_PEER_UNKNOWN_REASON;
            this._disconnectSocketDueToFailedHandshake(socket, constants_1.INCOMPATIBLE_PEER_CODE, errorReason);
        }
        return success;
    }
    _handleIncomingConnection(socket) {
        const queryObject = this._validateQueryObject(socket);
        if (!queryObject) {
            return;
        }
        const incomingPeerInfo = this._constructPeerInfoForInboundConnection(queryObject, socket);
        if (!incomingPeerInfo) {
            return;
        }
        if (!this._checkPeerCompatibility(incomingPeerInfo, socket)) {
            return;
        }
        const incomingPeerConnection = {
            peerInfo: incomingPeerInfo,
            socket,
        };
        this.emit(events_2.EVENT_NEW_INBOUND_PEER_CONNECTION, incomingPeerConnection);
    }
    _bindInvalidControlFrameEvents(socket) {
        socket.socket.on('ping', () => {
            this._terminateIncomingSocket(socket, `Terminated connection peer: ${socket.remoteAddress}, reason: malicious ping control frames`, true);
        });
        socket.socket.on('pong', () => {
            this._terminateIncomingSocket(socket, `Terminated connection peer: ${socket.remoteAddress}, reason: malicious pong control frames`, true);
        });
    }
    _handleIncomingPayload(ws, _req) {
        ws.on('message', (message) => {
            var _a, _b;
            if (message === '#2') {
                return;
            }
            const MAX_EVENT_NAME_LENGTH = 128;
            const { address: peerIpAddress, port, } = ws._socket._peername;
            const peerId = utils_1.constructPeerId(peerIpAddress, port);
            try {
                const parsed = JSON.parse(message);
                utils_1.validatePacket(parsed);
                const invalidEvents = new Set([
                    '#authenticate',
                    '#removeAuthToken',
                    '#subscribe',
                    '#unsubscribe',
                    '#publish',
                ]);
                if ((parsed.event && typeof parsed.event !== 'string') ||
                    invalidEvents.has(parsed.event) ||
                    ((_a = parsed.event) === null || _a === void 0 ? void 0 : _a.length) > MAX_EVENT_NAME_LENGTH) {
                    throw new errors_1.InvalidPayloadError('Received invalid payload', parsed);
                }
                if (parsed.event === '#disconnect') {
                    const count = ((_b = this._invalidMessageCounter.get(peerIpAddress)) !== null && _b !== void 0 ? _b : 0) + 1;
                    this._invalidMessageCounter.set(peerIpAddress, count);
                    if (count > constants_1.DEFAULT_CONTROL_MESSAGE_LIMIT) {
                        throw new errors_1.InvalidDisconnectEventError(`Exhausted disconnected event: peer disconnected ${count} times above the limit of ${constants_1.DEFAULT_CONTROL_MESSAGE_LIMIT}`);
                    }
                }
            }
            catch (error) {
                ws.terminate();
                this.emit(events_2.EVENT_BAN_PEER, peerId);
                this.emit(events_2.EVENT_INBOUND_SOCKET_ERROR, `Banned peer with Ip: ${peerIpAddress}, reason: ${error}, message: ${message}`);
            }
        });
    }
    async _stopHTTPServer() {
        return new Promise(resolve => {
            this._httpServer.close(() => {
                resolve();
            });
        });
    }
    async _stopWSServer() {
        return new Promise(resolve => {
            this._scServer.close(() => {
                resolve();
            });
        });
    }
}
exports.PeerServer = PeerServer;
//# sourceMappingURL=peer_server.js.map