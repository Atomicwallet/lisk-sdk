export declare const DEFAULT_MESSAGE_ENCODING_FORMAT = "base64";
export declare const DEFAULT_NODE_HOST_IP = "0.0.0.0";
export declare const DEFAULT_LOCALHOST_IP = "127.0.0.1";
export declare const DEFAULT_BAN_TIME = 86400000;
export declare const DEFAULT_POPULATOR_INTERVAL = 10000;
export declare const DEFAULT_FALLBACK_SEED_PEER_DISCOVERY_INTERVAL = 30000;
export declare const DEFAULT_SEND_PEER_LIMIT = 16;
export declare const DEFAULT_CONTROL_MESSAGE_LIMIT = 10;
export declare const DEFAULT_WS_MAX_MESSAGE_RATE = 100;
export declare const DEFAULT_WS_MAX_MESSAGE_RATE_PENALTY = 10;
export declare const DEFAULT_RATE_CALCULATION_INTERVAL = 1000;
export declare const DEFAULT_WS_MAX_PAYLOAD = 3048576;
export declare const DEFAULT_NONCE_LENGTH_BYTES = 8;
export declare const DEFAULT_RANDOM_SECRET: number;
export declare const DEFAULT_MAX_OUTBOUND_CONNECTIONS = 20;
export declare const DEFAULT_MAX_INBOUND_CONNECTIONS = 100;
export declare const DEFAULT_OUTBOUND_SHUFFLE_INTERVAL = 300000;
export declare const DEFAULT_PEER_PROTECTION_FOR_NETGROUP = 0.034;
export declare const DEFAULT_PEER_PROTECTION_FOR_LATENCY = 0.068;
export declare const DEFAULT_PEER_PROTECTION_FOR_USEFULNESS = 0.068;
export declare const DEFAULT_PEER_PROTECTION_FOR_LONGEVITY = 0.5;
export declare const DEFAULT_MIN_PEER_DISCOVERY_THRESHOLD = 100;
export declare const DEFAULT_MAX_PEER_DISCOVERY_RESPONSE_LENGTH = 200;
export declare const DEFAULT_MAX_PEER_INFO_SIZE = 20480;
export declare const DEFAULT_MIN_TRIED_PEER_COUNT = 100;
export declare const DEFAULT_CONNECT_TIMEOUT = 2000;
export declare const DEFAULT_ACK_TIMEOUT = 2000;
export declare const DEFAULT_REPUTATION_SCORE = 100;
export declare const DEFAULT_PRODUCTIVITY_RESET_INTERVAL = 20000;
export declare const DEFAULT_PEER_STATUS_MESSAGE_RATE = 4;
export declare const DEFAULT_PRODUCTIVITY: {
    requestCounter: number;
    responseCounter: number;
    responseRate: number;
    lastResponded: number;
};
export declare const DEFAULT_HTTP_PATH = "/rpc/";
export declare const INVALID_PEER_LIST_PENALTY = 100;
export declare const INVALID_PEER_INFO_PENALTY = 100;
export declare const DEFAULT_PING_INTERVAL_MAX = 60000;
export declare const DEFAULT_PING_INTERVAL_MIN = 20000;
export declare const DEFAULT_NEW_BUCKET_COUNT = 128;
export declare const DEFAULT_NEW_BUCKET_SIZE = 32;
export declare const DEFAULT_EVICTION_THRESHOLD_TIME = 86400000;
export declare const DEFAULT_TRIED_BUCKET_COUNT = 64;
export declare const DEFAULT_TRIED_BUCKET_SIZE = 32;
export declare const DEFAULT_MAX_RECONNECT_TRIES = 3;
export declare const INTENTIONAL_DISCONNECT_CODE = 1000;
export declare const SEED_PEER_DISCONNECTION_REASON = "Disconnect from SeedPeer after discovery";
export declare const INVALID_CONNECTION_URL_CODE = 4501;
export declare const INVALID_CONNECTION_URL_REASON = "Peer did not provide a valid URL as part of the WebSocket connection";
export declare const INVALID_CONNECTION_QUERY_CODE = 4502;
export declare const INVALID_CONNECTION_QUERY_REASON = "Peer did not provide valid query parameters as part of the WebSocket connection";
export declare const INVALID_CONNECTION_SELF_CODE = 4101;
export declare const INVALID_CONNECTION_SELF_REASON = "Peer cannot connect to itself";
export declare const INCOMPATIBLE_NETWORK_CODE = 4102;
export declare const INCOMPATIBLE_NETWORK_REASON = "Peer networkIdentifier did not match our own";
export declare const INCOMPATIBLE_PROTOCOL_VERSION_CODE = 4103;
export declare const INCOMPATIBLE_PROTOCOL_VERSION_REASON = "Peer has incompatible protocol version";
export declare const INCOMPATIBLE_PEER_CODE = 4104;
export declare const INCOMPATIBLE_PEER_UNKNOWN_REASON = "Peer is incompatible with the node for unknown reasons";
export declare const INCOMPATIBLE_PEER_INFO_CODE = 4105;
export declare const INCOMPATIBLE_PEER_INFO_CODE_REASON = "Peer has invalid PeerInfo";
export declare const FORBIDDEN_CONNECTION = 4403;
export declare const FORBIDDEN_CONNECTION_REASON = "Peer is not allowed to connect";
export declare const EVICTED_PEER_CODE = 4418;
export declare const DUPLICATE_CONNECTION = 4404;
export declare const DUPLICATE_CONNECTION_REASON = "Peer has a duplicate connection";
export declare const INVALID_CONNECTION_ADDRESS_CODE = 4503;
export declare const INVALID_CONNECTION_ADDRESS_REASON = "Peer did not provide a valid address as part of the WebSocket connection";
export declare const INVALID_PEER_INFO_LIST_REASON = "PeerInfo list has invalid value";
export declare const PEER_INFO_LIST_TOO_LONG_REASON = "PeerInfo list is too long";
export declare enum ConnectionKind {
    OUTBOUND = "outbound",
    INBOUND = "inbound",
    NONE = "none"
}
export declare enum PeerKind {
    FIXED_PEER = "fixedPeer",
    WHITELISTED_PEER = "whitelistedPeer",
    SEED_PEER = "seedPeer",
    BLACKLISTED_PEER = "blacklistedPeer",
    NONE = "NONE"
}
