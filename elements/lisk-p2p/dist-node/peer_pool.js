"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerPool = exports.PROTECTION_CATEGORY = exports.filterPeersByCategory = exports.PROTECT_BY = void 0;
const events_1 = require("events");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const events_2 = require("./events");
const peer_1 = require("./peer");
const utils_1 = require("./utils");
const codec_1 = require("./utils/codec");
const shuffle = require("lodash.shuffle");
var PROTECT_BY;
(function (PROTECT_BY) {
    PROTECT_BY["HIGHEST"] = "highest";
    PROTECT_BY["LOWEST"] = "lowest";
})(PROTECT_BY = exports.PROTECT_BY || (exports.PROTECT_BY = {}));
const filterPeersByCategory = (peers, options) => {
    if (options.percentage > 1 || options.percentage < 0) {
        return peers;
    }
    const numberOfProtectedPeers = Math.ceil(peers.length * options.percentage);
    const sign = options.protectBy === PROTECT_BY.HIGHEST ? -1 : 1;
    return (peers
        .sort((peerA, peerB) => peerA.internalState[options.category] >
        peerB.internalState[options.category]
        ? sign
        : sign * -1)
        .slice(0, numberOfProtectedPeers));
};
exports.filterPeersByCategory = filterPeersByCategory;
var PROTECTION_CATEGORY;
(function (PROTECTION_CATEGORY) {
    PROTECTION_CATEGORY["NET_GROUP"] = "netgroup";
    PROTECTION_CATEGORY["LATENCY"] = "latency";
    PROTECTION_CATEGORY["RESPONSE_RATE"] = "responseRate";
    PROTECTION_CATEGORY["CONNECT_TIME"] = "connectTime";
})(PROTECTION_CATEGORY = exports.PROTECTION_CATEGORY || (exports.PROTECTION_CATEGORY = {}));
class PeerPool extends events_1.EventEmitter {
    constructor(peerPoolConfig) {
        super();
        this._peerMap = new Map();
        this._peerPoolConfig = peerPoolConfig;
        this._rpcSchema = peerPoolConfig.rpcSchemas;
        lisk_codec_1.codec.addSchema(this._rpcSchema.nodeInfo);
        this._peerConfig = {
            hostPort: this._peerPoolConfig.hostPort,
            connectTimeout: this._peerPoolConfig.connectTimeout,
            ackTimeout: this._peerPoolConfig.ackTimeout,
            wsMaxMessageRate: this._peerPoolConfig.wsMaxMessageRate,
            wsMaxMessageRatePenalty: this._peerPoolConfig.wsMaxMessageRatePenalty,
            maxPeerDiscoveryResponseLength: this._peerPoolConfig.maxPeerDiscoveryResponseLength,
            rateCalculationInterval: this._peerPoolConfig.rateCalculationInterval,
            peerStatusMessageRate: this._peerPoolConfig.peerStatusMessageRate,
            wsMaxPayload: this._peerPoolConfig.wsMaxPayload,
            maxPeerInfoSize: this._peerPoolConfig.maxPeerInfoSize,
            secret: this._peerPoolConfig.secret,
            rpcSchemas: this._rpcSchema,
        };
        this._peerBook = peerPoolConfig.peerBook;
        this._peerSelectForSend = peerPoolConfig.peerSelectionForSend;
        this._peerSelectForRequest = peerPoolConfig.peerSelectionForRequest;
        this._peerSelectForConnection = peerPoolConfig.peerSelectionForConnection;
        this._maxOutboundConnections = peerPoolConfig.maxOutboundConnections;
        this._maxInboundConnections = peerPoolConfig.maxInboundConnections;
        this._sendPeerLimit = peerPoolConfig.sendPeerLimit;
        this._outboundShuffleIntervalId = setInterval(() => {
            this._evictPeer(peer_1.OutboundPeer);
        }, peerPoolConfig.outboundShuffleInterval);
        this._handlePeerRPC = (request) => {
            this.emit(events_2.EVENT_REQUEST_RECEIVED, request);
        };
        this._handlePeerMessage = (message) => {
            this.emit(events_2.EVENT_MESSAGE_RECEIVED, message);
        };
        this._handleDiscoverPeer = (peerInfo) => {
            this.emit(events_2.EVENT_DISCOVERED_PEER, peerInfo);
        };
        this._handleOutboundPeerConnect = (peerInfo) => {
            this.emit(events_2.EVENT_CONNECT_OUTBOUND, peerInfo);
        };
        this._handleOutboundPeerConnectAbort = (peerInfo) => {
            this.emit(events_2.EVENT_CONNECT_ABORT_OUTBOUND, peerInfo);
        };
        this._handlePeerCloseOutbound = (closePacket) => {
            var _a;
            const { peerId } = closePacket.peerInfo;
            this.removePeer(peerId, closePacket.code, `Outbound peer ${peerId} disconnected with reason: ${(_a = closePacket.reason) !== null && _a !== void 0 ? _a : 'Unknown reason'}`);
            this.emit(events_2.EVENT_CLOSE_OUTBOUND, closePacket);
        };
        this._handlePeerCloseInbound = (closePacket) => {
            var _a;
            const { peerId } = closePacket.peerInfo;
            this.removePeer(peerId, closePacket.code, `Inbound peer ${peerId} disconnected with reason: ${(_a = closePacket.reason) !== null && _a !== void 0 ? _a : 'Unknown reason'}`);
            this.emit(events_2.EVENT_CLOSE_INBOUND, closePacket);
        };
        this._handlePeerOutboundSocketError = (error) => {
            this.emit(events_2.EVENT_OUTBOUND_SOCKET_ERROR, error);
        };
        this._handlePeerInboundSocketError = (error) => {
            this.emit(events_2.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        this._handlePeerInfoUpdate = (peerInfo) => {
            this.emit(events_2.EVENT_UPDATED_PEER_INFO, peerInfo);
        };
        this._handleFailedPeerInfoUpdate = (error) => {
            this.emit(events_2.EVENT_FAILED_PEER_INFO_UPDATE, error);
        };
        this._handleFailedToFetchPeerInfo = (error) => {
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
        };
        this._handleFailedToFetchPeers = (error) => {
            this.emit(events_2.EVENT_FAILED_TO_FETCH_PEERS, error);
        };
        this._handleFailedToCollectPeerDetails = (error) => {
            this.emit(events_2.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, error);
        };
        this._handleBanPeer = (peerId) => {
            this.emit(events_2.EVENT_BAN_PEER, peerId);
        };
    }
    applyNodeInfo(nodeInfo) {
        this._nodeInfo = nodeInfo;
        const peerList = this.getPeers();
        peerList.forEach(peer => {
            this._applyNodeInfoOnPeer(peer);
        });
    }
    get nodeInfo() {
        return this._nodeInfo;
    }
    get peerConfig() {
        return { ...this._peerConfig };
    }
    async request(packet) {
        const outboundPeerInfos = this.getAllConnectedPeerInfos(peer_1.OutboundPeer);
        const peerInfoForRequest = outboundPeerInfos.length === 0 ? this.getAllConnectedPeerInfos() : outboundPeerInfos;
        const selectedPeers = this._peerSelectForRequest({
            peers: peerInfoForRequest,
            nodeInfo: this._nodeInfo,
            peerLimit: 1,
            requestPacket: packet,
        });
        if (selectedPeers.length <= 0) {
            throw new errors_1.RequestFailError('Request failed due to no peers found in peer selection');
        }
        const selectedPeerId = selectedPeers[0].peerId;
        return this.requestFromPeer(packet, selectedPeerId);
    }
    broadcast(message) {
        [...this._peerMap.values()].forEach(peer => {
            const selectedPeerId = peer.peerInfo.peerId;
            try {
                this.sendToPeer(message, selectedPeerId);
            }
            catch (error) {
                this.emit(events_2.EVENT_FAILED_TO_SEND_MESSAGE, error);
            }
        });
    }
    send(message) {
        const listOfPeerInfo = [...this._peerMap.values()].map(peer => ({
            ...peer.peerInfo,
            internalState: {
                ...peer.peerInfo.internalState,
                advertiseAddress: peer.peerInfo.internalState
                    ? peer.peerInfo.internalState.advertiseAddress
                    : true,
                connectionKind: peer instanceof peer_1.OutboundPeer ? constants_1.ConnectionKind.OUTBOUND : constants_1.ConnectionKind.INBOUND,
            },
        }));
        const selectedPeers = this._peerSelectForSend({
            peers: listOfPeerInfo,
            nodeInfo: this._nodeInfo,
            peerLimit: this._sendPeerLimit,
            messagePacket: message,
        });
        selectedPeers.forEach((peerInfo) => {
            const selectedPeerId = peerInfo.peerId;
            try {
                this.sendToPeer(message, selectedPeerId);
            }
            catch (error) {
                this.emit(events_2.EVENT_FAILED_TO_SEND_MESSAGE, error);
            }
        });
    }
    async requestFromPeer(packet, peerId) {
        const peer = this._peerMap.get(peerId);
        if (!peer) {
            throw new errors_1.RequestFailError(`Request failed because a peer with id ${peerId} could not be found`);
        }
        return peer.request(packet);
    }
    sendToPeer(message, peerId) {
        const peer = this._peerMap.get(peerId);
        if (!peer) {
            throw new errors_1.SendFailError(`Send failed because a peer with id ${peerId} could not be found`);
        }
        peer.send(message);
    }
    discoverFromSeedPeers() {
        const freeOutboundSlots = this.getFreeOutboundSlots();
        if (freeOutboundSlots === 0 || this._peerBook.seedPeers.length === 0) {
            return;
        }
        this._peerBook.seedPeers.forEach(peer => {
            const isConnectedSeedPeer = this.getPeer(peer.peerId);
            if (isConnectedSeedPeer) {
                (async () => {
                    try {
                        await isConnectedSeedPeer.discoverPeers();
                    }
                    catch (error) { }
                })();
            }
        });
        const seedPeersForDiscovery = shuffle(this._peerBook.seedPeers.slice(0, freeOutboundSlots));
        seedPeersForDiscovery.forEach(peer => {
            this._addOutboundPeer(peer, this._nodeInfo);
        });
    }
    triggerNewConnections(newPeers, triedPeers) {
        const disconnectedNewPeers = newPeers.filter(newPeer => !this._peerMap.has(newPeer.peerId));
        const disconnectedTriedPeers = triedPeers.filter(triedPeer => !this._peerMap.has(triedPeer.peerId));
        const disconnectedFixedPeers = this._peerBook.fixedPeers.filter(peer => !this._peerMap.has(peer.peerId));
        const peerLimit = this.getFreeOutboundSlots();
        if (peerLimit === 0) {
            this._disconnectFromSeedPeers();
        }
        const peersToConnect = this._peerSelectForConnection({
            newPeers: disconnectedNewPeers,
            triedPeers: disconnectedTriedPeers,
            nodeInfo: this._nodeInfo,
            peerLimit,
        });
        [...peersToConnect, ...disconnectedFixedPeers].forEach((peerInfo) => this._addOutboundPeer(peerInfo, this._nodeInfo));
    }
    addInboundPeer(peerInfo, socket) {
        if (this._peerMap.has(peerInfo.peerId)) {
            throw new errors_1.PeerInboundDuplicateConnectionError(`Peer ${peerInfo.peerId} was already in the peer pool`, peerInfo.peerId);
        }
        const inboundPeers = this.getPeers(peer_1.InboundPeer);
        if (inboundPeers.length >= this._maxInboundConnections) {
            this._evictPeer(peer_1.InboundPeer);
        }
        const peer = new peer_1.InboundPeer(peerInfo, socket, {
            ...this._peerConfig,
            serverNodeInfo: this._nodeInfo,
        });
        this._peerMap.set(peer.id, peer);
        this._bindHandlersToPeer(peer);
        if (this._nodeInfo) {
            this._applyNodeInfoOnPeer(peer);
        }
        peer.connect();
        return peer;
    }
    getPeersCountPerKind() {
        return [...this._peerMap.values()].reduce((prev, peer) => {
            if (peer instanceof peer_1.OutboundPeer) {
                return {
                    outboundCount: prev.outboundCount + 1,
                    inboundCount: prev.inboundCount,
                };
            }
            if (peer instanceof peer_1.InboundPeer) {
                return {
                    outboundCount: prev.outboundCount,
                    inboundCount: prev.inboundCount + 1,
                };
            }
            throw new Error('A non-identified peer exists in the pool.');
        }, { outboundCount: 0, inboundCount: 0 });
    }
    removeAllPeers() {
        if (this._outboundShuffleIntervalId) {
            clearInterval(this._outboundShuffleIntervalId);
        }
        this._peerMap.forEach((peer) => {
            this.removePeer(peer.id, constants_1.INTENTIONAL_DISCONNECT_CODE, `Intentionally removed peer ${peer.id}`);
        });
    }
    getPeers(kind) {
        const peers = [...this._peerMap.values()];
        if (kind) {
            return peers.filter(peer => peer instanceof kind);
        }
        return peers;
    }
    getAllConnectedPeerInfos(kind) {
        return this.getConnectedPeers(kind).map(peer => peer.peerInfo);
    }
    getConnectedPeers(kind) {
        const peers = [...this._peerMap.values()];
        if (kind) {
            return peers.filter(peer => peer instanceof kind && peer.state === peer_1.ConnectionState.OPEN);
        }
        return peers.filter(peer => peer.state === peer_1.ConnectionState.OPEN);
    }
    getPeer(peerId) {
        return this._peerMap.get(peerId);
    }
    hasPeer(peerId) {
        return this._peerMap.has(peerId);
    }
    removePeer(peerId, code, reason) {
        const peer = this._peerMap.get(peerId);
        if (peer) {
            peer.disconnect(code, reason);
            this._unbindHandlersFromPeer(peer);
        }
        this.emit(events_2.EVENT_REMOVE_PEER, peerId);
        return this._peerMap.delete(peerId);
    }
    applyPenalty(peerPenalty) {
        if (!this._peerBook.isTrustedPeer(peerPenalty.peerId)) {
            const peer = this._peerMap.get(peerPenalty.peerId);
            if (peer) {
                peer.applyPenalty(peerPenalty.penalty);
                return;
            }
            throw new Error(`Peer not found: ${peerPenalty.peerId}`);
        }
    }
    getFreeOutboundSlots() {
        const { outboundCount } = this.getPeersCountPerKind();
        const disconnectedFixedPeers = this._peerBook.fixedPeers.filter(peer => !this._peerMap.has(peer.peerId));
        const openOutboundSlots = this._maxOutboundConnections - disconnectedFixedPeers.length - outboundCount;
        return openOutboundSlots;
    }
    _applyNodeInfoOnPeer(peer) {
        const encodedNodeInfo = codec_1.encodeNodeInfo(this._rpcSchema.nodeInfo, this._nodeInfo);
        utils_1.validatePayloadSize(encodedNodeInfo, this._peerPoolConfig.maxPeerInfoSize);
        try {
            peer.send({
                event: events_2.REMOTE_EVENT_POST_NODE_INFO,
                data: encodedNodeInfo,
            });
        }
        catch (error) {
            this.emit(events_2.EVENT_FAILED_TO_PUSH_NODE_INFO, error);
        }
    }
    _disconnectFromSeedPeers() {
        const outboundPeers = this.getPeers(peer_1.OutboundPeer);
        outboundPeers.forEach((outboundPeer) => {
            const isFixedPeer = this._peerBook.fixedPeers.find((peer) => peer.peerId === outboundPeer.id);
            const isSeedPeer = this._peerBook.seedPeers.find((peer) => peer.peerId === outboundPeer.id);
            if (isSeedPeer && !isFixedPeer) {
                this.removePeer(outboundPeer.id, constants_1.INTENTIONAL_DISCONNECT_CODE, constants_1.SEED_PEER_DISCONNECTION_REASON);
            }
        });
    }
    _selectPeersForEviction() {
        const peers = [...this.getPeers(peer_1.InboundPeer)].filter(peer => !(peer.internalState.peerKind === constants_1.PeerKind.WHITELISTED_PEER ||
            peer.internalState.peerKind === constants_1.PeerKind.FIXED_PEER));
        const protectedPeersByNetgroup = this._peerPoolConfig.netgroupProtectionRatio
            ? exports.filterPeersByCategory(peers, {
                category: PROTECTION_CATEGORY.NET_GROUP,
                percentage: this._peerPoolConfig.netgroupProtectionRatio,
                protectBy: PROTECT_BY.HIGHEST,
            }).map(peer => peer.id)
            : [];
        const protectedPeersByLatency = this._peerPoolConfig.latencyProtectionRatio
            ? exports.filterPeersByCategory(peers, {
                category: PROTECTION_CATEGORY.LATENCY,
                percentage: this._peerPoolConfig.latencyProtectionRatio,
                protectBy: PROTECT_BY.LOWEST,
            }).map(peer => peer.id)
            : [];
        const protectedPeersByResponseRate = this._peerPoolConfig.productivityProtectionRatio
            ? exports.filterPeersByCategory(peers, {
                category: PROTECTION_CATEGORY.RESPONSE_RATE,
                percentage: this._peerPoolConfig.productivityProtectionRatio,
                protectBy: PROTECT_BY.HIGHEST,
            }).map(peer => peer.id)
            : [];
        const uniqueProtectedPeers = new Set([
            ...protectedPeersByNetgroup,
            ...protectedPeersByLatency,
            ...protectedPeersByResponseRate,
        ]);
        const unprotectedPeers = peers.filter(peer => !uniqueProtectedPeers.has(peer.id));
        const protectedPeersByConnectTime = this._peerPoolConfig.longevityProtectionRatio
            ? new Set([
                ...exports.filterPeersByCategory(unprotectedPeers, {
                    category: PROTECTION_CATEGORY.CONNECT_TIME,
                    percentage: this._peerPoolConfig.longevityProtectionRatio,
                    protectBy: PROTECT_BY.LOWEST,
                }).map(peer => peer.id),
            ])
            : new Set();
        return unprotectedPeers.filter(peer => !protectedPeersByConnectTime.has(peer.id));
    }
    _evictPeer(kind) {
        const peers = this.getPeers(kind);
        if (peers.length < 1) {
            return;
        }
        if (kind === peer_1.OutboundPeer) {
            const selectedPeer = shuffle(peers.filter(peer => peer.internalState.peerKind !== constants_1.PeerKind.FIXED_PEER))[0];
            if (selectedPeer) {
                this.removePeer(selectedPeer.id, constants_1.EVICTED_PEER_CODE, `Evicted outbound peer ${selectedPeer.id}`);
            }
        }
        if (kind === peer_1.InboundPeer) {
            const evictionCandidates = this._selectPeersForEviction();
            const peerToEvict = shuffle(evictionCandidates)[0];
            if (peerToEvict) {
                this.removePeer(peerToEvict.id, constants_1.EVICTED_PEER_CODE, `Evicted inbound peer ${peerToEvict.id}`);
            }
        }
    }
    _bindHandlersToPeer(peer) {
        peer.on(events_2.EVENT_REQUEST_RECEIVED, this._handlePeerRPC);
        peer.on(events_2.EVENT_MESSAGE_RECEIVED, this._handlePeerMessage);
        peer.on(events_2.EVENT_CONNECT_OUTBOUND, this._handleOutboundPeerConnect);
        peer.on(events_2.EVENT_CONNECT_ABORT_OUTBOUND, this._handleOutboundPeerConnectAbort);
        peer.on(events_2.EVENT_CLOSE_OUTBOUND, this._handlePeerCloseOutbound);
        peer.on(events_2.EVENT_CLOSE_INBOUND, this._handlePeerCloseInbound);
        peer.on(events_2.EVENT_OUTBOUND_SOCKET_ERROR, this._handlePeerOutboundSocketError);
        peer.on(events_2.EVENT_INBOUND_SOCKET_ERROR, this._handlePeerInboundSocketError);
        peer.on(events_2.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peer.on(events_2.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peer.on(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, this._handleFailedToFetchPeerInfo);
        peer.on(events_2.EVENT_FAILED_TO_FETCH_PEERS, this._handleFailedToFetchPeers);
        peer.on(events_2.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, this._handleFailedToCollectPeerDetails);
        peer.on(events_2.EVENT_BAN_PEER, this._handleBanPeer);
        peer.on(events_2.EVENT_DISCOVERED_PEER, this._handleDiscoverPeer);
    }
    _unbindHandlersFromPeer(peer) {
        peer.removeListener(events_2.EVENT_REQUEST_RECEIVED, this._handlePeerRPC);
        peer.removeListener(events_2.EVENT_MESSAGE_RECEIVED, this._handlePeerMessage);
        peer.removeListener(events_2.EVENT_CONNECT_OUTBOUND, this._handleOutboundPeerConnect);
        peer.removeListener(events_2.EVENT_CONNECT_ABORT_OUTBOUND, this._handleOutboundPeerConnectAbort);
        peer.removeListener(events_2.EVENT_CLOSE_OUTBOUND, this._handlePeerCloseOutbound);
        peer.removeListener(events_2.EVENT_CLOSE_INBOUND, this._handlePeerCloseInbound);
        peer.removeListener(events_2.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peer.removeListener(events_2.EVENT_FAILED_TO_FETCH_PEER_INFO, this._handleFailedToFetchPeerInfo);
        peer.removeListener(events_2.EVENT_FAILED_TO_FETCH_PEERS, this._handleFailedToFetchPeers);
        peer.removeListener(events_2.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peer.removeListener(events_2.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT, this._handleFailedToCollectPeerDetails);
        peer.removeListener(events_2.EVENT_BAN_PEER, this._handleBanPeer);
        peer.removeListener(events_2.EVENT_DISCOVERED_PEER, this._handleDiscoverPeer);
    }
    _addOutboundPeer(peerInfo, nodeInfo) {
        if (this.hasPeer(peerInfo.peerId) || this._peerBook.bannedIPs.has(peerInfo.ipAddress)) {
            return false;
        }
        const outboundConnectedPeer = this.getPeers(peer_1.OutboundPeer).find(p => p.ipAddress === peerInfo.ipAddress && p.ipAddress !== constants_1.DEFAULT_LOCALHOST_IP);
        if (outboundConnectedPeer) {
            return false;
        }
        const peer = new peer_1.OutboundPeer(peerInfo, {
            ...this._peerConfig,
            serverNodeInfo: nodeInfo,
        });
        this._peerMap.set(peer.id, peer);
        this._bindHandlersToPeer(peer);
        if (this._nodeInfo) {
            this._applyNodeInfoOnPeer(peer);
        }
        return true;
    }
}
exports.PeerPool = PeerPool;
//# sourceMappingURL=peer_pool.js.map