"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptography = require("../../../lisk-cryptography");
const get_transaction_bytes_1 = require("./get_transaction_bytes");
exports.getTransactionHash = (transaction) => {
    const bytes = get_transaction_bytes_1.getTransactionBytes(transaction);
    return cryptography.hash(bytes);
};
//# sourceMappingURL=get_transaction_hash.js.map