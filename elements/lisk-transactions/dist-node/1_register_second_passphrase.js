"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("../../lisk-cryptography");
const _1_second_signature_transaction_1 = require("./1_second_signature_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ secondPassphrase, }) => {
    if (typeof secondPassphrase !== 'string') {
        throw new Error('Please provide a secondPassphrase. Expected string.');
    }
};
exports.registerSecondPassphrase = (inputs) => {
    validateInputs(inputs);
    const { passphrase, secondPassphrase } = inputs;
    const { publicKey } = lisk_cryptography_1.getKeys(secondPassphrase);
    const transaction = Object.assign({}, utils_1.createBaseTransaction(inputs), { type: 1, fee: constants_1.SIGNATURE_FEE.toString(), asset: { signature: { publicKey } } });
    if (!passphrase) {
        return transaction;
    }
    const secondSignatureTransaction = new _1_second_signature_transaction_1.SecondSignatureTransaction(transaction);
    secondSignatureTransaction.sign(passphrase);
    return secondSignatureTransaction.toJSON();
};
//# sourceMappingURL=1_register_second_passphrase.js.map