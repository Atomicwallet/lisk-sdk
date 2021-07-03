"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerPool = exports.MAX_PEER_DISCOVERY_PROBE_SAMPLE_SIZE = exports.MAX_PEER_LIST_BATCH_SIZE = exports.EVENT_FAILED_TO_FETCH_PEER_INFO = exports.EVENT_DISCOVERED_PEER = exports.EVENT_FAILED_TO_PUSH_NODE_INFO = exports.EVENT_FAILED_PEER_INFO_UPDATE = exports.EVENT_UPDATED_PEER_INFO = exports.EVENT_INBOUND_SOCKET_ERROR = exports.EVENT_OUTBOUND_SOCKET_ERROR = exports.EVENT_MESSAGE_RECEIVED = exports.EVENT_REQUEST_RECEIVED = exports.EVENT_CONNECT_ABORT_OUTBOUND = exports.EVENT_CONNECT_OUTBOUND = exports.EVENT_CLOSE_OUTBOUND = void 0;
const events_1 = require("events");
const shuffle = require("lodash.shuffle");
const errors_1 = require("./errors");
const peer_1 = require("./peer");
Object.defineProperty(exports, "EVENT_CLOSE_OUTBOUND", { enumerable: true, get: function () { return peer_1.EVENT_CLOSE_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_CONNECT_ABORT_OUTBOUND", { enumerable: true, get: function () { return peer_1.EVENT_CONNECT_ABORT_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_CONNECT_OUTBOUND", { enumerable: true, get: function () { return peer_1.EVENT_CONNECT_OUTBOUND; } });
Object.defineProperty(exports, "EVENT_DISCOVERED_PEER", { enumerable: true, get: function () { return peer_1.EVENT_DISCOVERED_PEER; } });
Object.defineProperty(exports, "EVENT_FAILED_PEER_INFO_UPDATE", { enumerable: true, get: function () { return peer_1.EVENT_FAILED_PEER_INFO_UPDATE; } });
Object.defineProperty(exports, "EVENT_FAILED_TO_FETCH_PEER_INFO", { enumerable: true, get: function () { return peer_1.EVENT_FAILED_TO_FETCH_PEER_INFO; } });
Object.defineProperty(exports, "EVENT_FAILED_TO_PUSH_NODE_INFO", { enumerable: true, get: function () { return peer_1.EVENT_FAILED_TO_PUSH_NODE_INFO; } });
Object.defineProperty(exports, "EVENT_INBOUND_SOCKET_ERROR", { enumerable: true, get: function () { return peer_1.EVENT_INBOUND_SOCKET_ERROR; } });
Object.defineProperty(exports, "EVENT_MESSAGE_RECEIVED", { enumerable: true, get: function () { return peer_1.EVENT_MESSAGE_RECEIVED; } });
Object.defineProperty(exports, "EVENT_OUTBOUND_SOCKET_ERROR", { enumerable: true, get: function () { return peer_1.EVENT_OUTBOUND_SOCKET_ERROR; } });
Object.defineProperty(exports, "EVENT_REQUEST_RECEIVED", { enumerable: true, get: function () { return peer_1.EVENT_REQUEST_RECEIVED; } });
Object.defineProperty(exports, "EVENT_UPDATED_PEER_INFO", { enumerable: true, get: function () { return peer_1.EVENT_UPDATED_PEER_INFO; } });
const peer_discovery_1 = require("./peer_discovery");
const peer_selection_1 = require("./peer_selection");
exports.MAX_PEER_LIST_BATCH_SIZE = 100;
exports.MAX_PEER_DISCOVERY_PROBE_SAMPLE_SIZE = 100;
const selectRandomPeerSample = (peerList, count) => shuffle(peerList).slice(0, count);
class PeerPool extends events_1.EventEmitter {
    constructor(peerPoolConfig) {
        super();
        this._peerMap = new Map();
        this._peerPoolConfig = peerPoolConfig;
        this._peerSelectForSend = peerPoolConfig.peerSelectionForSend;
        this._peerSelectForRequest = peerPoolConfig.peerSelectionForRequest;
        this._peerSelectForConnection = peerPoolConfig.peerSelectionForConnection;
        this._sendPeerLimit = peerPoolConfig.sendPeerLimit;
        this._handlePeerRPC = (request) => {
            this.emit(peer_1.EVENT_REQUEST_RECEIVED, request);
        };
        this._handlePeerMessage = (message) => {
            this.emit(peer_1.EVENT_MESSAGE_RECEIVED, message);
        };
        this._handleDiscoverPeer = (peerInfo) => {
            this.emit(peer_1.EVENT_DISCOVERED_PEER, peerInfo);
        };
        this._handlePeerConnect = async (peerInfo) => {
            this.emit(peer_1.EVENT_CONNECT_OUTBOUND, peerInfo);
        };
        this._handlePeerConnectAbort = (peerInfo) => {
            this.emit(peer_1.EVENT_CONNECT_ABORT_OUTBOUND, peerInfo);
        };
        this._handlePeerClose = (closePacket) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(closePacket.peerInfo);
            this.removePeer(peerId);
            this.emit(peer_1.EVENT_CLOSE_OUTBOUND, closePacket);
        };
        this._handlePeerOutboundSocketError = (error) => {
            this.emit(peer_1.EVENT_OUTBOUND_SOCKET_ERROR, error);
        };
        this._handlePeerInboundSocketError = (error) => {
            this.emit(peer_1.EVENT_INBOUND_SOCKET_ERROR, error);
        };
        this._handlePeerInfoUpdate = (peerInfo) => {
            this.emit(peer_1.EVENT_UPDATED_PEER_INFO, peerInfo);
        };
        this._handleFailedPeerInfoUpdate = (error) => {
            this.emit(peer_1.EVENT_FAILED_PEER_INFO_UPDATE, error);
        };
    }
    applyNodeInfo(nodeInfo) {
        this._nodeInfo = nodeInfo;
        const peerList = this.getAllPeers();
        peerList.forEach(peer => {
            this._applyNodeInfoOnPeer(peer, nodeInfo);
        });
    }
    get nodeInfo() {
        return this._nodeInfo;
    }
    async requestFromPeer(packet) {
        const listOfPeerInfo = [...this._peerMap.values()].map((peer) => peer.peerInfo);
        const selectedPeers = this._peerSelectForRequest({
            peers: peer_selection_1.getUniquePeersbyIp(listOfPeerInfo),
            nodeInfo: this._nodeInfo,
            peerLimit: 1,
            requestPacket: packet,
        });
        if (selectedPeers.length <= 0) {
            throw new errors_1.RequestFailError('Request failed due to no peers found in peer selection');
        }
        const selectedPeerId = peer_1.constructPeerIdFromPeerInfo(selectedPeers[0]);
        const selectedPeer = this._peerMap.get(selectedPeerId);
        if (!selectedPeer) {
            throw new errors_1.RequestFailError(`No such Peer exist in PeerPool with the selected peer with Id: ${selectedPeerId}`);
        }
        const response = await selectedPeer.request(packet);
        return response;
    }
    sendToPeers(message) {
        const listOfPeerInfo = [...this._peerMap.values()].map((peer) => peer.peerInfo);
        const selectedPeers = this._peerSelectForSend({
            peers: listOfPeerInfo,
            nodeInfo: this._nodeInfo,
            peerLimit: this._sendPeerLimit,
            messagePacket: message,
        });
        selectedPeers.forEach((peerInfo) => {
            const selectedPeerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            const peer = this._peerMap.get(selectedPeerId);
            if (peer) {
                peer.send(message);
            }
        });
    }
    async fetchStatusAndCreatePeers(seedPeers, nodeInfo, peerConfig) {
        const listOfPeerInfos = await Promise.all(seedPeers.map(async (seedPeer) => {
            try {
                const seedFetchStatusResponse = await peer_1.connectAndFetchPeerInfo(seedPeer, nodeInfo, peerConfig);
                const peerId = peer_1.constructPeerIdFromPeerInfo(seedFetchStatusResponse.peerInfo);
                this.addOutboundPeer(peerId, seedFetchStatusResponse.peerInfo, seedFetchStatusResponse.socket);
                return seedFetchStatusResponse.peerInfo;
            }
            catch (error) {
                this.emit(peer_1.EVENT_FAILED_TO_FETCH_PEER_INFO, error);
                return undefined;
            }
        }));
        const filteredListOfPeers = listOfPeerInfos.filter(peerInfo => peerInfo !== undefined);
        return filteredListOfPeers;
    }
    async runDiscovery(knownPeers, blacklist) {
        const peersForDiscovery = knownPeers.map(peerInfo => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            const existingPeer = this.getPeer(peerId);
            return existingPeer ? existingPeer : this.addPeer(peerInfo);
        });
        const peerSampleToProbe = selectRandomPeerSample(peersForDiscovery, exports.MAX_PEER_DISCOVERY_PROBE_SAMPLE_SIZE);
        const discoveredPeers = await peer_discovery_1.discoverPeers(peerSampleToProbe, {
            blacklist: blacklist.map(peer => peer.ipAddress),
        });
        return discoveredPeers;
    }
    selectPeersAndConnect(peers) {
        const peersToConnect = this._peerSelectForConnection({ peers });
        peersToConnect.forEach((peerInfo) => {
            const peerId = peer_1.constructPeerIdFromPeerInfo(peerInfo);
            const existingPeer = this.getPeer(peerId);
            return existingPeer ? existingPeer : this.addPeer(peerInfo);
        });
        return peersToConnect;
    }
    addPeer(peerInfo, inboundSocket) {
        const peerConfig = {
            connectTimeout: this._peerPoolConfig.connectTimeout,
            ackTimeout: this._peerPoolConfig.ackTimeout,
            maxPeerListSize: exports.MAX_PEER_LIST_BATCH_SIZE,
        };
        const peer = new peer_1.Peer(peerInfo, peerConfig, { inbound: inboundSocket });
        if (this._peerMap.has(peer.id)) {
            throw new Error(`Peer ${peer.id} was already in the peer pool`);
        }
        this._peerMap.set(peer.id, peer);
        this._bindHandlersToPeer(peer);
        if (this._nodeInfo) {
            this._applyNodeInfoOnPeer(peer, this._nodeInfo);
        }
        peer.connect();
        return peer;
    }
    addDiscoveredPeer(detailedPeerInfo, inboundSocket) {
        const peerConfig = {
            connectTimeout: this._peerPoolConfig.connectTimeout,
            ackTimeout: this._peerPoolConfig.ackTimeout,
            maxPeerListSize: exports.MAX_PEER_LIST_BATCH_SIZE,
        };
        const peer = new peer_1.Peer(detailedPeerInfo, peerConfig, {
            inbound: inboundSocket,
        });
        this._peerMap.set(peer.id, peer);
        this._bindHandlersToPeer(peer);
        if (this._nodeInfo) {
            this._applyNodeInfoOnPeer(peer, this._nodeInfo);
        }
        peer.connect();
        return peer;
    }
    addInboundPeer(peerId, peerInfo, socket) {
        const existingPeer = this.getPeer(peerId);
        if (existingPeer) {
            if (existingPeer.state.inbound === peer_1.ConnectionState.DISCONNECTED) {
                existingPeer.inboundSocket = socket;
                return false;
            }
            return false;
        }
        this.addPeer(peerInfo, socket);
        return true;
    }
    addOutboundPeer(peerId, peerInfo, socket) {
        const existingPeer = this.getPeer(peerId);
        if (existingPeer) {
            if (existingPeer.state.outbound === peer_1.ConnectionState.DISCONNECTED) {
                existingPeer.outboundSocket = socket;
                return false;
            }
            return false;
        }
        const peerConfig = {
            connectTimeout: this._peerPoolConfig.connectTimeout,
            ackTimeout: this._peerPoolConfig.ackTimeout,
            wsMaxPayload: this._peerPoolConfig.wsMaxPayload,
            maxPeerListSize: exports.MAX_PEER_LIST_BATCH_SIZE,
        };
        const peer = new peer_1.Peer(peerInfo, peerConfig, { outbound: socket });
        this._peerMap.set(peer.id, peer);
        this._bindHandlersToPeer(peer);
        if (this._nodeInfo) {
            this._applyNodeInfoOnPeer(peer, this._nodeInfo);
        }
        return true;
    }
    removeAllPeers() {
        this._peerMap.forEach((peer) => {
            this.removePeer(peer.id);
        });
    }
    getAllConnectedPeerInfos() {
        return this.getConnectedPeers().map(peer => peer.peerInfo);
    }
    getConnectedPeers() {
        const peers = this.getAllPeers();
        return peers.filter(peer => peer.state.outbound === peer_1.ConnectionState.CONNECTED ||
            peer.state.inbound === peer_1.ConnectionState.CONNECTED);
    }
    getUniqueConnectedPeers() {
        return peer_selection_1.getUniquePeersbyIp(this.getAllConnectedPeerInfos());
    }
    getAllPeerInfos() {
        return this.getAllPeers().map(peer => peer.peerInfo);
    }
    getAllPeers() {
        return [...this._peerMap.values()];
    }
    getPeer(peerId) {
        return this._peerMap.get(peerId);
    }
    hasPeer(peerId) {
        return this._peerMap.has(peerId);
    }
    removePeer(peerId) {
        const peer = this._peerMap.get(peerId);
        if (peer) {
            peer.disconnect();
            this._unbindHandlersFromPeer(peer);
        }
        return this._peerMap.delete(peerId);
    }
    _applyNodeInfoOnPeer(peer, nodeInfo) {
        (async () => {
            try {
                await peer.applyNodeInfo(nodeInfo);
            }
            catch (error) {
                this.emit(peer_1.EVENT_FAILED_TO_PUSH_NODE_INFO, error);
            }
        })();
    }
    _bindHandlersToPeer(peer) {
        peer.on(peer_1.EVENT_REQUEST_RECEIVED, this._handlePeerRPC);
        peer.on(peer_1.EVENT_MESSAGE_RECEIVED, this._handlePeerMessage);
        peer.on(peer_1.EVENT_CONNECT_OUTBOUND, this._handlePeerConnect);
        peer.on(peer_1.EVENT_CONNECT_ABORT_OUTBOUND, this._handlePeerConnectAbort);
        peer.on(peer_1.EVENT_CLOSE_OUTBOUND, this._handlePeerClose);
        peer.on(peer_1.EVENT_OUTBOUND_SOCKET_ERROR, this._handlePeerOutboundSocketError);
        peer.on(peer_1.EVENT_INBOUND_SOCKET_ERROR, this._handlePeerInboundSocketError);
        peer.on(peer_1.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peer.on(peer_1.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peer.on(peer_1.EVENT_DISCOVERED_PEER, this._handleDiscoverPeer);
    }
    _unbindHandlersFromPeer(peer) {
        peer.removeListener(peer_1.EVENT_REQUEST_RECEIVED, this._handlePeerRPC);
        peer.removeListener(peer_1.EVENT_MESSAGE_RECEIVED, this._handlePeerMessage);
        peer.removeListener(peer_1.EVENT_CONNECT_OUTBOUND, this._handlePeerConnect);
        peer.removeListener(peer_1.EVENT_CONNECT_ABORT_OUTBOUND, this._handlePeerConnectAbort);
        peer.removeListener(peer_1.EVENT_CLOSE_OUTBOUND, this._handlePeerClose);
        peer.removeListener(peer_1.EVENT_UPDATED_PEER_INFO, this._handlePeerInfoUpdate);
        peer.removeListener(peer_1.EVENT_FAILED_PEER_INFO_UPDATE, this._handleFailedPeerInfoUpdate);
        peer.removeListener(peer_1.EVENT_DISCOVERED_PEER, this._handleDiscoverPeer);
    }
}
exports.PeerPool = PeerPool;
//# sourceMappingURL=peer_pool.js.map