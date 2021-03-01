"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.EMPTY_BUFFER = Buffer.alloc(0);
exports.EMPTY_HASH = lisk_cryptography_1.hash(exports.EMPTY_BUFFER);
exports.GENESIS_BLOCK_VERSION = 0;
exports.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY = exports.EMPTY_BUFFER;
exports.GENESIS_BLOCK_REWARD = BigInt(0);
exports.GENESIS_BLOCK_SIGNATURE = exports.EMPTY_BUFFER;
exports.GENESIS_BLOCK_TRANSACTION_ROOT = exports.EMPTY_HASH;
exports.GENESIS_BLOCK_MAX_BALANCE = BigInt(2) ** BigInt(63) - BigInt(1);
//# sourceMappingURL=constants.js.map