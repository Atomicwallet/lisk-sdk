"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const bn_js_1 = require("bn.js");
const Ajv = require("ajv");
const addKeywords = require("ajv-merge-patch");
const schemas = require("./schema");
const validation_1 = require("./validation");
exports.validator = new Ajv({ allErrors: true, removeAdditional: 'all' });
addKeywords(exports.validator);
exports.validator.addFormat('signature', validation_1.validateSignature);
exports.validator.addFormat('id', data => validation_1.isNumberString(data) && !validation_1.isGreaterThanMaxTransactionId(new bn_js_1.default(data)));
exports.validator.addFormat('address', data => {
    try {
        validation_1.validateAddress(data);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('amount', validation_1.isNumberString);
exports.validator.addFormat('transferAmount', validation_1.validateTransferAmount);
exports.validator.addFormat('nonTransferAmount', validation_1.validateNonTransferAmount);
exports.validator.addFormat('transferData', data => !validation_1.isNullByteIncluded(data) && validation_1.isValidTransferData(data));
exports.validator.addFormat('fee', validation_1.validateFee);
exports.validator.addFormat('emptyOrPublicKey', data => {
    if (data === null || data === '') {
        return true;
    }
    try {
        validation_1.validatePublicKey(data);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('publicKey', data => {
    try {
        validation_1.validatePublicKey(data);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('signedPublicKey', data => {
    try {
        const action = data[0];
        if (action !== '+' && action !== '-') {
            return false;
        }
        const publicKey = data.slice(1);
        validation_1.validatePublicKey(publicKey);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('additionPublicKey', data => {
    const action = data[0];
    if (action !== '+') {
        return false;
    }
    try {
        const publicKey = data.slice(1);
        validation_1.validatePublicKey(publicKey);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('username', validation_1.validateUsername);
exports.validator.addFormat('noNullByte', data => !validation_1.isNullByteIncluded(data));
exports.validator.addKeyword('uniqueSignedPublicKeys', {
    type: 'array',
    compile: () => (data) => new Set(data
        .filter(datum => typeof datum === 'string')
        .map((key) => key.slice(1))).size === data.length,
});
exports.validator.addSchema(schemas.baseTransaction);
//# sourceMappingURL=validator.js.map