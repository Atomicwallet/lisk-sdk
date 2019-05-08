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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_transaction_1 = require("./base_transaction");
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var utils_1 = require("./utils");
var TRANSACTION_DELEGATE_TYPE = 2;
exports.delegateAssetFormatSchema = {
    type: 'object',
    required: ['delegate'],
    properties: {
        delegate: {
            type: 'object',
            required: ['username'],
            properties: {
                username: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 20,
                    format: 'username',
                },
            },
        },
    },
};
var DelegateTransaction = (function (_super) {
    __extends(DelegateTransaction, _super);
    function DelegateTransaction(rawTransaction) {
        var _this = _super.call(this, rawTransaction) || this;
        var tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        _this.asset = (tx.asset || { delegate: {} });
        _this.containsUniqueData = true;
        return _this;
    }
    DelegateTransaction.prototype.assetToBytes = function () {
        var username = this.asset.delegate.username;
        return Buffer.from(username, 'utf8');
    };
    DelegateTransaction.prototype.assetToJSON = function () {
        return this.asset;
    };
    DelegateTransaction.prototype.prepare = function (store) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, store.account.cache([
                            {
                                address: this.senderId,
                            },
                            {
                                username: this.asset.delegate.username,
                            },
                        ])];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    DelegateTransaction.prototype.verifyAgainstTransactions = function (transactions) {
        var _this = this;
        return transactions
            .filter(function (tx) {
            return tx.type === _this.type && tx.senderPublicKey === _this.senderPublicKey;
        })
            .map(function (tx) {
            return new errors_1.TransactionError('Register delegate only allowed once per account.', tx.id, '.asset.delegate');
        });
    };
    DelegateTransaction.prototype.validateAsset = function () {
        utils_1.validator.validate(exports.delegateAssetFormatSchema, this.asset);
        var errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_DELEGATE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_DELEGATE_TYPE));
        }
        if (!this.amount.eq(0)) {
            errors.push(new errors_1.TransactionError('Amount must be zero for delegate registration transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (!this.fee.eq(constants_1.DELEGATE_FEE)) {
            errors.push(new errors_1.TransactionError("Fee must be equal to " + constants_1.DELEGATE_FEE, this.id, '.fee', this.fee.toString(), constants_1.DELEGATE_FEE));
        }
        if (this.recipientId) {
            errors.push(new errors_1.TransactionError('RecipientId is expected to be undefined', this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey) {
            errors.push(new errors_1.TransactionError('Invalid recipientPublicKey', this.id, '.recipientPublicKey'));
        }
        return errors;
    };
    DelegateTransaction.prototype.applyAsset = function (store) {
        var _this = this;
        var errors = [];
        var sender = store.account.get(this.senderId);
        var usernameExists = store.account.find(function (account) { return account.username === _this.asset.delegate.username; });
        if (usernameExists) {
            errors.push(new errors_1.TransactionError("Username is not unique.", this.id, '.asset.delegate.username'));
        }
        if (sender.isDelegate || sender.username) {
            errors.push(new errors_1.TransactionError('Account is already a delegate', this.id, '.asset.delegate.username'));
        }
        var updatedSender = __assign({}, sender, { username: this.asset.delegate.username, vote: 0, isDelegate: 1 });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    };
    DelegateTransaction.prototype.undoAsset = function (store) {
        var sender = store.account.get(this.senderId);
        var username = sender.username, strippedSender = __rest(sender, ["username"]);
        var resetSender = __assign({}, sender, { username: null, vote: 0, isDelegate: 0 });
        store.account.set(strippedSender.address, resetSender);
        return [];
    };
    return DelegateTransaction;
}(base_transaction_1.BaseTransaction));
exports.DelegateTransaction = DelegateTransaction;
//# sourceMappingURL=2_delegate_transaction.js.map