"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVALID_CONNECTION_SELF_REASON = exports.INVALID_CONNECTION_SELF_CODE = exports.INVALID_CONNECTION_QUERY_REASON = exports.INVALID_CONNECTION_QUERY_CODE = exports.INVALID_CONNECTION_URL_REASON = exports.INVALID_CONNECTION_URL_CODE = exports.SEED_PEER_DISCONNECTION_REASON = exports.INTENTIONAL_DISCONNECT_CODE = exports.DEFAULT_MAX_RECONNECT_TRIES = exports.DEFAULT_TRIED_BUCKET_SIZE = exports.DEFAULT_TRIED_BUCKET_COUNT = exports.DEFAULT_EVICTION_THRESHOLD_TIME = exports.DEFAULT_NEW_BUCKET_SIZE = exports.DEFAULT_NEW_BUCKET_COUNT = exports.DEFAULT_PING_INTERVAL_MIN = exports.DEFAULT_PING_INTERVAL_MAX = exports.INVALID_PEER_INFO_PENALTY = exports.INVALID_PEER_LIST_PENALTY = exports.DEFAULT_HTTP_PATH = exports.DEFAULT_PRODUCTIVITY = exports.DEFAULT_PEER_STATUS_MESSAGE_RATE = exports.DEFAULT_PRODUCTIVITY_RESET_INTERVAL = exports.DEFAULT_REPUTATION_SCORE = exports.DEFAULT_ACK_TIMEOUT = exports.DEFAULT_CONNECT_TIMEOUT = exports.DEFAULT_MIN_TRIED_PEER_COUNT = exports.DEFAULT_MAX_PEER_INFO_SIZE = exports.DEFAULT_MAX_PEER_DISCOVERY_RESPONSE_LENGTH = exports.DEFAULT_MIN_PEER_DISCOVERY_THRESHOLD = exports.DEFAULT_PEER_PROTECTION_FOR_LONGEVITY = exports.DEFAULT_PEER_PROTECTION_FOR_USEFULNESS = exports.DEFAULT_PEER_PROTECTION_FOR_LATENCY = exports.DEFAULT_PEER_PROTECTION_FOR_NETGROUP = exports.DEFAULT_OUTBOUND_SHUFFLE_INTERVAL = exports.DEFAULT_MAX_INBOUND_CONNECTIONS = exports.DEFAULT_MAX_OUTBOUND_CONNECTIONS = exports.DEFAULT_RANDOM_SECRET = exports.DEFAULT_NONCE_LENGTH_BYTES = exports.DEFAULT_WS_MAX_PAYLOAD = exports.DEFAULT_RATE_CALCULATION_INTERVAL = exports.DEFAULT_WS_MAX_MESSAGE_RATE_PENALTY = exports.DEFAULT_WS_MAX_MESSAGE_RATE = exports.DEFAULT_CONTROL_MESSAGE_LIMIT = exports.DEFAULT_SEND_PEER_LIMIT = exports.DEFAULT_FALLBACK_SEED_PEER_DISCOVERY_INTERVAL = exports.DEFAULT_POPULATOR_INTERVAL = exports.DEFAULT_BAN_TIME = exports.DEFAULT_LOCALHOST_IP = exports.DEFAULT_NODE_HOST_IP = exports.DEFAULT_MESSAGE_ENCODING_FORMAT = void 0;
exports.PeerKind = exports.ConnectionKind = exports.PEER_INFO_LIST_TOO_LONG_REASON = exports.INVALID_PEER_INFO_LIST_REASON = exports.INVALID_CONNECTION_ADDRESS_REASON = exports.INVALID_CONNECTION_ADDRESS_CODE = exports.DUPLICATE_CONNECTION_REASON = exports.DUPLICATE_CONNECTION = exports.EVICTED_PEER_CODE = exports.FORBIDDEN_CONNECTION_REASON = exports.FORBIDDEN_CONNECTION = exports.INCOMPATIBLE_PEER_INFO_CODE_REASON = exports.INCOMPATIBLE_PEER_INFO_CODE = exports.INCOMPATIBLE_PEER_UNKNOWN_REASON = exports.INCOMPATIBLE_PEER_CODE = exports.INCOMPATIBLE_PROTOCOL_VERSION_REASON = exports.INCOMPATIBLE_PROTOCOL_VERSION_CODE = exports.INCOMPATIBLE_NETWORK_REASON = exports.INCOMPATIBLE_NETWORK_CODE = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.DEFAULT_MESSAGE_ENCODING_FORMAT = 'base64';
exports.DEFAULT_NODE_HOST_IP = '0.0.0.0';
exports.DEFAULT_LOCALHOST_IP = '127.0.0.1';
exports.DEFAULT_BAN_TIME = 86400000;
exports.DEFAULT_POPULATOR_INTERVAL = 10000;
exports.DEFAULT_FALLBACK_SEED_PEER_DISCOVERY_INTERVAL = 30000;
exports.DEFAULT_SEND_PEER_LIMIT = 16;
exports.DEFAULT_CONTROL_MESSAGE_LIMIT = 10;
exports.DEFAULT_WS_MAX_MESSAGE_RATE = 100;
exports.DEFAULT_WS_MAX_MESSAGE_RATE_PENALTY = 10;
exports.DEFAULT_RATE_CALCULATION_INTERVAL = 1000;
exports.DEFAULT_WS_MAX_PAYLOAD = 3048576;
exports.DEFAULT_NONCE_LENGTH_BYTES = 8;
const SECRET_BYTE_LENGTH = 4;
exports.DEFAULT_RANDOM_SECRET = lisk_cryptography_1.getRandomBytes(SECRET_BYTE_LENGTH).readUInt32BE(0);
exports.DEFAULT_MAX_OUTBOUND_CONNECTIONS = 20;
exports.DEFAULT_MAX_INBOUND_CONNECTIONS = 100;
exports.DEFAULT_OUTBOUND_SHUFFLE_INTERVAL = 300000;
exports.DEFAULT_PEER_PROTECTION_FOR_NETGROUP = 0.034;
exports.DEFAULT_PEER_PROTECTION_FOR_LATENCY = 0.068;
exports.DEFAULT_PEER_PROTECTION_FOR_USEFULNESS = 0.068;
exports.DEFAULT_PEER_PROTECTION_FOR_LONGEVITY = 0.5;
exports.DEFAULT_MIN_PEER_DISCOVERY_THRESHOLD = 100;
exports.DEFAULT_MAX_PEER_DISCOVERY_RESPONSE_LENGTH = 200;
exports.DEFAULT_MAX_PEER_INFO_SIZE = 20480;
exports.DEFAULT_MIN_TRIED_PEER_COUNT = 100;
exports.DEFAULT_CONNECT_TIMEOUT = 2000;
exports.DEFAULT_ACK_TIMEOUT = 2000;
exports.DEFAULT_REPUTATION_SCORE = 100;
exports.DEFAULT_PRODUCTIVITY_RESET_INTERVAL = 20000;
exports.DEFAULT_PEER_STATUS_MESSAGE_RATE = 4;
exports.DEFAULT_PRODUCTIVITY = {
    requestCounter: 0,
    responseCounter: 0,
    responseRate: 0,
    lastResponded: 0,
};
exports.DEFAULT_HTTP_PATH = '/rpc/';
exports.INVALID_PEER_LIST_PENALTY = 100;
exports.INVALID_PEER_INFO_PENALTY = 100;
exports.DEFAULT_PING_INTERVAL_MAX = 60000;
exports.DEFAULT_PING_INTERVAL_MIN = 20000;
exports.DEFAULT_NEW_BUCKET_COUNT = 128;
exports.DEFAULT_NEW_BUCKET_SIZE = 32;
exports.DEFAULT_EVICTION_THRESHOLD_TIME = 86400000;
exports.DEFAULT_TRIED_BUCKET_COUNT = 64;
exports.DEFAULT_TRIED_BUCKET_SIZE = 32;
exports.DEFAULT_MAX_RECONNECT_TRIES = 3;
exports.INTENTIONAL_DISCONNECT_CODE = 1000;
exports.SEED_PEER_DISCONNECTION_REASON = 'Disconnect from SeedPeer after discovery';
exports.INVALID_CONNECTION_URL_CODE = 4501;
exports.INVALID_CONNECTION_URL_REASON = 'Peer did not provide a valid URL as part of the WebSocket connection';
exports.INVALID_CONNECTION_QUERY_CODE = 4502;
exports.INVALID_CONNECTION_QUERY_REASON = 'Peer did not provide valid query parameters as part of the WebSocket connection';
exports.INVALID_CONNECTION_SELF_CODE = 4101;
exports.INVALID_CONNECTION_SELF_REASON = 'Peer cannot connect to itself';
exports.INCOMPATIBLE_NETWORK_CODE = 4102;
exports.INCOMPATIBLE_NETWORK_REASON = 'Peer networkIdentifier did not match our own';
exports.INCOMPATIBLE_PROTOCOL_VERSION_CODE = 4103;
exports.INCOMPATIBLE_PROTOCOL_VERSION_REASON = 'Peer has incompatible protocol version';
exports.INCOMPATIBLE_PEER_CODE = 4104;
exports.INCOMPATIBLE_PEER_UNKNOWN_REASON = 'Peer is incompatible with the node for unknown reasons';
exports.INCOMPATIBLE_PEER_INFO_CODE = 4105;
exports.INCOMPATIBLE_PEER_INFO_CODE_REASON = 'Peer has invalid PeerInfo';
exports.FORBIDDEN_CONNECTION = 4403;
exports.FORBIDDEN_CONNECTION_REASON = 'Peer is not allowed to connect';
exports.EVICTED_PEER_CODE = 4418;
exports.DUPLICATE_CONNECTION = 4404;
exports.DUPLICATE_CONNECTION_REASON = 'Peer has a duplicate connection';
exports.INVALID_CONNECTION_ADDRESS_CODE = 4503;
exports.INVALID_CONNECTION_ADDRESS_REASON = 'Peer did not provide a valid address as part of the WebSocket connection';
exports.INVALID_PEER_INFO_LIST_REASON = 'PeerInfo list has invalid value';
exports.PEER_INFO_LIST_TOO_LONG_REASON = 'PeerInfo list is too long';
var ConnectionKind;
(function (ConnectionKind) {
    ConnectionKind["OUTBOUND"] = "outbound";
    ConnectionKind["INBOUND"] = "inbound";
    ConnectionKind["NONE"] = "none";
})(ConnectionKind = exports.ConnectionKind || (exports.ConnectionKind = {}));
var PeerKind;
(function (PeerKind) {
    PeerKind["FIXED_PEER"] = "fixedPeer";
    PeerKind["WHITELISTED_PEER"] = "whitelistedPeer";
    PeerKind["SEED_PEER"] = "seedPeer";
    PeerKind["BLACKLISTED_PEER"] = "blacklistedPeer";
    PeerKind["NONE"] = "NONE";
})(PeerKind = exports.PeerKind || (exports.PeerKind = {}));
//# sourceMappingURL=constants.js.map