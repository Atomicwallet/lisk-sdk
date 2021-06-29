"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTransaction = exports.getTransaction = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const transactionInputSchema = {
    type: 'object',
    required: ['moduleID', 'assetID', 'nonce', 'fee', 'senderPublicKey', 'asset', 'signatures'],
    properties: {
        moduleID: {
            type: 'number',
            description: 'Describes the Transaction module type.',
        },
        assetID: {
            type: 'number',
            description: 'Describes the Transaction asset type.',
        },
        fee: {
            type: 'string',
            description: 'Transaction fee associated with this transaction.\n',
        },
        nonce: {
            type: 'string',
            examples: ['1'],
            description: 'Unique sequence of number per account.\n',
        },
        senderPublicKey: {
            type: 'string',
            format: 'hex',
            description: 'Hex encoded value of the public key of the Senders account.\n',
        },
        asset: {
            type: 'object',
            description: 'Object stored per transaction type',
        },
        signatures: {
            type: 'array',
            items: {
                type: 'string',
                anyOf: [{ const: '' }, { format: 'hex' }],
                description: 'Hex encoded value of the signature for the transaction.',
            },
            minItems: 1,
        },
    },
};
const getTransaction = (channel, codec) => async (req, res) => {
    const transactionId = req.params.id;
    if (!transactionId || !lisk_validator_1.isHexString(transactionId)) {
        res.status(400).send({
            errors: [{ message: 'Transaction id parameter should be a hex string.' }],
        });
        return;
    }
    let transaction;
    try {
        transaction = await channel.invoke('app:getTransactionByID', {
            id: transactionId,
        });
    }
    catch (error) {
        res.status(404).json({
            errors: [{ message: `The transaction with id "${transactionId}" not found.` }],
        });
        return;
    }
    res.status(200).json({ data: codec.decodeTransaction(transaction), meta: {} });
};
exports.getTransaction = getTransaction;
const postTransaction = (channel, codec) => async (req, res) => {
    const errors = lisk_validator_1.validator.validate(transactionInputSchema, req.body);
    if (errors.length) {
        res.status(400).send({
            errors: [{ message: new lisk_validator_1.LiskValidationError([...errors]).message }],
        });
        return;
    }
    try {
        const encodedTransaction = codec.encodeTransaction(req.body);
        const result = await channel.invoke('app:postTransaction', {
            transaction: encodedTransaction,
        });
        res.status(200).json({ data: result, meta: {} });
    }
    catch (err) {
        res.status(409).json({
            errors: [{ message: err.message }],
        });
    }
};
exports.postTransaction = postTransaction;
//# sourceMappingURL=transactions.js.map