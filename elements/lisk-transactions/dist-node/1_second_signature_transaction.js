"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("../../lisk-cryptography");
const base_transaction_1 = require("./base_transaction");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const TRANSACTION_SIGNATURE_TYPE = 1;
exports.secondSignatureAssetFormatSchema = {
    type: 'object',
    required: ['signature'],
    properties: {
        signature: {
            type: 'object',
            required: ['publicKey'],
            properties: {
                publicKey: {
                    type: 'string',
                    format: 'publicKey',
                },
            },
        },
    },
};
class SecondSignatureTransaction extends base_transaction_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.asset = (tx.asset || { signature: {} });
    }
    assetToBytes() {
        const { signature: { publicKey }, } = this.asset;
        return lisk_cryptography_1.hexToBuffer(publicKey);
    }
    assetToJSON() {
        return this.asset;
    }
    async prepare(store) {
        await store.account.cache([
            {
                address: this.senderId,
            },
        ]);
    }
    verifyAgainstTransactions(transactions) {
        return transactions
            .filter(tx => tx.type === this.type && tx.senderPublicKey === this.senderPublicKey)
            .map(tx => new errors_1.TransactionError('Register second signature only allowed once per account.', tx.id, '.asset.signature'));
    }
    validateAsset() {
        utils_1.validator.validate(exports.secondSignatureAssetFormatSchema, this.asset);
        const errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_SIGNATURE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_SIGNATURE_TYPE));
        }
        if (!this.amount.eq(0)) {
            errors.push(new errors_1.TransactionError('Amount must be zero for second signature registration transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (!this.fee.eq(constants_1.SIGNATURE_FEE)) {
            errors.push(new errors_1.TransactionError(`Fee must be equal to ${constants_1.SIGNATURE_FEE}`, this.id, '.fee', this.fee.toString(), constants_1.SIGNATURE_FEE));
        }
        if (this.recipientId) {
            errors.push(new errors_1.TransactionError('RecipientId is expected to be undefined.', this.id, '.recipientId', this.recipientId, ''));
        }
        if (this.recipientPublicKey) {
            errors.push(new errors_1.TransactionError('RecipientPublicKey is expected to be undefined.', this.id, '.recipientPublicKey', this.recipientPublicKey, ''));
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        if (sender.secondPublicKey) {
            errors.push(new errors_1.TransactionError('Register second signature only allowed once per account.', this.id, '.secondPublicKey'));
        }
        const updatedSender = Object.assign({}, sender, { secondPublicKey: this.asset.signature.publicKey, secondSignature: 1 });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    }
    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        const resetSender = Object.assign({}, sender, { secondPublicKey: null, secondSignature: 0 });
        store.account.set(resetSender.address, resetSender);
        return [];
    }
    sign(passphrase) {
        this._signature = undefined;
        this._signSignature = undefined;
        this._signature = lisk_cryptography_1.signData(lisk_cryptography_1.hash(this.getBytes()), passphrase);
        this._id = utils_1.getId(this.getBytes());
    }
    assetFromSync(raw) {
        if (!raw.s_publicKey) {
            return undefined;
        }
        const signature = {
            transactionId: raw.t_id,
            publicKey: raw.s_publicKey,
        };
        return { signature };
    }
}
exports.SecondSignatureTransaction = SecondSignatureTransaction;
//# sourceMappingURL=1_second_signature_transaction.js.map