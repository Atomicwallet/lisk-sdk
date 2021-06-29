"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAG_TRANSACTION = exports.TAG_BLOCK_HEADER = exports.GENESIS_BLOCK_TRANSACTION_ROOT = exports.GENESIS_BLOCK_SIGNATURE = exports.GENESIS_BLOCK_REWARD = exports.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY = exports.GENESIS_BLOCK_VERSION = exports.EMPTY_HASH = exports.EMPTY_BUFFER = exports.EVENT_VALIDATORS_CHANGED = exports.EVENT_DELETE_BLOCK = exports.EVENT_NEW_BLOCK = exports.DEFAULT_MAX_BLOCK_HEADER_CACHE = exports.DEFAULT_MIN_BLOCK_HEADER_CACHE = exports.CONSENSUS_STATE_VALIDATORS_KEY = exports.CONSENSUS_STATE_FINALIZED_HEIGHT_KEY = exports.CHAIN_STATE_BURNT_FEE = void 0;
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
exports.TAG_BLOCK_HEADER = lisk_cryptography_1.createMessageTag('BH');
exports.TAG_TRANSACTION = lisk_cryptography_1.createMessageTag('TX');
//# sourceMappingURL=constants.js.map