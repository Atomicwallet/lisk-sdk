"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransaction = exports.ENTITY_TRANSACTION = exports.ENTITY_ACCOUNT = exports.MultisignatureStatus = void 0;
const bn_js_1 = require("bn.js");
const lisk_cryptography_1 = require("../../lisk-cryptography");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const response_1 = require("./response");
const utils_1 = require("./utils");
const schemas = require("./utils/validation/schema");
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
class BaseTransaction {
    constructor(rawTransaction) {
        this._multisignatureStatus = MultisignatureStatus.UNKNOWN;
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.amount = new bn_js_1.default(utils_1.isValidNumber(tx.amount) ? tx.amount : '0');
        this.fee = new bn_js_1.default(utils_1.isValidNumber(tx.fee) ? tx.fee : '0');
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
        this.relays = typeof tx.relays === 'number' ? tx.relays : undefined;
    }
    get id() {
        if (!this._id) {
            throw new Error('id is required to be set before use');
        }
        return this._id;
    }
    get signature() {
        if (!this._signature) {
            throw new Error('signature is required to be set before use');
        }
        return this._signature;
    }
    get signSignature() {
        return this._signSignature;
    }
    toJSON() {
        const transaction = {
            id: this.id,
            blockId: this.blockId,
            height: this.height,
            relays: this.relays,
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
    }
    isReady() {
        return (this._multisignatureStatus === MultisignatureStatus.READY ||
            this._multisignatureStatus === MultisignatureStatus.NONMULTISIGNATURE);
    }
    getBytes() {
        const transactionBytes = Buffer.concat([
            this.getBasicBytes(),
            this._signature ? lisk_cryptography_1.hexToBuffer(this._signature) : Buffer.alloc(0),
            this._signSignature ? lisk_cryptography_1.hexToBuffer(this._signSignature) : Buffer.alloc(0),
        ]);
        return transactionBytes;
    }
    validate() {
        const errors = [...this._validateSchema(), ...this.validateAsset()];
        if (errors.length > 0) {
            return response_1.createResponse(this.id, errors);
        }
        const transactionBytes = this.getBasicBytes();
        const { valid: signatureValid, error: verificationError, } = utils_1.validateSignature(this.senderPublicKey, this.signature, transactionBytes, this.id);
        if (!signatureValid && verificationError) {
            errors.push(verificationError);
        }
        const idError = utils_1.validateTransactionId(this.id, this.getBytes());
        if (idError) {
            errors.push(idError);
        }
        return response_1.createResponse(this.id, errors);
    }
    verifyAgainstOtherTransactions(transactions) {
        const errors = this.verifyAgainstTransactions(transactions);
        return response_1.createResponse(this.id, errors);
    }
    apply(store) {
        const sender = store.account.getOrDefault(this.senderId);
        const errors = this._verify(sender);
        const { errors: multiSigError } = this.processMultisignatures(store);
        if (multiSigError) {
            errors.push(...multiSigError);
        }
        const updatedBalance = new bn_js_1.default(sender.balance).sub(this.fee);
        const updatedSender = Object.assign(Object.assign({}, sender), { balance: updatedBalance.toString(), publicKey: sender.publicKey || this.senderPublicKey });
        store.account.set(updatedSender.address, updatedSender);
        const assetErrors = this.applyAsset(store);
        errors.push(...assetErrors);
        if (this._multisignatureStatus === MultisignatureStatus.PENDING &&
            errors.length === 1 &&
            errors[0] instanceof errors_1.TransactionPendingError) {
            return {
                id: this.id,
                status: response_1.Status.PENDING,
                errors,
            };
        }
        return response_1.createResponse(this.id, errors);
    }
    undo(store) {
        const sender = store.account.getOrDefault(this.senderId);
        const updatedBalance = new bn_js_1.default(sender.balance).add(this.fee);
        const updatedAccount = Object.assign(Object.assign({}, sender), { balance: updatedBalance.toString(), publicKey: sender.publicKey || this.senderPublicKey });
        const errors = updatedBalance.lte(constants_1.MAX_TRANSACTION_AMOUNT)
            ? []
            : [
                new errors_1.TransactionError('Invalid balance amount', this.id, '.balance', sender.balance, updatedBalance.toString()),
            ];
        store.account.set(updatedAccount.address, updatedAccount);
        const assetErrors = this.undoAsset(store);
        errors.push(...assetErrors);
        return response_1.createResponse(this.id, errors);
    }
    addMultisignature(store, signatureObject) {
        const account = store.account.get(this.senderId);
        if (account.membersPublicKeys &&
            !account.membersPublicKeys.includes(signatureObject.publicKey)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError(`Public Key '${signatureObject.publicKey}' is not a member for account '${account.address}'.`, this.id),
            ]);
        }
        if (this.signatures.includes(signatureObject.signature)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError(`Signature '${signatureObject.signature}' already present in transaction.`, this.id),
            ]);
        }
        const { valid } = utils_1.validateSignature(signatureObject.publicKey, signatureObject.signature, this.getBasicBytes(), this.id);
        if (valid) {
            this.signatures.push(signatureObject.signature);
            return this.processMultisignatures(store);
        }
        const errors = valid
            ? []
            : [
                new errors_1.TransactionError(`Failed to add signature '${signatureObject.signature}'.`, this.id, '.signatures'),
            ];
        return response_1.createResponse(this.id, errors);
    }
    addVerifiedMultisignature(signature) {
        if (!this.signatures.includes(signature)) {
            this.signatures.push(signature);
            return response_1.createResponse(this.id, []);
        }
        return response_1.createResponse(this.id, [
            new errors_1.TransactionError('Failed to add signature.', this.id, '.signatures'),
        ]);
    }
    processMultisignatures(store) {
        const sender = store.account.get(this.senderId);
        const transactionBytes = this.getBasicBytes();
        const { status, errors } = utils_1.verifyMultiSignatures(this.id, sender, this.signatures, transactionBytes);
        this._multisignatureStatus = status;
        if (this._multisignatureStatus === MultisignatureStatus.PENDING) {
            return {
                id: this.id,
                status: response_1.Status.PENDING,
                errors,
            };
        }
        return response_1.createResponse(this.id, errors);
    }
    isExpired(date = new Date()) {
        if (!this.receivedAt) {
            this.receivedAt = new Date();
        }
        const timeNow = Math.floor(date.getTime() / 1000);
        const timeOut = this._multisignatureStatus === MultisignatureStatus.PENDING ||
            this._multisignatureStatus === MultisignatureStatus.READY
            ? constants_1.UNCONFIRMED_MULTISIG_TRANSACTION_TIMEOUT
            : constants_1.UNCONFIRMED_TRANSACTION_TIMEOUT;
        const timeElapsed = timeNow - Math.floor(this.receivedAt.getTime() / 1000);
        return timeElapsed > timeOut;
    }
    sign(passphrase, secondPassphrase) {
        this._signature = undefined;
        this._signSignature = undefined;
        this._signature = lisk_cryptography_1.signData(lisk_cryptography_1.hash(this.getBytes()), passphrase);
        if (secondPassphrase) {
            this._signSignature = lisk_cryptography_1.signData(lisk_cryptography_1.hash(this.getBytes()), secondPassphrase);
        }
        this._id = utils_1.getId(this.getBytes());
    }
    fromSync(raw) {
        const transactionJSON = {
            id: raw.t_id,
            height: raw.b_height,
            blockId: raw.b_id || raw.t_blockId,
            type: parseInt(raw.t_type, 10),
            timestamp: parseInt(raw.t_timestamp, 10),
            senderPublicKey: raw.t_senderPublicKey,
            requesterPublicKey: raw.t_requesterPublicKey,
            senderId: raw.t_senderId,
            recipientId: raw.t_recipientId,
            recipientPublicKey: raw.m_recipientPublicKey || null,
            amount: raw.t_amount,
            fee: raw.t_fee,
            signature: raw.t_signature,
            signSignature: raw.t_signSignature,
            signatures: raw.t_signatures ? raw.t_signatures.split(',') : [],
            confirmations: parseInt(raw.confirmations || 0, 10),
            asset: {},
        };
        const transaction = Object.assign(Object.assign({}, transactionJSON), { asset: this.assetFromSync(raw) || {} });
        return transaction;
    }
    getBasicBytes() {
        const transactionType = Buffer.alloc(constants_1.BYTESIZES.TYPE, this.type);
        const transactionTimestamp = Buffer.alloc(constants_1.BYTESIZES.TIMESTAMP);
        transactionTimestamp.writeIntLE(this.timestamp, 0, constants_1.BYTESIZES.TIMESTAMP);
        const transactionSenderPublicKey = lisk_cryptography_1.hexToBuffer(this.senderPublicKey);
        const transactionRecipientID = this.recipientId
            ? lisk_cryptography_1.bigNumberToBuffer(this.recipientId.slice(0, -1), constants_1.BYTESIZES.RECIPIENT_ID).slice(0, constants_1.BYTESIZES.RECIPIENT_ID)
            : Buffer.alloc(constants_1.BYTESIZES.RECIPIENT_ID);
        const transactionAmount = this.amount.toBuffer({
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
    }
    _verify(sender) {
        const secondSignatureTxBytes = Buffer.concat([
            this.getBasicBytes(),
            lisk_cryptography_1.hexToBuffer(this.signature),
        ]);
        return [
            utils_1.verifySenderPublicKey(this.id, sender, this.senderPublicKey),
            utils_1.verifySenderId(this.id, sender, this.senderId),
            utils_1.verifyBalance(this.id, sender, this.fee),
            utils_1.verifySecondSignature(this.id, sender, this.signSignature, secondSignatureTxBytes),
        ].filter(Boolean);
    }
    _validateSchema() {
        const transaction = this.toJSON();
        utils_1.validator.validate(schemas.baseTransaction, transaction);
        const errors = errors_1.convertToTransactionError(this.id, utils_1.validator.errors);
        if (!errors.find((err) => err.dataPath === '.senderPublicKey')) {
            const senderIdError = utils_1.validateSenderIdAndPublicKey(this.id, this.senderId, this.senderPublicKey);
            if (senderIdError) {
                errors.push(senderIdError);
            }
        }
        return errors;
    }
}
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=base_transaction.js.map