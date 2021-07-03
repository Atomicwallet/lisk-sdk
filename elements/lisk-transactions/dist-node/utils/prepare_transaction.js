"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTransaction = void 0;
const cryptography = require("../../../lisk-cryptography");
const sign_and_validate_1 = require("./sign_and_validate");
const time_1 = require("./time");
const transaction_id_1 = require("./transaction_id");
const validTransaction = (partial) => partial.type !== undefined;
const prepareTransaction = (partialTransaction, passphrase, secondPassphrase, timeOffset) => {
    const senderPublicKey = passphrase
        ? cryptography.getKeys(passphrase).publicKey
        : undefined;
    const timestamp = time_1.getTimeWithOffset(timeOffset);
    const transaction = Object.assign({ amount: '0', recipientId: '', senderPublicKey,
        timestamp }, partialTransaction);
    if (!validTransaction(transaction)) {
        throw new Error('Invalid transaction to process');
    }
    if (!passphrase) {
        return transaction;
    }
    const singleSignedTransaction = Object.assign(Object.assign({}, transaction), { signature: sign_and_validate_1.signTransaction(transaction, passphrase) });
    const signedTransaction = typeof secondPassphrase === 'string' && transaction.type !== 1
        ? sign_and_validate_1.secondSignTransaction(singleSignedTransaction, secondPassphrase)
        : singleSignedTransaction;
    const transactionWithId = Object.assign(Object.assign({}, signedTransaction), { id: transaction_id_1.getTransactionId(signedTransaction) });
    return transactionWithId;
};
exports.prepareTransaction = prepareTransaction;
//# sourceMappingURL=prepare_transaction.js.map