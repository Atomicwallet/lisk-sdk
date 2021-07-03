"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
const lisk_cryptography_1 = require("../../lisk-cryptography");
const base_transaction_1 = require("./base_transaction");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const response_1 = require("./response");
const utils_1 = require("./utils");
const TRANSACTION_MULTISIGNATURE_TYPE = 4;
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
const setMemberAccounts = (store, membersPublicKeys) => {
    membersPublicKeys.forEach(memberPublicKey => {
        const address = lisk_cryptography_1.getAddressFromPublicKey(memberPublicKey);
        const memberAccount = store.account.getOrDefault(address);
        const memberAccountWithPublicKey = Object.assign({}, memberAccount, { publicKey: memberAccount.publicKey || memberPublicKey });
        store.account.set(memberAccount.address, memberAccountWithPublicKey);
    });
};
const extractPublicKeysFromAsset = (assetPublicKeys) => assetPublicKeys.map(key => key.substring(1));
class MultisignatureTransaction extends base_transaction_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        this._multisignatureStatus = base_transaction_1.MultisignatureStatus.PENDING;
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.asset = (tx.asset || { multisignature: {} });
    }
    assetToBytes() {
        const { multisignature: { min, lifetime, keysgroup }, } = this.asset;
        const minBuffer = Buffer.alloc(1, min);
        const lifetimeBuffer = Buffer.alloc(1, lifetime);
        const keysgroupBuffer = Buffer.from(keysgroup.join(''), 'utf8');
        return Buffer.concat([minBuffer, lifetimeBuffer, keysgroupBuffer]);
    }
    assetToJSON() {
        return this.asset;
    }
    async prepare(store) {
        const membersAddresses = extractPublicKeysFromAsset(this.asset.multisignature.keysgroup).map(publicKey => ({ address: lisk_cryptography_1.getAddressFromPublicKey(publicKey) }));
        await store.account.cache([
            {
                address: this.senderId,
            },
            ...membersAddresses,
        ]);
    }
    verifyAgainstTransactions(transactions) {
        const errors = transactions
            .filter(tx => tx.type === this.type && tx.senderPublicKey === this.senderPublicKey)
            .map(tx => new errors_1.TransactionError('Register multisignature only allowed once per account.', tx.id, '.asset.multisignature'));
        return errors;
    }
    validateAsset() {
        utils_1.validator.validate(exports.multisignatureAssetFormatSchema, this.asset);
        const errors = errors_1.convertToAssetError(this.id, utils_1.validator.errors);
        if (this.type !== TRANSACTION_MULTISIGNATURE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_MULTISIGNATURE_TYPE));
        }
        if (!this.amount.eq(new BN(0))) {
            errors.push(new errors_1.TransactionError('Amount must be zero for multisignature registration transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (errors.length > 0) {
            return errors;
        }
        const expectedFee = new BN(constants_1.MULTISIGNATURE_FEE).mul(new BN(this.asset.multisignature.keysgroup.length + 1));
        if (!this.fee.eq(expectedFee)) {
            errors.push(new errors_1.TransactionError(`Fee must be equal to ${expectedFee.toString()}`, this.id, '.fee', this.fee.toString(), expectedFee.toString()));
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
    }
    processMultisignatures(_) {
        const transactionBytes = this.getBasicBytes();
        const { valid, errors } = utils_1.validateMultisignatures(this.asset.multisignature.keysgroup.map(signedPublicKey => signedPublicKey.substring(1)), this.signatures, this.asset.multisignature.keysgroup.length, transactionBytes, this.id);
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
                errors,
            };
        }
        this._multisignatureStatus = base_transaction_1.MultisignatureStatus.FAIL;
        return response_1.createResponse(this.id, errors);
    }
    applyAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        if (sender.membersPublicKeys && sender.membersPublicKeys.length > 0) {
            errors.push(new errors_1.TransactionError('Register multisignature only allowed once per account.', this.id, '.signatures'));
        }
        if (this.asset.multisignature.keysgroup.includes(`+${sender.publicKey}`)) {
            errors.push(new errors_1.TransactionError('Invalid multisignature keysgroup. Can not contain sender', this.id, '.signatures'));
        }
        const updatedSender = Object.assign({}, sender, { membersPublicKeys: extractPublicKeysFromAsset(this.asset.multisignature.keysgroup), multiMin: this.asset.multisignature.min, multiLifetime: this.asset.multisignature.lifetime });
        store.account.set(updatedSender.address, updatedSender);
        setMemberAccounts(store, updatedSender.membersPublicKeys);
        return errors;
    }
    undoAsset(store) {
        const sender = store.account.get(this.senderId);
        const resetSender = Object.assign({}, sender, { membersPublicKeys: [], multiMin: 0, multiLifetime: 0 });
        store.account.set(resetSender.address, resetSender);
        return [];
    }
    addMultisignature(store, signatureObject) {
        const keysgroup = this.asset.multisignature.keysgroup.map((aKey) => aKey.slice(1));
        if (!keysgroup.includes(signatureObject.publicKey)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError(`Public Key '${signatureObject.publicKey}' is not a member.`, this.id),
            ]);
        }
        if (this.signatures.includes(signatureObject.signature)) {
            return response_1.createResponse(this.id, [
                new errors_1.TransactionError('Encountered duplicate signature in transaction', this.id),
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
                new errors_1.TransactionError(`Failed to add signature ${signatureObject.signature}.`, this.id, '.signatures'),
            ];
        return response_1.createResponse(this.id, errors);
    }
    assetFromSync(raw) {
        if (!raw.m_keysgroup) {
            return undefined;
        }
        const multisignature = {
            min: raw.m_min,
            lifetime: raw.m_lifetime,
            keysgroup: typeof raw.m_keysgroup === 'string'
                ? raw.m_keysgroup.split(',')
                : raw.m_keysgroup,
        };
        return { multisignature };
    }
}
exports.MultisignatureTransaction = MultisignatureTransaction;
//# sourceMappingURL=4_multisignature_transaction.js.map