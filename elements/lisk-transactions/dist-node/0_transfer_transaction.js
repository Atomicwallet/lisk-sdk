"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
const lisk_cryptography_1 = require("../../lisk-cryptography");
const base_transaction_1 = require("./base_transaction");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const TRANSACTION_TRANSFER_TYPE = 0;
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
class TransferTransaction extends base_transaction_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.asset = (tx.asset || {});
    }
    assetToBytes() {
        const { data } = this.asset;
        return data ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
    }
    assetToJSON() {
        return this.asset;
    }
    async prepare(store) {
        await store.account.cache([
            {
                address: this.senderId,
            },
            {
                address: this.recipientId,
            },
        ]);
    }
    verifyAgainstTransactions(_) {
        return [];
    }
    validateAsset() {
        utils_1.validator.validate(exports.transferAssetFormatSchema, this.asset);
        const errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_TRANSFER_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_TRANSFER_TYPE));
        }
        if (!utils_1.validateTransferAmount(this.amount.toString())) {
            errors.push(new errors_1.TransactionError('Amount must be a valid number in string format.', this.id, '.amount', this.amount.toString()));
        }
        if (!this.fee.eq(constants_1.TRANSFER_FEE)) {
            errors.push(new errors_1.TransactionError(`Fee must be equal to ${constants_1.TRANSFER_FEE}`, this.id, '.fee', this.fee.toString(), constants_1.TRANSFER_FEE));
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
            const calculatedAddress = lisk_cryptography_1.getAddressFromPublicKey(this.recipientPublicKey);
            if (this.recipientId !== calculatedAddress) {
                errors.push(new errors_1.TransactionError('recipientId does not match recipientPublicKey.', this.id, '.recipientId', this.recipientId, calculatedAddress));
            }
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        const balanceError = utils_1.verifyAmountBalance(this.id, sender, this.amount, this.fee);
        if (balanceError) {
            errors.push(balanceError);
        }
        const updatedSenderBalance = new BN(sender.balance).sub(this.amount);
        const updatedSender = Object.assign({}, sender, { balance: updatedSenderBalance.toString() });
        store.account.set(updatedSender.address, updatedSender);
        const recipient = store.account.getOrDefault(this.recipientId);
        const updatedRecipientBalance = new BN(recipient.balance).add(this.amount);
        if (updatedRecipientBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        const updatedRecipient = Object.assign({}, recipient, { balance: updatedRecipientBalance.toString() });
        store.account.set(updatedRecipient.address, updatedRecipient);
        return errors;
    }
    undoAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        const updatedSenderBalance = new BN(sender.balance).add(this.amount);
        if (updatedSenderBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        const updatedSender = Object.assign({}, sender, { balance: updatedSenderBalance.toString() });
        store.account.set(updatedSender.address, updatedSender);
        const recipient = store.account.getOrDefault(this.recipientId);
        const balanceError = utils_1.verifyBalance(this.id, recipient, this.amount);
        if (balanceError) {
            errors.push(balanceError);
        }
        const updatedRecipientBalance = new BN(recipient.balance).sub(this.amount);
        const updatedRecipient = Object.assign({}, recipient, { balance: updatedRecipientBalance.toString() });
        store.account.set(updatedRecipient.address, updatedRecipient);
        return errors;
    }
    assetFromSync(raw) {
        if (raw.tf_data) {
            const data = raw.tf_data.toString('utf8');
            return { data };
        }
        return undefined;
    }
}
exports.TransferTransaction = TransferTransaction;
//# sourceMappingURL=0_transfer_transaction.js.map