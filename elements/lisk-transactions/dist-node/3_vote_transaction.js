"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var BigNum = require("@liskhq/bignum");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var base_transaction_1 = require("./base_transaction");
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var utils_1 = require("./utils");
var validation_1 = require("./utils/validation");
var PREFIX_UPVOTE = '+';
var PREFIX_UNVOTE = '-';
var MAX_VOTE_PER_ACCOUNT = 101;
var MIN_VOTE_PER_TX = 1;
var MAX_VOTE_PER_TX = 33;
var TRANSACTION_VOTE_TYPE = 3;
exports.voteAssetFormatSchema = {
    type: 'object',
    required: ['votes'],
    properties: {
        votes: {
            type: 'array',
            minItems: MIN_VOTE_PER_TX,
            maxItems: MAX_VOTE_PER_TX,
            items: {
                type: 'string',
                format: 'signedPublicKey',
            },
            uniqueSignedPublicKeys: true,
        },
    },
};
var VoteTransaction = (function (_super) {
    __extends(VoteTransaction, _super);
    function VoteTransaction(rawTransaction) {
        var _this = _super.call(this, rawTransaction) || this;
        var tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        _this.asset = (tx.asset || {});
        _this.containsUniqueData = true;
        return _this;
    }
    VoteTransaction.prototype.assetToBytes = function () {
        return Buffer.from(this.asset.votes.join(''), 'utf8');
    };
    VoteTransaction.prototype.assetToJSON = function () {
        return this.asset;
    };
    VoteTransaction.prototype.prepare = function (store) {
        return __awaiter(this, void 0, void 0, function () {
            var publicKeyObjectArray, filterArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publicKeyObjectArray = this.asset.votes.map(function (pkWithAction) {
                            var publicKey = pkWithAction.slice(1);
                            return {
                                publicKey: publicKey,
                            };
                        });
                        filterArray = __spread([
                            {
                                address: this.senderId,
                            }
                        ], publicKeyObjectArray);
                        return [4, store.account.cache(filterArray)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    VoteTransaction.prototype.verifyAgainstTransactions = function (transactions) {
        var _this = this;
        var sameTypeTransactions = transactions
            .filter(function (tx) {
            return tx.senderPublicKey === _this.senderPublicKey && tx.type === _this.type;
        })
            .map(function (tx) { return new VoteTransaction(tx); });
        var publicKeys = this.asset.votes.map(function (vote) { return vote.substring(1); });
        return sameTypeTransactions.reduce(function (previous, tx) {
            var conflictingVotes = tx.asset.votes
                .map(function (vote) { return vote.substring(1); })
                .filter(function (publicKey) { return publicKeys.includes(publicKey); });
            if (conflictingVotes.length > 0) {
                return __spread(previous, [
                    new errors_1.TransactionError("Transaction includes conflicting votes: " + conflictingVotes.toString(), _this.id, '.asset.votes'),
                ]);
            }
            return previous;
        }, []);
    };
    VoteTransaction.prototype.validateAsset = function () {
        validation_1.validator.validate(exports.voteAssetFormatSchema, this.asset);
        var errors = errors_1.convertToAssetError(this.id, validation_1.validator.errors);
        if (!this.amount.eq(0)) {
            errors.push(new errors_1.TransactionError('Amount must be zero for vote transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (this.type !== TRANSACTION_VOTE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_VOTE_TYPE));
        }
        try {
            validation_1.validateAddress(this.recipientId);
        }
        catch (err) {
            errors.push(new errors_1.TransactionError('RecipientId must be set for vote transaction', this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey &&
            this.recipientId !== lisk_cryptography_1.getAddressFromPublicKey(this.recipientPublicKey)) {
            errors.push(new errors_1.TransactionError('recipientId does not match recipientPublicKey.', this.id, '.recipientId'));
        }
        if (!this.fee.eq(constants_1.VOTE_FEE)) {
            errors.push(new errors_1.TransactionError("Fee must be equal to " + constants_1.VOTE_FEE, this.id, '.fee', this.fee.toString(), constants_1.VOTE_FEE));
        }
        return errors;
    };
    VoteTransaction.prototype.applyAsset = function (store) {
        var _this = this;
        var errors = [];
        var sender = store.account.get(this.senderId);
        var balanceError = utils_1.verifyAmountBalance(this.id, sender, this.amount, this.fee);
        if (balanceError) {
            errors.push(balanceError);
        }
        var updatedSenderBalance = new BigNum(sender.balance).sub(this.amount);
        this.asset.votes.forEach(function (actionVotes) {
            var vote = actionVotes.substring(1);
            var voteAccount = store.account.find(function (account) { return account.publicKey === vote; });
            if (!voteAccount ||
                (voteAccount &&
                    (voteAccount.username === undefined ||
                        voteAccount.username === '' ||
                        voteAccount.username === null))) {
                errors.push(new errors_1.TransactionError(vote + " is not a delegate.", _this.id, '.asset.votes'));
            }
        });
        var senderVotes = sender.votedDelegatesPublicKeys || [];
        this.asset.votes.forEach(function (vote) {
            var action = vote.charAt(0);
            var publicKey = vote.substring(1);
            if (action === PREFIX_UPVOTE && senderVotes.includes(publicKey)) {
                errors.push(new errors_1.TransactionError(publicKey + " is already voted.", _this.id, '.asset.votes'));
            }
            else if (action === PREFIX_UNVOTE && !senderVotes.includes(publicKey)) {
                errors.push(new errors_1.TransactionError(publicKey + " is not voted.", _this.id, '.asset.votes'));
            }
        });
        var upvotes = this.asset.votes
            .filter(function (vote) { return vote.charAt(0) === PREFIX_UPVOTE; })
            .map(function (vote) { return vote.substring(1); });
        var unvotes = this.asset.votes
            .filter(function (vote) { return vote.charAt(0) === PREFIX_UNVOTE; })
            .map(function (vote) { return vote.substring(1); });
        var originalVotes = sender.votedDelegatesPublicKeys || [];
        var votedDelegatesPublicKeys = __spread(originalVotes, upvotes).filter(function (vote) { return !unvotes.includes(vote); });
        if (votedDelegatesPublicKeys.length > MAX_VOTE_PER_ACCOUNT) {
            errors.push(new errors_1.TransactionError("Vote cannot exceed " + MAX_VOTE_PER_ACCOUNT + " but has " + votedDelegatesPublicKeys.length + ".", this.id, '.asset.votes', votedDelegatesPublicKeys.length.toString(), MAX_VOTE_PER_ACCOUNT));
        }
        var updatedSender = __assign({}, sender, { balance: updatedSenderBalance.toString(), votedDelegatesPublicKeys: votedDelegatesPublicKeys });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    };
    VoteTransaction.prototype.undoAsset = function (store) {
        var errors = [];
        var sender = store.account.get(this.senderId);
        var updatedSenderBalance = new BigNum(sender.balance).add(this.amount);
        if (updatedSenderBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        var upvotes = this.asset.votes
            .filter(function (vote) { return vote.charAt(0) === PREFIX_UPVOTE; })
            .map(function (vote) { return vote.substring(1); });
        var unvotes = this.asset.votes
            .filter(function (vote) { return vote.charAt(0) === PREFIX_UNVOTE; })
            .map(function (vote) { return vote.substring(1); });
        var originalVotes = sender.votedDelegatesPublicKeys || [];
        var votedDelegatesPublicKeys = __spread(originalVotes, unvotes).filter(function (vote) { return !upvotes.includes(vote); });
        if (votedDelegatesPublicKeys.length > MAX_VOTE_PER_ACCOUNT) {
            errors.push(new errors_1.TransactionError("Vote cannot exceed " + MAX_VOTE_PER_ACCOUNT + " but has " + votedDelegatesPublicKeys.length + ".", this.id, '.asset.votes', votedDelegatesPublicKeys.length.toString(), MAX_VOTE_PER_ACCOUNT));
        }
        var updatedSender = __assign({}, sender, { balance: updatedSenderBalance.toString(), votedDelegatesPublicKeys: votedDelegatesPublicKeys });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    };
    return VoteTransaction;
}(base_transaction_1.BaseTransaction));
exports.VoteTransaction = VoteTransaction;
//# sourceMappingURL=3_vote_transaction.js.map