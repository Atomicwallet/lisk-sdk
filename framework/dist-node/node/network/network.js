"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_db_1 = require("@liskhq/lisk-db");
const events_1 = require("events");
const liskP2P = require("@liskhq/lisk-p2p");
const constants_1 = require("../../constants");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const { P2P, events: { EVENT_NETWORK_READY, EVENT_NEW_INBOUND_PEER, EVENT_CLOSE_INBOUND, EVENT_CLOSE_OUTBOUND, EVENT_CONNECT_OUTBOUND, EVENT_DISCOVERED_PEER, EVENT_FAILED_TO_FETCH_PEER_INFO, EVENT_FAILED_TO_PUSH_NODE_INFO, EVENT_OUTBOUND_SOCKET_ERROR, EVENT_INBOUND_SOCKET_ERROR, EVENT_UPDATED_PEER_INFO, EVENT_FAILED_PEER_INFO_UPDATE, EVENT_REQUEST_RECEIVED, EVENT_MESSAGE_RECEIVED, EVENT_BAN_PEER, }, } = liskP2P;
const DB_KEY_NETWORK_NODE_SECRET = 'network:nodeSecret';
const DB_KEY_NETWORK_TRIED_PEERS_LIST = 'network:triedPeersList';
const DEFAULT_PEER_SAVE_INTERVAL = 10 * 60 * 1000;
const REMOTE_EVENTS_WHITE_LIST = [
    constants_1.EVENT_POST_BLOCK,
    constants_1.EVENT_POST_NODE_INFO,
    constants_1.EVENT_POST_TRANSACTION_ANNOUNCEMENT,
];
class Network {
    constructor({ options, channel, logger, nodeDB, networkVersion }) {
        this._options = options;
        this._channel = channel;
        this._logger = logger;
        this._nodeDB = nodeDB;
        this._networkVersion = networkVersion;
        this._endpoints = {};
        this._secret = undefined;
        this.events = new events_1.EventEmitter();
    }
    async bootstrap(networkIdentifier) {
        var _a, _b;
        this._networkID = networkIdentifier.toString('hex');
        let previousPeers = [];
        try {
            const previousPeersBuffer = await this._nodeDB.get(DB_KEY_NETWORK_TRIED_PEERS_LIST);
            previousPeers = JSON.parse(previousPeersBuffer.toString('utf8'));
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                this._logger.error({ err: error }, 'Error while querying nodeDB');
            }
        }
        let secret;
        try {
            secret = await this._nodeDB.get(DB_KEY_NETWORK_NODE_SECRET);
        }
        catch (error) {
            if (!(error instanceof lisk_db_1.NotFoundError)) {
                this._logger.error({ err: error }, 'Error while querying nodeDB');
            }
        }
        if (!secret) {
            secret = lisk_cryptography_1.getRandomBytes(4);
            await this._nodeDB.put(DB_KEY_NETWORK_NODE_SECRET, secret);
        }
        this._secret = secret === null || secret === void 0 ? void 0 : secret.readUInt32BE(0);
        const initialNodeInfo = {
            networkIdentifier: this._networkID,
            networkVersion: this._networkVersion,
            nonce: '',
            advertiseAddress: (_a = this._options.advertiseAddress) !== null && _a !== void 0 ? _a : true,
            options: {
                lastBlockID: Buffer.alloc(0),
                blockVersion: 0,
                height: 0,
                maxHeightPrevoted: 0,
            },
        };
        const seedPeers = await utils_1.lookupPeersIPs(this._options.seedPeers, true);
        const blacklistedIPs = (_b = this._options.blacklistedIPs) !== null && _b !== void 0 ? _b : [];
        const fixedPeers = this._options.fixedPeers
            ? this._options.fixedPeers.map(peer => ({
                ipAddress: peer.ip,
                port: peer.port,
            }))
            : [];
        const whitelistedPeers = this._options.whitelistedPeers
            ? this._options.whitelistedPeers.map(peer => ({
                ipAddress: peer.ip,
                port: peer.port,
            }))
            : [];
        const p2pConfig = {
            port: this._options.port,
            nodeInfo: initialNodeInfo,
            hostIp: this._options.hostIp,
            blacklistedIPs,
            fixedPeers,
            whitelistedPeers,
            seedPeers: seedPeers.map(peer => ({
                ipAddress: peer.ip,
                port: peer.port,
            })),
            previousPeers,
            maxOutboundConnections: this._options.maxOutboundConnections,
            maxInboundConnections: this._options.maxInboundConnections,
            peerBanTime: this._options.peerBanTime,
            sendPeerLimit: this._options.sendPeerLimit,
            maxPeerDiscoveryResponseLength: this._options.maxPeerDiscoveryResponseLength,
            maxPeerInfoSize: this._options.maxPeerInfoSize,
            wsMaxPayload: this._options.wsMaxPayload,
            secret: this._secret,
            customNodeInfoSchema: schema_1.customNodeInfoSchema,
        };
        this._p2p = new P2P(p2pConfig);
        this._p2p.on(EVENT_NETWORK_READY, () => {
            this._logger.debug('Node connected to the network');
            this.events.emit(constants_1.APP_EVENT_NETWORK_READY);
            this._channel.publish(constants_1.APP_EVENT_NETWORK_READY);
        });
        this._p2p.on(EVENT_CLOSE_OUTBOUND, ({ peerInfo, code, reason }) => {
            this._logger.debug({
                ...peerInfo,
                code,
                reason,
            }, 'EVENT_CLOSE_OUTBOUND: Close outbound peer connection');
        });
        this._p2p.on(EVENT_CLOSE_INBOUND, ({ peerInfo, code, reason }) => {
            this._logger.debug({
                ...peerInfo,
                code,
                reason,
            }, 'EVENT_CLOSE_INBOUND: Close inbound peer connection');
        });
        this._p2p.on(EVENT_CONNECT_OUTBOUND, peerInfo => {
            this._logger.debug({
                ...peerInfo,
            }, 'EVENT_CONNECT_OUTBOUND: Outbound peer connection');
        });
        this._p2p.on(EVENT_DISCOVERED_PEER, peerInfo => {
            this._logger.trace({
                ...peerInfo,
            }, 'EVENT_DISCOVERED_PEER: Discovered peer connection');
        });
        this._p2p.on(EVENT_NEW_INBOUND_PEER, peerInfo => {
            this._logger.debug({
                ...peerInfo,
            }, 'EVENT_NEW_INBOUND_PEER: Inbound peer connection');
        });
        this._p2p.on(EVENT_FAILED_TO_FETCH_PEER_INFO, (error) => {
            this._logger.error({ err: error }, 'EVENT_FAILED_TO_FETCH_PEER_INFO: Failed to fetch peer info');
        });
        this._p2p.on(EVENT_FAILED_TO_PUSH_NODE_INFO, (error) => {
            this._logger.trace({ err: error }, 'EVENT_FAILED_TO_PUSH_NODE_INFO: Failed to push node info');
        });
        this._p2p.on(EVENT_OUTBOUND_SOCKET_ERROR, (error) => {
            this._logger.debug({ err: error }, 'EVENT_OUTBOUND_SOCKET_ERROR: Outbound socket error');
        });
        this._p2p.on(EVENT_INBOUND_SOCKET_ERROR, (error) => {
            this._logger.debug({ err: error }, 'EVENT_INBOUND_SOCKET_ERROR: Inbound socket error');
        });
        this._p2p.on(EVENT_UPDATED_PEER_INFO, peerInfo => {
            this._logger.trace({
                ...peerInfo,
            }, 'EVENT_UPDATED_PEER_INFO: Update peer info');
        });
        this._p2p.on(EVENT_FAILED_PEER_INFO_UPDATE, (error) => {
            this._logger.error({ err: error }, 'EVENT_FAILED_PEER_INFO_UPDATE: Failed peer update');
        });
        this._p2p.on(EVENT_REQUEST_RECEIVED, async (request) => {
            this._logger.trace({ procedure: request.procedure }, 'EVENT_REQUEST_RECEIVED: Received inbound request for procedure');
            if (request.wasResponseSent) {
                return;
            }
            if (!Object.keys(this._endpoints).includes(request.procedure)) {
                const error = new Error(`Requested procedure "${request.procedure}" is not permitted.`);
                this._logger.error({ err: error, procedure: request.procedure }, 'Peer request not fulfilled event: Requested procedure is not permitted.');
                this._p2p.applyPenalty({ peerId: request.peerId, penalty: 100 });
                request.error(error);
                return;
            }
            try {
                const result = await this._endpoints[request.procedure]({
                    data: request.data,
                    peerId: request.peerId,
                });
                this._logger.trace({ procedure: request.procedure }, 'Peer request fulfilled event: Responded to peer request');
                request.end(result);
            }
            catch (error) {
                this._logger.error({ err: error, procedure: request.procedure }, 'Peer request not fulfilled event: Could not respond to peer request');
                request.error(error);
            }
        });
        this._p2p.on(EVENT_MESSAGE_RECEIVED, (packet) => {
            if (!REMOTE_EVENTS_WHITE_LIST.includes(packet.event)) {
                const error = new Error(`Sent event "${packet.event}" is not permitted.`);
                this._logger.error({ err: error, event: packet.event }, 'Peer request not fulfilled. Sent event is not permitted.');
                this._p2p.applyPenalty({ peerId: packet.peerId, penalty: 100 });
                return;
            }
            this._logger.trace({
                peerId: packet.peerId,
                event: packet.event,
            }, 'EVENT_MESSAGE_RECEIVED: Received inbound message');
            this.events.emit(constants_1.APP_EVENT_NETWORK_EVENT, packet);
        });
        this._p2p.on(EVENT_BAN_PEER, (peerId) => {
            this._logger.error({ peerId }, 'EVENT_MESSAGE_RECEIVED: Peer has been banned temporarily');
        });
        setInterval(async () => {
            const triedPeers = this._p2p.getTriedPeers();
            if (triedPeers.length) {
                await this._nodeDB.put(DB_KEY_NETWORK_TRIED_PEERS_LIST, Buffer.from(JSON.stringify(triedPeers), 'utf8'));
            }
        }, DEFAULT_PEER_SAVE_INTERVAL);
        try {
            await this._p2p.start();
        }
        catch (error) {
            this._logger.fatal({
                message: error.message,
                stack: error.stack,
            }, 'Failed to initialize network');
            throw error;
        }
    }
    registerEndpoint(endpoint, handler) {
        if (this._endpoints[endpoint]) {
            throw new Error(`Endpoint ${endpoint} has already been registered.`);
        }
        this._endpoints[endpoint] = handler;
    }
    async request(requestPacket) {
        return this._p2p.request({
            procedure: requestPacket.procedure,
            data: requestPacket.data,
        });
    }
    send(sendPacket) {
        return this._p2p.send({
            event: sendPacket.event,
            data: sendPacket.data,
        });
    }
    async requestFromPeer(requestPacket) {
        return this._p2p.requestFromPeer({
            procedure: requestPacket.procedure,
            data: requestPacket.data,
        }, requestPacket.peerId);
    }
    sendToPeer(sendPacket) {
        return this._p2p.sendToPeer({
            event: sendPacket.event,
            data: sendPacket.data,
        }, sendPacket.peerId);
    }
    broadcast(broadcastPacket) {
        return this._p2p.broadcast({
            event: broadcastPacket.event,
            data: broadcastPacket.data,
        });
    }
    getConnectedPeers() {
        const peers = this._p2p.getConnectedPeers();
        return peers.map(peer => {
            const parsedPeer = {
                ...peer,
            };
            if (parsedPeer.options) {
                parsedPeer.options = lisk_codec_1.codec.toJSON(schema_1.customNodeInfoSchema, parsedPeer.options);
            }
            return parsedPeer;
        });
    }
    getNetworkStats() {
        return this._p2p.getNetworkStats();
    }
    getDisconnectedPeers() {
        const peers = this._p2p.getDisconnectedPeers();
        return peers.map(peer => {
            const parsedPeer = {
                ...peer,
            };
            if (parsedPeer.options) {
                parsedPeer.options = lisk_codec_1.codec.toJSON(schema_1.customNodeInfoSchema, parsedPeer.options);
            }
            return parsedPeer;
        });
    }
    applyPenaltyOnPeer(penaltyPacket) {
        return this._p2p.applyPenalty({
            peerId: penaltyPacket.peerId,
            penalty: penaltyPacket.penalty,
        });
    }
    applyNodeInfo(data) {
        var _a;
        const newNodeInfo = {
            networkIdentifier: this._networkID,
            networkVersion: this._networkVersion,
            advertiseAddress: (_a = this._options.advertiseAddress) !== null && _a !== void 0 ? _a : true,
            options: data,
        };
        try {
            this._p2p.applyNodeInfo(newNodeInfo);
        }
        catch (error) {
            this._logger.error({ err: error }, 'Applying NodeInfo failed because of error');
        }
    }
    async cleanup() {
        this._logger.info('Network cleanup started');
        await this._p2p.stop();
        this._logger.info('Network cleanup completed');
    }
}
exports.Network = Network;
//# sourceMappingURL=network.js.map