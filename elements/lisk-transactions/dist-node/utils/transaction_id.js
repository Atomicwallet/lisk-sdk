"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionId = exports.validateTransactionId = exports.getId = void 0;
const cryptography = require("../../../lisk-cryptography");
const errors_1 = require("../errors");
const get_transaction_bytes_1 = require("./get_transaction_bytes");
const getId = (transactionBytes) => {
    const transactionHash = cryptography.hash(transactionBytes);
    const bufferFromFirstEntriesReversed = cryptography.getFirstEightBytesReversed(transactionHash);
    const transactionId = cryptography.bufferToBigNumberString(bufferFromFirstEntriesReversed);
    return transactionId;
};
exports.getId = getId;
const validateTransactionId = (id, bytes) => {
    const expectedId = exports.getId(bytes);
    return id !== expectedId
        ? new errors_1.TransactionError(`Invalid transaction id`, id, '.id', id, expectedId)
        : undefined;
};
exports.validateTransactionId = validateTransactionId;
const getTransactionId = (transaction) => {
    const transactionBytes = get_transaction_bytes_1.getTransactionBytes(transaction);
    const transactionHash = cryptography.hash(transactionBytes);
    const bufferFromFirstEntriesReversed = cryptography.getFirstEightBytesReversed(transactionHash);
    const firstEntriesToNumber = cryptography.bufferToBigNumberString(bufferFromFirstEntriesReversed);
    return firstEntriesToNumber;
};
exports.getTransactionId = getTransactionId;
//# sourceMappingURL=transaction_id.js.map