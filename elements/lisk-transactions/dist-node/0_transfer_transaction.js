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
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var base_transaction_1 = require("./base_transaction");
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var utils_1 = require("./utils");
var TRANSACTION_TRANSFER_TYPE = 0;
exports.transferAssetFormatSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'string',
            format: 'transferData',
            maxLength: 64,
        },
    },
};
var TransferTransaction = (function (_super) {
    __extends(TransferTransaction, _super);
    function TransferTransaction(rawTransaction) {
        var _this = _super.call(this, rawTransaction) || this;
        var tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        _this.asset = (tx.asset || {});
        return _this;
    }
    TransferTransaction.prototype.assetToBytes = function () {
        var data = this.asset.data;
        return data ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
    };
    TransferTransaction.prototype.assetToJSON = function () {
        return this.asset;
    };
    TransferTransaction.prototype.prepare = function (store) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, store.account.cache([
                            {
                                address: this.senderId,
                            },
                            {
                                address: this.recipientId,
                            },
                        ])];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    TransferTransaction.prototype.verifyAgainstTransactions = function (_) {
        return [];
    };
    TransferTransaction.prototype.validateAsset = function () {
        utils_1.validator.validate(exports.transferAssetFormatSchema, this.asset);
        var errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_TRANSFER_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_TRANSFER_TYPE));
        }
        if (!utils_1.validateTransferAmount(this.amount.toString())) {
            errors.push(new errors_1.TransactionError('Amount must be a valid number in string format.', this.id, '.amount', this.amount.toString()));
        }
        if (!this.fee.eq(constants_1.TRANSFER_FEE)) {
            errors.push(new errors_1.TransactionError("Fee must be equal to " + constants_1.TRANSFER_FEE, this.id, '.fee', this.fee.toString(), constants_1.TRANSFER_FEE));
        }
        if (!this.recipientId) {
            errors.push(new errors_1.TransactionError('`recipientId` must be provided.', this.id, '.recipientId'));
        }
        try {
            utils_1.validateAddress(this.recipientId);
        }
        catch (error) {
            errors.push(new errors_1.TransactionError(error.message, this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey) {
            var calculatedAddress = lisk_cryptography_1.getAddressFromPublicKey(this.recipientPublicKey);
            if (this.recipientId !== calculatedAddress) {
                errors.push(new errors_1.TransactionError('recipientId does not match recipientPublicKey.', this.id, '.recipientId', this.recipientId, calculatedAddress));
            }
        }
        return errors;
    };
    TransferTransaction.prototype.applyAsset = function (store) {
        var errors = [];
        var sender = store.account.get(this.senderId);
        var balanceError = utils_1.verifyAmountBalance(this.id, sender, this.amount, this.fee);
        if (balanceError) {
            errors.push(balanceError);
        }
        var updatedSenderBalance = new BigNum(sender.balance).sub(this.amount);
        var updatedSender = __assign({}, sender, { balance: updatedSenderBalance.toString() });
        store.account.set(updatedSender.address, updatedSender);
        var recipient = store.account.getOrDefault(this.recipientId);
        var updatedRecipientBalance = new BigNum(recipient.balance).add(this.amount);
        if (updatedRecipientBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        var updatedRecipient = __assign({}, recipient, { balance: updatedRecipientBalance.toString() });
        store.account.set(updatedRecipient.address, updatedRecipient);
        return errors;
    };
    TransferTransaction.prototype.undoAsset = function (store) {
        var errors = [];
        var sender = store.account.get(this.senderId);
        var updatedSenderBalance = new BigNum(sender.balance).add(this.amount);
        if (updatedSenderBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        var updatedSender = __assign({}, sender, { balance: updatedSenderBalance.toString() });
        store.account.set(updatedSender.address, updatedSender);
        var recipient = store.account.getOrDefault(this.recipientId);
        var balanceError = utils_1.verifyBalance(this.id, recipient, this.amount);
        if (balanceError) {
            errors.push(balanceError);
        }
        var updatedRecipientBalance = new BigNum(recipient.balance).sub(this.amount);
        var updatedRecipient = __assign({}, recipient, { balance: updatedRecipientBalance.toString() });
        store.account.set(updatedRecipient.address, updatedRecipient);
        return errors;
    };
    return TransferTransaction;
}(base_transaction_1.BaseTransaction));
exports.TransferTransaction = TransferTransaction;
//# sourceMappingURL=0_transfer_transaction.js.map