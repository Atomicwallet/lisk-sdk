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
var _2_delegate_transaction_1 = require("./2_delegate_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var username = _a.username;
    if (!username || typeof username !== 'string') {
        throw new Error('Please provide a username. Expected string.');
    }
    if (username.length > constants_1.USERNAME_MAX_LENGTH) {
        throw new Error("Username length does not match requirements. Expected to be no more than " + constants_1.USERNAME_MAX_LENGTH + " characters.");
    }
};
exports.registerDelegate = function (inputs) {
    validateInputs(inputs);
    var username = inputs.username, passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase;
    if (!username || typeof username !== 'string') {
        throw new Error('Please provide a username. Expected string.');
    }
    if (username.length > constants_1.USERNAME_MAX_LENGTH) {
        throw new Error("Username length does not match requirements. Expected to be no more than " + constants_1.USERNAME_MAX_LENGTH + " characters.");
    }
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { type: 2, fee: constants_1.DELEGATE_FEE.toString(), asset: { delegate: { username: username } } });
    if (!passphrase) {
        return transaction;
    }
    var delegateTransaction = new _2_delegate_transaction_1.DelegateTransaction(transaction);
    delegateTransaction.sign(passphrase, secondPassphrase);
    return delegateTransaction.toJSON();
};
//# sourceMappingURL=2_register_delegate.js.map