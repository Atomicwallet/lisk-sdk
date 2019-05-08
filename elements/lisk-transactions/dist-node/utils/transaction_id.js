"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cryptography = require("@liskhq/lisk-cryptography");
var errors_1 = require("../errors");
var get_transaction_bytes_1 = require("./get_transaction_bytes");
exports.getId = function (transactionBytes) {
    var transactionHash = cryptography.hash(transactionBytes);
    var bufferFromFirstEntriesReversed = cryptography.getFirstEightBytesReversed(transactionHash);
    var transactionId = cryptography.bufferToBigNumberString(bufferFromFirstEntriesReversed);
    return transactionId;
};
exports.validateTransactionId = function (id, bytes) {
    var expectedId = exports.getId(bytes);
    return id !== expectedId
        ? new errors_1.TransactionError("Invalid transaction id", id, '.id', id, expectedId)
        : undefined;
};
exports.getTransactionId = function (transaction) {
    var transactionBytes = get_transaction_bytes_1.getTransactionBytes(transaction);
    var transactionHash = cryptography.hash(transactionBytes);
    var bufferFromFirstEntriesReversed = cryptography.getFirstEightBytesReversed(transactionHash);
    var firstEntriesToNumber = cryptography.bufferToBigNumberString(bufferFromFirstEntriesReversed);
    return firstEntriesToNumber;
};
//# sourceMappingURL=transaction_id.js.map