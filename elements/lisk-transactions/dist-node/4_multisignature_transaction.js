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
var response_1 = require("./response");
var utils_1 = require("./utils");
var TRANSACTION_MULTISIGNATURE_TYPE = 4;
exports.multisignatureAssetFormatSchema = {
    type: 'object',
    required: ['multisignature'],
    properties: {
        multisignature: {
            type: 'object',
            required: ['min', 'lifetime', 'keysgroup'],
            properties: {
                min: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 15,
                },
                lifetime: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 72,
                },
                keysgroup: {
                    type: 'array',
                    uniqueItems: true,
                    minItems: 1,
                    maxItems: 15,
                    items: {
                        type: 'string',
                        format: 'additionPublicKey',
                    },
                },
            },
        },
    },
};
var setMemberAccounts = function (store, membersPublicKeys) {
    membersPublicKeys.forEach(function (memberPublicKey) {
        var address = lisk_cryptography_1.getAddressFromPublicKey(memberPublicKey);
        var memberAccount = store.account.getOrDefault(address);
        var memberAccountWithPublicKey = __assign({}, memberAccount, { publicKey: memberAccount.publicKey || memberPublicKey });
        store.account.set(memberAccount.address, memberAccountWithPublicKey);
    });
};
var extractPublicKeysFromAsset = function (assetPublicKeys) {
    return assetPublicKeys.map(function (key) { return key.substring(1); });
};
var MultisignatureTransaction = (function (_super) {
    __extends(MultisignatureTransaction, _super);
    function MultisignatureTransaction(rawTransaction) {
        var _this = _super.call(this, rawTransaction) || this;
        _this._multisignatureStatus = base_transaction_1.MultisignatureStatus.PENDING;
        var tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        _this.asset = (tx.asset || { multisignature: {} });
        return _this;
    }
    MultisignatureTransaction.prototype.assetToBytes = function () {
        var _a = this.asset.multisignature, min = _a.min, lifetime = _a.lifetime, keysgroup = _a.keysgroup;
        var minBuffer = Buffer.alloc(1, min);
        var lifetimeBuffer = Buffer.alloc(1, lifetime);
        var keysgroupBuffer = Buffer.from(keysgroup.join(''), 'utf8');
        return Buffer.concat([minBuffer, lifetimeBuffer, keysgroupBuffer]);
    };
    MultisignatureTransaction.prototype.assetToJSON = function () {
        return this.asset;
    };
    MultisignatureTransaction.prototype.prepare = function (store) {
        return __awaiter(this, void 0, void 0, function () {
            var membersAddresses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        membersAddresses = extractPublicKeysFromAsset(this.asset.multisignature.keysgroup).map(function (publicKey) { return ({ address: lisk_cryptography_1.getAddressFromPublicKey(publicKey) }); });
                        return [4, store.account.cache(__spread([
                                {
                                    address: this.senderId,
                                }
                            ], membersAddresses))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    MultisignatureTransaction.prototype.verifyAgainstTransactions = function (transactions) {
        var _this = this;
        var errors = transactions
            .filter(function (tx) {
            return tx.type === _this.type && tx.senderPublicKey === _this.senderPublicKey;
        })
            .map(function (tx) {
            return new errors_1.TransactionError('Register multisignature only allowed once per account.', tx.id, '.asset.multisignature');
        });
        return errors;
    };
    MultisignatureTransaction.prototype.validateAsset = function () {
        utils_1.validator.validate(exports.multisignatureAssetFormatSchema, this.asset);
        var errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_MULTISIGNATURE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_MULTISIGNATURE_TYPE));
        }
        if (!this.amount.eq(0)) {
            errors.push(new errors_1.TransactionError('Amount must be zero for multisignature registration transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (errors.length > 0) {
            return errors;
        }
        var expectedFee = new BigNum(constants_1.MULTISIGNATURE_FEE).mul(this.asset.multisignature.keysgroup.length + 1);
        if (!this.fee.eq(expectedFee)) {
            errors.push(new errors_1.TransactionError("Fee must be equal to " + expectedFee.toString(), this.id, '.fee', this.fee.toString(), expectedFee.toString()));
        }
        if (this.asset.multisignature.min > this.asset.multisignature.keysgroup.length) {
            errors.push(new errors_1.TransactionError('Invalid multisignature min. Must be less than or equal to keysgroup size', this.id, '.asset.multisignature.min', this.asset.multisignature.min));
        }
        if (this.recipientId) {
            errors.push(new errors_1.TransactionError('RecipientId is expected to be undefined', this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey) {
            errors.push(new errors_1.TransactionError('RecipientPublicKey is expected to be undefined', this.id, '.recipientPublicKey', this.recipientPublicKey));
        }
        return errors;
    };
    MultisignatureTransaction.prototype.processMultisignatures = function (_) {
        var transactionBytes = this.getBasicBytes();
        var _a = utils_1.validateMultisignatures(this.asset.multisignature.keysgroup.map(function (signedPublicKey) {
            return signedPublicKey.substring(1);
        }), this.signatures, this.asset.multisignature.keysgroup.length, transactionBytes, this.id), valid = _a.valid, errors = _a.errors;
        if (valid) {
            this._multisignatureStatus = base_transaction_1.MultisignatureStatus.READY;
            return response_1.createResponse(this.id, errors);
        }
        if (errors &&
            errors.length === 1 &&
            errors[0] instanceof errors_1.TransactionPendingError) {
            this._multisignatureStatus = base_transaction_1.MultisignatureStatus.PENDING;
            return {
                id: this.id,
                status: response_1.Status.PENDING,
                errors: errors,
            };
        }
        this._multisignatureStatus = base_transaction_1.MultisignatureStatus.FAIL;
        return response_1.createResponse(this.id, errors);
    };
    MultisignatureTransaction.prototype.applyAsset = function (store) {
        var errors = [];
        var sender = store.account.get(this.senderId);
        if (sender.membersPublicKeys && sender.membersPublicKeys.length > 0) {
            errors.push(new errors_1.TransactionError('Register multisignature only allowed once per account.', this.id, '.signatures'));
        }
        if (this.asset.multisignature.keysgroup.includes("+" + sender.publicKey)) {
            errors.push(new errors_1.TransactionError('Invalid multisignature keysgroup. Can not contain sender', this.id, '.signatures'));
        }
        var updatedSender = __assign({}, sender, { membersPublicKeys: extractPublicKeysFromAsset(this.asset.multisignature.keysgroup), multiMin: this.asset.multisignature.min, multiLifetime: this.asset.multisignature.lifetime });
        store.account.set(updatedSender.address, updatedSender);
        setMemberAccounts(store, updatedSender.membersPublicKeys);
        return errors;
    };
    MultisignatureTransaction.prototype.undoAsset = function (store) {
        var sender = store.account.get(this.senderId);
        var resetSender = __assign({}, sender, { membersPublicKeys: [], multiMin: 0, multiLifetime: 0 });
        store.account.set(resetSender.address, resetSender);
        return [];
    };
    MultisignatureTransaction.prototype.addMultisignature = function (store, signatureObject) {
        var keysgroup = this.asset.multisignature.keysgroup.map(function (aKey) {
            return aKey.slice(1);
        });
        if (!keysgroup.includes(signatureObject.publicKey)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError("Public Key '" + signatureObject.publicKey + "' is not a member.", this.id),
            ]);
        }
        if (this.signatures.includes(signatureObject.signature)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError('Encountered duplicate signature in transaction', this.id),
            ]);
        }
        var valid = utils_1.validateSignature(signatureObject.publicKey, signatureObject.signature, this.getBasicBytes(), this.id).valid;
        if (valid) {
            this.signatures.push(signatureObject.signature);
            return this.processMultisignatures(store);
        }
        var errors = valid
            ? []
            : [
                new errors_1.TransactionError("Failed to add signature " + signatureObject.signature + ".", this.id, '.signatures'),
            ];
        return response_1.createResponse(this.id, errors);
    };
    return MultisignatureTransaction;
}(base_transaction_1.BaseTransaction));
exports.MultisignatureTransaction = MultisignatureTransaction;
//# sourceMappingURL=4_multisignature_transaction.js.map