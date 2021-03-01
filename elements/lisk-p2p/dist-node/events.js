"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_NEW_INBOUND_PEER = 'EVENT_NEW_INBOUND_PEER';
exports.EVENT_NEW_INBOUND_PEER_CONNECTION = 'EVENT_NEW_INBOUND_PEER_CONNECTION';
exports.EVENT_FAILED_TO_ADD_INBOUND_PEER = 'EVENT_FAILED_TO_ADD_INBOUND_PEER';
exports.EVENT_NETWORK_READY = 'EVENT_NETWORK_READY';
exports.EVENT_REMOVE_PEER = 'EVENT_REMOVE_PEER';
exports.EVENT_REQUEST_RECEIVED = 'EVENT_REQUEST_RECEIVED';
exports.EVENT_INVALID_REQUEST_RECEIVED = 'EVENT_INVALID_REQUEST_RECEIVED';
exports.EVENT_MESSAGE_RECEIVED = 'EVENT_MESSAGE_RECEIVED';
exports.EVENT_INVALID_MESSAGE_RECEIVED = 'EVENT_INVALID_MESSAGE_RECEIVED';
exports.EVENT_BAN_PEER = 'EVENT_BAN_PEER';
exports.EVENT_DISCOVERED_PEER = 'EVENT_DISCOVERED_PEER';
exports.EVENT_UPDATED_PEER_INFO = 'EVENT_UPDATED_PEER_INFO';
exports.EVENT_FAILED_PEER_INFO_UPDATE = 'EVENT_FAILED_PEER_INFO_UPDATE';
exports.EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT = 'EVENT_FAILED_TO_COLLECT_PEER_DETAILS_ON_CONNECT';
exports.EVENT_FAILED_TO_FETCH_PEERS = 'EVENT_FAILED_TO_FETCH_PEERS';
exports.EVENT_FAILED_TO_FETCH_PEER_INFO = 'EVENT_FAILED_TO_FETCH_PEER_INFO';
exports.EVENT_FAILED_TO_PUSH_NODE_INFO = 'EVENT_FAILED_TO_PUSH_NODE_INFO';
exports.EVENT_FAILED_TO_SEND_MESSAGE = 'EVENT_FAILED_TO_SEND_MESSAGE';
exports.REMOTE_SC_EVENT_RPC_REQUEST = 'rpc-request';
exports.REMOTE_SC_EVENT_MESSAGE = 'remote-message';
exports.REMOTE_EVENT_POST_NODE_INFO = 'postNodeInfo';
exports.REMOTE_EVENT_RPC_GET_NODE_INFO = 'getNodeInfo';
exports.REMOTE_EVENT_RPC_GET_PEERS_LIST = 'getPeers';
exports.REMOTE_EVENT_PING = 'ping';
exports.REMOTE_EVENT_PONG = 'pong';
exports.PROTOCOL_EVENTS_TO_RATE_LIMIT = new Set([
    exports.REMOTE_EVENT_RPC_GET_NODE_INFO,
    exports.REMOTE_EVENT_RPC_GET_PEERS_LIST,
]);
exports.EVENT_CLOSE_INBOUND = 'EVENT_CLOSE_INBOUND';
exports.EVENT_INBOUND_SOCKET_ERROR = 'EVENT_INBOUND_SOCKET_ERROR';
exports.EVENT_CONNECT_OUTBOUND = 'EVENT_CONNECT_OUTBOUND';
exports.EVENT_CONNECT_ABORT_OUTBOUND = 'EVENT_CONNECT_ABORT_OUTBOUND';
exports.EVENT_CLOSE_OUTBOUND = 'EVENT_CLOSE_OUTBOUND';
exports.EVENT_OUTBOUND_SOCKET_ERROR = 'EVENT_OUTBOUND_SOCKET_ERROR';
//# sourceMappingURL=events.js.map