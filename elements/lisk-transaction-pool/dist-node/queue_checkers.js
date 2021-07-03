"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTransactionForTypes = exports.checkTransactionForSenderIdWithRecipientIds = exports.checkTransactionForId = exports.checkTransactionForSenderPublicKey = exports.checkTransactionForExpiry = exports.returnTrueUntilLimit = exports.checkTransactionPropertyForValues = void 0;
const checkTransactionPropertyForValues = (values, propertyName) => (transaction) => values.includes(transaction[propertyName]);
exports.checkTransactionPropertyForValues = checkTransactionPropertyForValues;
const returnTrueUntilLimit = (limit) => {
    let current = 0;
    return _ => current++ < limit;
};
exports.returnTrueUntilLimit = returnTrueUntilLimit;
const checkTransactionForExpiry = () => {
    const timeNow = new Date();
    return (transaction) => transaction.isExpired(timeNow);
};
exports.checkTransactionForExpiry = checkTransactionForExpiry;
const checkTransactionForSenderPublicKey = (transactions) => {
    const senderProperty = 'senderPublicKey';
    const senderPublicKeys = transactions.map(transaction => transaction[senderProperty]);
    return exports.checkTransactionPropertyForValues(senderPublicKeys, senderProperty);
};
exports.checkTransactionForSenderPublicKey = checkTransactionForSenderPublicKey;
const checkTransactionForId = (transactions) => {
    const idProperty = 'id';
    const ids = transactions.map(transaction => transaction.id);
    return exports.checkTransactionPropertyForValues(ids, idProperty);
};
exports.checkTransactionForId = checkTransactionForId;
const checkTransactionForSenderIdWithRecipientIds = (transactions) => {
    const recipientProperty = 'recipientId';
    const senderId = 'senderId';
    const recipients = transactions.map(transaction => transaction[recipientProperty]);
    return exports.checkTransactionPropertyForValues(recipients, senderId);
};
exports.checkTransactionForSenderIdWithRecipientIds = checkTransactionForSenderIdWithRecipientIds;
const checkTransactionForTypes = (transactions) => {
    const typeProperty = 'type';
    const types = transactions.map((transaction) => transaction[typeProperty]);
    return exports.checkTransactionPropertyForValues(types, typeProperty);
};
exports.checkTransactionForTypes = checkTransactionForTypes;
//# sourceMappingURL=queue_checkers.js.map