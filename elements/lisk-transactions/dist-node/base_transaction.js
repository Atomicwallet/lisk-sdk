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
var BigNum = require("@liskhq/bignum");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var response_1 = require("./response");
var utils_1 = require("./utils");
var schemas = require("./utils/validation/schema");
var MultisignatureStatus;
(function (MultisignatureStatus) {
    MultisignatureStatus[MultisignatureStatus["UNKNOWN"] = 0] = "UNKNOWN";
    MultisignatureStatus[MultisignatureStatus["NONMULTISIGNATURE"] = 1] = "NONMULTISIGNATURE";
    MultisignatureStatus[MultisignatureStatus["PENDING"] = 2] = "PENDING";
    MultisignatureStatus[MultisignatureStatus["READY"] = 3] = "READY";
    MultisignatureStatus[MultisignatureStatus["FAIL"] = 4] = "FAIL";
})(MultisignatureStatus = exports.MultisignatureStatus || (exports.MultisignatureStatus = {}));
exports.ENTITY_ACCOUNT = 'account';
exports.ENTITY_TRANSACTION = 'transaction';
var BaseTransaction = (function () {
    function BaseTransaction(rawTransaction) {
        this._multisignatureStatus = MultisignatureStatus.UNKNOWN;
        var tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.amount = new BigNum(utils_1.isValidNumber(tx.amount) ? tx.amount : '0');
        this.fee = new BigNum(utils_1.isValidNumber(tx.fee) ? tx.fee : '0');
        this._id = tx.id;
        this.recipientId = tx.recipientId || '';
        this.recipientPublicKey = tx.recipientPublicKey || undefined;
        this.senderPublicKey = tx.senderPublicKey || '';
        try {
            this.senderId = tx.senderId
                ? tx.senderId
                : lisk_cryptography_1.getAddressFromPublicKey(this.senderPublicKey);
        }
        catch (error) {
            this.senderId = '';
        }
        this._signature = tx.signature;
        this.signatures = tx.signatures || [];
        this._signSignature = tx.signSignature;
        this.timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : Infinity;
        this.type = typeof tx.type === 'number' ? tx.type : Infinity;
        this.confirmations = tx.confirmations;
        this.blockId = tx.blockId;
        this.height = tx.height;
        this.receivedAt = tx.receivedAt ? new Date(tx.receivedAt) : undefined;
    }
    Object.defineProperty(BaseTransaction.prototype, "id", {
        get: function () {
            if (!this._id) {
                throw new Error('id is required to be set before use');
            }
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseTransaction.prototype, "signature", {
        get: function () {
            if (!this._signature) {
                throw new Error('signature is required to be set before use');
            }
            return this._signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseTransaction.prototype, "signSignature", {
        get: function () {
            return this._signSignature;
        },
        enumerable: true,
        configurable: true
    });
    BaseTransaction.prototype.toJSON = function () {
        var transaction = {
            id: this.id,
            blockId: this.blockId,
            height: this.height,
            confirmations: this.confirmations,
            amount: this.amount.toString(),
            type: this.type,
            timestamp: this.timestamp,
            senderPublicKey: this.senderPublicKey,
            senderId: this.senderId,
            recipientId: this.recipientId,
            recipientPublicKey: this.recipientPublicKey,
            fee: this.fee.toString(),
            signature: this.signature,
            signSignature: this.signSignature ? this.signSignature : undefined,
            signatures: this.signatures,
            asset: this.assetToJSON(),
            receivedAt: this.receivedAt ? this.receivedAt.toISOString() : undefined,
        };
        return transaction;
    };
    BaseTransaction.prototype.isReady = function () {
        return (this._multisignatureStatus === MultisignatureStatus.READY ||
            this._multisignatureStatus === MultisignatureStatus.NONMULTISIGNATURE);
    };
    BaseTransaction.prototype.getBytes = function () {
        var transactionBytes = Buffer.concat([
            this.getBasicBytes(),
            this._signature ? lisk_cryptography_1.hexToBuffer(this._signature) : Buffer.alloc(0),
            this._signSignature ? lisk_cryptography_1.hexToBuffer(this._signSignature) : Buffer.alloc(0),
        ]);
        return transactionBytes;
    };
    BaseTransaction.prototype.validate = function () {
        var errors = __spread(this._validateSchema(), this.validateAsset());
        if (errors.length > 0) {
            return response_1.createResponse(this.id, errors);
        }
        var transactionBytes = this.getBasicBytes();
        var _a = utils_1.validateSignature(this.senderPublicKey, this.signature, transactionBytes, this.id), signatureValid = _a.valid, verificationError = _a.error;
        if (!signatureValid && verificationError) {
            errors.push(verificationError);
        }
        var idError = utils_1.validateTransactionId(this.id, this.getBytes());
        if (idError) {
            errors.push(idError);
        }
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.verifyAgainstOtherTransactions = function (transactions) {
        var errors = this.verifyAgainstTransactions(transactions);
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.apply = function (store) {
        var sender = store.account.getOrDefault(this.senderId);
        var errors = this._verify(sender);
        var multiSigError = this.processMultisignatures(store).errors;
        if (multiSigError) {
            errors.push.apply(errors, __spread(multiSigError));
        }
        var updatedBalance = new BigNum(sender.balance).sub(this.fee);
        var updatedSender = __assign({}, sender, { balance: updatedBalance.toString(), publicKey: sender.publicKey || this.senderPublicKey });
        store.account.set(updatedSender.address, updatedSender);
        var assetErrors = this.applyAsset(store);
        errors.push.apply(errors, __spread(assetErrors));
        if (this._multisignatureStatus === MultisignatureStatus.PENDING &&
            errors.length === 1 &&
            errors[0] instanceof errors_1.TransactionPendingError) {
            return {
                id: this.id,
                status: response_1.Status.PENDING,
                errors: errors,
            };
        }
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.undo = function (store) {
        var sender = store.account.getOrDefault(this.senderId);
        var updatedBalance = new BigNum(sender.balance).add(this.fee);
        var updatedAccount = __assign({}, sender, { balance: updatedBalance.toString(), publicKey: sender.publicKey || this.senderPublicKey });
        var errors = updatedBalance.lte(constants_1.MAX_TRANSACTION_AMOUNT)
            ? []
            : [
                new errors_1.TransactionError('Invalid balance amount', this.id, '.balance', sender.balance, updatedBalance.toString()),
            ];
        store.account.set(updatedAccount.address, updatedAccount);
        var assetErrors = this.undoAsset(store);
        errors.push.apply(errors, __spread(assetErrors));
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.addMultisignature = function (store, signatureObject) {
        var account = store.account.get(this.senderId);
        if (account.membersPublicKeys &&
            !account.membersPublicKeys.includes(signatureObject.publicKey)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError("Public Key '" + signatureObject.publicKey + "' is not a member for account '" + account.address + "'.", this.id),
            ]);
        }
        if (this.signatures.includes(signatureObject.signature)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError("Signature '" + signatureObject.signature + "' already present in transaction.", this.id),
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
                new errors_1.TransactionError("Failed to add signature '" + signatureObject.signature + "'.", this.id, '.signatures'),
            ];
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.addVerifiedMultisignature = function (signature) {
        if (!this.signatures.includes(signature)) {
            this.signatures.push(signature);
            return response_1.createResponse(this.id, []);
        }
        return response_1.createResponse(this.id, [
            new errors_1.TransactionError('Failed to add signature.', this.id, '.signatures'),
        ]);
    };
    BaseTransaction.prototype.processMultisignatures = function (store) {
        var sender = store.account.get(this.senderId);
        var transactionBytes = this.getBasicBytes();
        var _a = utils_1.verifyMultiSignatures(this.id, sender, this.signatures, transactionBytes), status = _a.status, errors = _a.errors;
        this._multisignatureStatus = status;
        if (this._multisignatureStatus === MultisignatureStatus.PENDING) {
            return {
                id: this.id,
                status: response_1.Status.PENDING,
                errors: errors,
            };
        }
        return response_1.createResponse(this.id, errors);
    };
    BaseTransaction.prototype.isExpired = function (date) {
        if (date === void 0) { date = new Date(); }
        if (!this.receivedAt) {
            this.receivedAt = new Date();
        }
        var timeNow = Math.floor(date.getTime() / 1000);
        var timeOut = this._multisignatureStatus === MultisignatureStatus.PENDING ||
            this._multisignatureStatus === MultisignatureStatus.READY
            ? constants_1.UNCONFIRMED_MULTISIG_TRANSACTION_TIMEOUT
            : constants_1.UNCONFIRMED_TRANSACTION_TIMEOUT;
        var timeElapsed = timeNow - Math.floor(this.receivedAt.getTime() / 1000);
        return timeElapsed > timeOut;
    };
    BaseTransaction.prototype.sign = function (passphrase, secondPassphrase) {
        this._signature = undefined;
        this._signSignature = undefined;
        this._signature = lisk_cryptography_1.signData(lisk_cryptography_1.hash(this.getBytes()), passphrase);
        if (secondPassphrase) {
            this._signSignature = lisk_cryptography_1.signData(lisk_cryptography_1.hash(this.getBytes()), secondPassphrase);
        }
        this._id = utils_1.getId(this.getBytes());
    };
    BaseTransaction.prototype.getBasicBytes = function () {
        var transactionType = Buffer.alloc(constants_1.BYTESIZES.TYPE, this.type);
        var transactionTimestamp = Buffer.alloc(constants_1.BYTESIZES.TIMESTAMP);
        transactionTimestamp.writeIntLE(this.timestamp, 0, constants_1.BYTESIZES.TIMESTAMP);
        var transactionSenderPublicKey = lisk_cryptography_1.hexToBuffer(this.senderPublicKey);
        var transactionRecipientID = this.recipientId
            ? lisk_cryptography_1.bigNumberToBuffer(this.recipientId.slice(0, -1), constants_1.BYTESIZES.RECIPIENT_ID).slice(0, constants_1.BYTESIZES.RECIPIENT_ID)
            : Buffer.alloc(constants_1.BYTESIZES.RECIPIENT_ID);
        var transactionAmount = this.amount.toBuffer({
            endian: 'little',
            size: constants_1.BYTESIZES.AMOUNT,
        });
        return Buffer.concat([
            transactionType,
            transactionTimestamp,
            transactionSenderPublicKey,
            transactionRecipientID,
            transactionAmount,
            this.assetToBytes(),
        ]);
    };
    BaseTransaction.prototype._verify = function (sender) {
        var secondSignatureTxBytes = Buffer.concat([
            this.getBasicBytes(),
            lisk_cryptography_1.hexToBuffer(this.signature),
        ]);
        return [
            utils_1.verifySenderPublicKey(this.id, sender, this.senderPublicKey),
            utils_1.verifySenderId(this.id, sender, this.senderId),
            utils_1.verifyBalance(this.id, sender, this.fee),
            utils_1.verifySecondSignature(this.id, sender, this.signSignature, secondSignatureTxBytes),
        ].filter(Boolean);
    };
    BaseTransaction.prototype._validateSchema = function () {
        var transaction = this.toJSON();
        utils_1.validator.validate(schemas.baseTransaction, transaction);
        var errors = errors_1.convertToTransactionError(this.id, utils_1.validator.errors);
        if (!errors.find(function (err) { return err.dataPath === '.senderPublicKey'; })) {
            var senderIdError = utils_1.validateSenderIdAndPublicKey(this.id, this.senderId, this.senderPublicKey);
            if (senderIdError) {
                errors.push(senderIdError);
            }
        }
        return errors;
    };
    return BaseTransaction;
}());
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=base_transaction.js.map