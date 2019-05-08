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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _3_vote_transaction_1 = require("./3_vote_transaction");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var validateInputs = function (_a) {
    var _b = _a.votes, votes = _b === void 0 ? [] : _b, _c = _a.unvotes, unvotes = _c === void 0 ? [] : _c;
    if (!Array.isArray(votes)) {
        throw new Error('Please provide a valid votes value. Expected an array if present.');
    }
    if (!Array.isArray(unvotes)) {
        throw new Error('Please provide a valid unvotes value. Expected an array if present.');
    }
    utils_1.validatePublicKeys(__spread(votes, unvotes));
};
exports.castVotes = function (inputs) {
    validateInputs(inputs);
    var passphrase = inputs.passphrase, secondPassphrase = inputs.secondPassphrase, _a = inputs.votes, votes = _a === void 0 ? [] : _a, _b = inputs.unvotes, unvotes = _b === void 0 ? [] : _b;
    var plusPrependedVotes = utils_1.prependPlusToPublicKeys(votes);
    var minusPrependedUnvotes = utils_1.prependMinusToPublicKeys(unvotes);
    var allVotes = __spread(plusPrependedVotes, minusPrependedUnvotes);
    var transaction = __assign({}, utils_1.createBaseTransaction(inputs), { type: 3, fee: constants_1.VOTE_FEE.toString(), asset: {
            votes: allVotes,
        } });
    if (!passphrase) {
        return transaction;
    }
    var transactionWithSenderInfo = __assign({}, transaction, { senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey, recipientId: transaction.senderId, recipientPublicKey: transaction.senderPublicKey });
    var voteTransaction = new _3_vote_transaction_1.VoteTransaction(transactionWithSenderInfo);
    voteTransaction.sign(passphrase, secondPassphrase);
    return voteTransaction.toJSON();
};
//# sourceMappingURL=3_cast_votes.js.map