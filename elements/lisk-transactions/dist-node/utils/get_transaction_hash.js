"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHash = void 0;
const cryptography = require("../../../lisk-cryptography");
const get_transaction_bytes_1 = require("./get_transaction_bytes");
const getTransactionHash = (transaction) => {
    const bytes = get_transaction_bytes_1.getTransactionBytes(transaction);
    return cryptography.hash(bytes);
};
exports.getTransactionHash = getTransactionHash;
//# sourceMappingURL=get_transaction_hash.js.map