"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = void 0;
const lisk_cryptography_1 = require("../../lisk-cryptography");
const _0_transfer_transaction_1 = require("./0_transfer_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ amount, recipientId, recipientPublicKey, data, }) => {
    if (!utils_1.validateTransferAmount(amount)) {
        throw new Error('Amount must be a valid number in string format.');
    }
    if (!recipientId && !recipientPublicKey) {
        throw new Error('Either recipientId or recipientPublicKey must be provided.');
    }
    if (typeof recipientId !== 'undefined') {
        utils_1.validateAddress(recipientId);
    }
    if (typeof recipientPublicKey !== 'undefined') {
        utils_1.validatePublicKey(recipientPublicKey);
    }
    if (recipientId &&
        recipientPublicKey &&
        recipientId !== lisk_cryptography_1.getAddressFromPublicKey(recipientPublicKey)) {
        throw new Error('recipientId does not match recipientPublicKey.');
    }
    if (data && data.length > 0) {
        if (typeof data !== 'string') {
            throw new Error('Invalid encoding in transaction data. Data must be utf-8 encoded string.');
        }
        if (data.length > constants_1.BYTESIZES.DATA) {
            throw new Error('Transaction data field cannot exceed 64 bytes.');
        }
    }
};
const transfer = (inputs) => {
    validateInputs(inputs);
    const { data, amount, recipientPublicKey, passphrase, secondPassphrase, } = inputs;
    const recipientIdFromPublicKey = recipientPublicKey
        ? lisk_cryptography_1.getAddressFromPublicKey(recipientPublicKey)
        : undefined;
    const recipientId = inputs.recipientId
        ? inputs.recipientId
        : recipientIdFromPublicKey;
    const transaction = Object.assign(Object.assign({}, utils_1.createBaseTransaction(inputs)), { asset: data ? { data } : {}, amount, fee: constants_1.TRANSFER_FEE.toString(), recipientId: recipientId, recipientPublicKey, type: 0 });
    if (!passphrase) {
        return transaction;
    }
    const transactionWithSenderInfo = Object.assign(Object.assign({}, transaction), { recipientId: recipientId, senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey });
    const transferTransaction = new _0_transfer_transaction_1.TransferTransaction(transactionWithSenderInfo);
    transferTransaction.sign(passphrase, secondPassphrase);
    return transferTransaction.toJSON();
};
exports.transfer = transfer;
//# sourceMappingURL=0_transfer.js.map