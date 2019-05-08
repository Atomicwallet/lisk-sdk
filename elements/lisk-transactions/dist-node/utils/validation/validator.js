"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var Ajv = require("ajv");
var addKeywords = require("ajv-merge-patch");
var schemas = require("./schema");
var validation_1 = require("./validation");
exports.validator = new Ajv({ allErrors: true, removeAdditional: 'all' });
addKeywords(exports.validator);
exports.validator.addFormat('signature', validation_1.validateSignature);
exports.validator.addFormat('id', function (data) {
    return validation_1.isNumberString(data) && !validation_1.isGreaterThanMaxTransactionId(new BigNum(data));
});
exports.validator.addFormat('address', function (data) {
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
exports.validator.addFormat('transferData', function (data) { return !validation_1.isNullByteIncluded(data) && validation_1.isValidTransferData(data); });
exports.validator.addFormat('fee', validation_1.validateFee);
exports.validator.addFormat('emptyOrPublicKey', function (data) {
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
exports.validator.addFormat('publicKey', function (data) {
    try {
        validation_1.validatePublicKey(data);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('signedPublicKey', function (data) {
    try {
        var action = data[0];
        if (action !== '+' && action !== '-') {
            return false;
        }
        var publicKey = data.slice(1);
        validation_1.validatePublicKey(publicKey);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('additionPublicKey', function (data) {
    var action = data[0];
    if (action !== '+') {
        return false;
    }
    try {
        var publicKey = data.slice(1);
        validation_1.validatePublicKey(publicKey);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.validator.addFormat('username', validation_1.validateUsername);
exports.validator.addFormat('noNullByte', function (data) { return !validation_1.isNullByteIncluded(data); });
exports.validator.addKeyword('uniqueSignedPublicKeys', {
    type: 'array',
    compile: function () { return function (data) {
        return new Set(data
            .filter(function (datum) { return typeof datum === 'string'; })
            .map(function (key) { return key.slice(1); })).size === data.length;
    }; },
});
exports.validator.addSchema(schemas.baseTransaction);
//# sourceMappingURL=validator.js.map