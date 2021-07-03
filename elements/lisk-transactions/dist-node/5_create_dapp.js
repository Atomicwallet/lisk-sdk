"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _5_dapp_transaction_1 = require("./5_dapp_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ options }) => {
    if (typeof options !== 'object') {
        throw new Error('Options must be an object.');
    }
    const { category, name, type, link, description, tags, icon } = options;
    if (!utils_1.isValidInteger(category)) {
        throw new Error('Dapp category must be an integer.');
    }
    if (typeof name !== 'string') {
        throw new Error('Dapp name must be a string.');
    }
    if (!utils_1.isValidInteger(type)) {
        throw new Error('Dapp type must be an integer.');
    }
    if (typeof link !== 'string') {
        throw new Error('Dapp link must be a string.');
    }
    if (typeof description !== 'undefined' && typeof description !== 'string') {
        throw new Error('Dapp description must be a string if provided.');
    }
    if (typeof tags !== 'undefined' && typeof tags !== 'string') {
        throw new Error('Dapp tags must be a string if provided.');
    }
    if (typeof icon !== 'undefined' && typeof icon !== 'string') {
        throw new Error('Dapp icon must be a string if provided.');
    }
};
exports.createDapp = (inputs) => {
    validateInputs(inputs);
    const { passphrase, secondPassphrase, options } = inputs;
    const transaction = Object.assign({}, utils_1.createBaseTransaction(inputs), { type: 5, fee: constants_1.DAPP_FEE.toString(), asset: {
            dapp: options,
        } });
    if (!passphrase) {
        return transaction;
    }
    const transactionWithSenderInfo = Object.assign({}, transaction, { senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey });
    const dappTransaction = new _5_dapp_transaction_1.DappTransaction(transactionWithSenderInfo);
    dappTransaction.sign(passphrase, secondPassphrase);
    return dappTransaction.toJSON();
};
//# sourceMappingURL=5_create_dapp.js.map