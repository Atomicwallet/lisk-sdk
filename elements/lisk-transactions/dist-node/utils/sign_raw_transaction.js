"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRawTransaction = void 0;
const cryptography = require("../../../lisk-cryptography");
const prepare_transaction_1 = require("./prepare_transaction");
const time_1 = require("./time");
const signRawTransaction = ({ transaction, passphrase, secondPassphrase, timeOffset, }) => {
    const { publicKey, address, } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
    const senderSecondPublicKey = secondPassphrase
        ? cryptography.getPrivateAndPublicKeyFromPassphrase(secondPassphrase)
            .publicKey
        : undefined;
    const propertiesToAdd = {
        senderPublicKey: publicKey,
        senderSecondPublicKey,
        senderId: address,
        timestamp: time_1.getTimeWithOffset(timeOffset),
    };
    const transactionWithProperties = Object.assign(Object.assign({}, transaction), propertiesToAdd);
    return prepare_transaction_1.prepareTransaction(transactionWithProperties, passphrase, secondPassphrase);
};
exports.signRawTransaction = signRawTransaction;
//# sourceMappingURL=sign_raw_transaction.js.map