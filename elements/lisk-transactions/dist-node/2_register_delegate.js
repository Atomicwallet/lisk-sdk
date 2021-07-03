"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _2_delegate_transaction_1 = require("./2_delegate_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ username }) => {
    if (!username || typeof username !== 'string') {
        throw new Error('Please provide a username. Expected string.');
    }
    if (username.length > constants_1.USERNAME_MAX_LENGTH) {
        throw new Error(`Username length does not match requirements. Expected to be no more than ${constants_1.USERNAME_MAX_LENGTH} characters.`);
    }
};
exports.registerDelegate = (inputs) => {
    validateInputs(inputs);
    const { username, passphrase, secondPassphrase } = inputs;
    if (!username || typeof username !== 'string') {
        throw new Error('Please provide a username. Expected string.');
    }
    if (username.length > constants_1.USERNAME_MAX_LENGTH) {
        throw new Error(`Username length does not match requirements. Expected to be no more than ${constants_1.USERNAME_MAX_LENGTH} characters.`);
    }
    const transaction = Object.assign({}, utils_1.createBaseTransaction(inputs), { type: 2, fee: constants_1.DELEGATE_FEE.toString(), asset: { delegate: { username } } });
    if (!passphrase) {
        return transaction;
    }
    const delegateTransaction = new _2_delegate_transaction_1.DelegateTransaction(transaction);
    delegateTransaction.sign(passphrase, secondPassphrase);
    return delegateTransaction.toJSON();
};
//# sourceMappingURL=2_register_delegate.js.map