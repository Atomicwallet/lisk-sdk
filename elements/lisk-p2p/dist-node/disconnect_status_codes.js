"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_CONNECTION_REASON = exports.FORBIDDEN_CONNECTION = exports.INCOMPATIBLE_PEER_UNKNOWN_REASON = exports.INCOMPATIBLE_PEER_CODE = exports.INCOMPATIBLE_PROTOCOL_VERSION_REASON = exports.INCOMPATIBLE_PROTOCOL_VERSION_CODE = exports.INCOMPATIBLE_NETWORK_REASON = exports.INCOMPATIBLE_NETWORK_CODE = exports.INVALID_CONNECTION_SELF_REASON = exports.INVALID_CONNECTION_SELF_CODE = exports.INVALID_CONNECTION_QUERY_REASON = exports.INVALID_CONNECTION_QUERY_CODE = exports.INVALID_CONNECTION_URL_REASON = exports.INVALID_CONNECTION_URL_CODE = void 0;
exports.INVALID_CONNECTION_URL_CODE = 4501;
exports.INVALID_CONNECTION_URL_REASON = 'Peer did not provide a valid URL as part of the WebSocket connection';
exports.INVALID_CONNECTION_QUERY_CODE = 4502;
exports.INVALID_CONNECTION_QUERY_REASON = 'Peer did not provide valid query parameters as part of the WebSocket connection';
exports.INVALID_CONNECTION_SELF_CODE = 4101;
exports.INVALID_CONNECTION_SELF_REASON = 'Peer cannot connect to itself';
exports.INCOMPATIBLE_NETWORK_CODE = 4102;
exports.INCOMPATIBLE_NETWORK_REASON = 'Peer nethash did not match our own';
exports.INCOMPATIBLE_PROTOCOL_VERSION_CODE = 4103;
exports.INCOMPATIBLE_PROTOCOL_VERSION_REASON = 'Peer has incompatible protocol version';
exports.INCOMPATIBLE_PEER_CODE = 4104;
exports.INCOMPATIBLE_PEER_UNKNOWN_REASON = 'Peer is incompatible with the node for unknown reasons';
exports.FORBIDDEN_CONNECTION = 4403;
exports.FORBIDDEN_CONNECTION_REASON = 'Peer is not allowed to connect';
//# sourceMappingURL=disconnect_status_codes.js.map