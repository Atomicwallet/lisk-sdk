"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.EMPTY_HASH = lisk_cryptography_1.hash(Buffer.alloc(0));
exports.LEAF_PREFIX = Buffer.from('00', 'hex');
exports.BRANCH_PREFIX = Buffer.from('01', 'hex');
exports.LAYER_INDEX_SIZE = 1;
exports.NODE_INDEX_SIZE = 8;
exports.NODE_HASH_SIZE = 32;
//# sourceMappingURL=constants.js.map