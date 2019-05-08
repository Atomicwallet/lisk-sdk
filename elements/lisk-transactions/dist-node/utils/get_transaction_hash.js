"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cryptography = require("@liskhq/lisk-cryptography");
var get_transaction_bytes_1 = require("./get_transaction_bytes");
exports.getTransactionHash = function (transaction) {
    var bytes = get_transaction_bytes_1.getTransactionBytes(transaction);
    return cryptography.hash(bytes);
};
//# sourceMappingURL=get_transaction_hash.js.map