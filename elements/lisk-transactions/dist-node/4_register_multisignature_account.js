"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var _4_multisignature_transaction_1 = require("./4_multisignature_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var keysgroup = _a.keysgroup, lifetime = _a.lifetime, minimum = _a.minimum;
    if (!utils_1.isValidInteger(lifetime) ||
        lifetime < constants_1.MULTISIGNATURE_MIN_LIFETIME ||
        lifetime > constants_1.MULTISIGNATURE_MAX_LIFETIME) {
        throw new Error("Please provide a valid lifetime value. Expected integer between " + constants_1.MULTISIGNATURE_MIN_LIFETIME + " and " + constants_1.MULTISIGNATURE_MAX_LIFETIME + ".");
    }
    if (!utils_1.isValidInteger(minimum) ||
        minimum < constants_1.MULTISIGNATURE_MIN_KEYSGROUP ||
        minimum > constants_1.MULTISIGNATURE_MAX_KEYSGROUP) {
        throw new Error("Please provide a valid minimum value. Expected integer between " + constants_1.MULTISIGNATURE_MIN_KEYSGROUP + " and " + constants_1.MULTISIGNATURE_MAX_KEYSGROUP + ".");
    }
    if (keysgroup.length < minimum) {
        throw new Error('Minimum number of signatures is larger than the number of keys in the keysgroup.');
    }
    utils_1.validateKeysgroup(keysgroup);
};
exports.registerMultisignature = function (inputs) {
    validateInputs(inputs);
    var keysgroup = inputs.keysgroup, lifetime = inputs.lifetime, minimum = inputs.minimum, passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase;
    var plusPrependedKeysgroup = utils_1.prependPlusToPublicKeys(keysgroup);
    var keygroupFees = plusPrependedKeysgroup.length + 1;
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { type: 4, fee: (constants_1.MULTISIGNATURE_FEE * keygroupFees).toString(), asset: {
            multisignature: {
                min: minimum,
                lifetime: lifetime,
                keysgroup: plusPrependedKeysgroup,
            },
        } });
    if (!passphrase) {
        return transaction;
    }
    var multisignatureTransaction = new _4_multisignature_transaction_1.MultisignatureTransaction(transaction);
    multisignatureTransaction.sign(passphrase, secondPassphrase);
    return multisignatureTransaction.toJSON();
};
//# sourceMappingURL=4_register_multisignature_account.js.map