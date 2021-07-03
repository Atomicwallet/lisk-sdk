"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _4_multisignature_transaction_1 = require("./4_multisignature_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ keysgroup, lifetime, minimum, }) => {
    if (!utils_1.isValidInteger(lifetime) ||
        lifetime < constants_1.MULTISIGNATURE_MIN_LIFETIME ||
        lifetime > constants_1.MULTISIGNATURE_MAX_LIFETIME) {
        throw new Error(`Please provide a valid lifetime value. Expected integer between ${constants_1.MULTISIGNATURE_MIN_LIFETIME} and ${constants_1.MULTISIGNATURE_MAX_LIFETIME}.`);
    }
    if (!utils_1.isValidInteger(minimum) ||
        minimum < constants_1.MULTISIGNATURE_MIN_KEYSGROUP ||
        minimum > constants_1.MULTISIGNATURE_MAX_KEYSGROUP) {
        throw new Error(`Please provide a valid minimum value. Expected integer between ${constants_1.MULTISIGNATURE_MIN_KEYSGROUP} and ${constants_1.MULTISIGNATURE_MAX_KEYSGROUP}.`);
    }
    if (keysgroup.length < minimum) {
        throw new Error('Minimum number of signatures is larger than the number of keys in the keysgroup.');
    }
    utils_1.validateKeysgroup(keysgroup);
};
exports.registerMultisignature = (inputs) => {
    validateInputs(inputs);
    const { keysgroup, lifetime, minimum, passphrase, secondPassphrase } = inputs;
    const plusPrependedKeysgroup = utils_1.prependPlusToPublicKeys(keysgroup);
    const keygroupFees = plusPrependedKeysgroup.length + 1;
    const transaction = Object.assign({}, utils_1.createBaseTransaction(inputs), { type: 4, fee: (constants_1.MULTISIGNATURE_FEE * keygroupFees).toString(), asset: {
            multisignature: {
                min: minimum,
                lifetime,
                keysgroup: plusPrependedKeysgroup,
            },
        } });
    if (!passphrase) {
        return transaction;
    }
    const multisignatureTransaction = new _4_multisignature_transaction_1.MultisignatureTransaction(transaction);
    multisignatureTransaction.sign(passphrase, secondPassphrase);
    return multisignatureTransaction.toJSON();
};
//# sourceMappingURL=4_register_multisignature_account.js.map