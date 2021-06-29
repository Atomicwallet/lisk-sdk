"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransaction = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const schema_1 = require("./schema");
const validateTransaction = (assetSchema, transactionObject) => {
    const transactionObjectWithEmptyAsset = {
        ...transactionObject,
        asset: Buffer.alloc(0),
    };
    const schemaErrors = lisk_validator_1.validator.validate(schema_1.baseTransactionSchema, transactionObjectWithEmptyAsset);
    if (schemaErrors.length) {
        return new lisk_validator_1.LiskValidationError([...schemaErrors]);
    }
    if (typeof transactionObject.asset !== 'object' || transactionObject.asset === null) {
        return new Error('Transaction object asset must be of type object and not null');
    }
    const assetSchemaErrors = lisk_validator_1.validator.validate(assetSchema, transactionObject.asset);
    if (assetSchemaErrors.length) {
        return new lisk_validator_1.LiskValidationError([...assetSchemaErrors]);
    }
    return undefined;
};
exports.validateTransaction = validateTransaction;
//# sourceMappingURL=validate.js.map