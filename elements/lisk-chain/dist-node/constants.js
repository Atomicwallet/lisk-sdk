"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.CHAIN_STATE_BURNT_FEE = 'burntFee';
exports.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY = 'finalizedHeight';
exports.CONSENSUS_STATE_VALIDATORS_KEY = 'validators';
exports.DEFAULT_MIN_BLOCK_HEADER_CACHE = 309;
exports.DEFAULT_MAX_BLOCK_HEADER_CACHE = 515;
exports.EVENT_NEW_BLOCK = 'EVENT_NEW_BLOCK';
exports.EVENT_DELETE_BLOCK = 'EVENT_DELETE_BLOCK';
exports.EVENT_VALIDATORS_CHANGED = 'EVENT_VALIDATORS_CHANGED';
exports.EMPTY_BUFFER = Buffer.alloc(0);
exports.EMPTY_HASH = lisk_cryptography_1.hash(exports.EMPTY_BUFFER);
exports.GENESIS_BLOCK_VERSION = 0;
exports.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY = exports.EMPTY_BUFFER;
exports.GENESIS_BLOCK_REWARD = BigInt(0);
exports.GENESIS_BLOCK_SIGNATURE = exports.EMPTY_BUFFER;
exports.GENESIS_BLOCK_TRANSACTION_ROOT = exports.EMPTY_HASH;
//# sourceMappingURL=constants.js.map