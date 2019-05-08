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
var _5_dapp_transaction_1 = require("./5_dapp_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var options = _a.options;
    if (typeof options !== 'object') {
        throw new Error('Options must be an object.');
    }
    var category = options.category, name = options.name, type = options.type, link = options.link, description = options.description, tags = options.tags, icon = options.icon;
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
exports.createDapp = function (inputs) {
    validateInputs(inputs);
    var passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase, options = inputs.options;
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { type: 5, fee: constants_1.DAPP_FEE.toString(), asset: {
            dapp: options,
        } });
    if (!passphrase) {
        return transaction;
    }
    var transactionWithSenderInfo = __assign({}, transaction, { senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey });
    var dappTransaction = new _5_dapp_transaction_1.DappTransaction(transactionWithSenderInfo);
    dappTransaction.sign(passphrase, secondPassphrase);
    return dappTransaction.toJSON();
};
//# sourceMappingURL=5_create_dapp.js.map