"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas = require("./schema");
const validator_1 = require("./validator");
const TRANSACTION_TYPE_MULTI_SIGNATURE = 4;
const schemaMap = {
    0: validator_1.validator.compile(schemas.transferTransaction),
    1: validator_1.validator.compile(schemas.signatureTransaction),
    2: validator_1.validator.compile(schemas.delegateTransaction),
    3: validator_1.validator.compile(schemas.voteTransaction),
    4: validator_1.validator.compile(schemas.multiTransaction),
    5: validator_1.validator.compile(schemas.dappTransaction),
};
const getTransactionSchemaValidator = (type) => {
    const schema = schemaMap[type];
    if (!schema) {
        throw new Error('Unsupported transaction type.');
    }
    return schema;
};
const validateMultiTransaction = (tx) => {
    if (tx.asset.multisignature.min >
        tx.asset.multisignature.keysgroup.length) {
        return {
            valid: false,
            errors: [
                {
                    dataPath: '.asset.multisignature.min',
                    keyword: 'multisignatures.keysgroup.min',
                    message: '.asset.multisignature.min cannot be greater than .asset.multisignature.keysgroup.length',
                    params: {},
                    schemaPath: 'lisk/base-transaction',
                },
            ],
        };
    }
    return {
        valid: true,
    };
};
exports.validateTransaction = (tx) => {
    if (tx.type === undefined || tx.type === null) {
        throw new Error('Transaction type is required.');
    }
    const validateSchema = getTransactionSchemaValidator(tx.type);
    const valid = validateSchema(tx);
    const errors = validateSchema.errors
        ? validateSchema.errors.filter((e) => e.keyword !== '$merge')
        : undefined;
    if (valid && tx.type === TRANSACTION_TYPE_MULTI_SIGNATURE) {
        return validateMultiTransaction(tx);
    }
    return {
        valid,
        errors,
    };
};
//# sourceMappingURL=validate_transaction.js.map