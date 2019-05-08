"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTransactionPropertyForValues = function (values, propertyName) { return function (transaction) {
    return values.includes(transaction[propertyName]);
}; };
exports.returnTrueUntilLimit = function (limit) {
    var current = 0;
    return function (_) { return current++ < limit; };
};
exports.checkTransactionForExpiry = function () {
    var timeNow = new Date();
    return function (transaction) { return transaction.isExpired(timeNow); };
};
exports.checkTransactionForSenderPublicKey = function (transactions) {
    var senderProperty = 'senderPublicKey';
    var senderPublicKeys = transactions.map(function (transaction) { return transaction[senderProperty]; });
    return exports.checkTransactionPropertyForValues(senderPublicKeys, senderProperty);
};
exports.checkTransactionForId = function (transactions) {
    var idProperty = 'id';
    var ids = transactions.map(function (transaction) { return transaction.id; });
    return exports.checkTransactionPropertyForValues(ids, idProperty);
};
exports.checkTransactionForSenderIdWithRecipientIds = function (transactions) {
    var recipientProperty = 'recipientId';
    var senderId = 'senderId';
    var recipients = transactions.map(function (transaction) { return transaction[recipientProperty]; });
    return exports.checkTransactionPropertyForValues(recipients, senderId);
};
exports.checkTransactionForTypes = function (transactions) {
    var typeProperty = 'type';
    var types = transactions.map(function (transaction) { return transaction[typeProperty]; });
    return exports.checkTransactionPropertyForValues(types, typeProperty);
};
//# sourceMappingURL=queue_checkers.js.map