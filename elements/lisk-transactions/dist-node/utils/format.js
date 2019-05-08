"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var constants_1 = require("../constants");
var validation_1 = require("./validation");
var BASE_10 = 10;
var LISK_MAX_DECIMAL_POINTS = 8;
var getDecimalPlaces = function (amount) {
    return (amount.split('.')[1] || '').length;
};
exports.convertBeddowsToLSK = function (beddowsAmount) {
    if (typeof beddowsAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(beddowsAmount)) {
        throw new Error('Beddows amount should not have decimal points');
    }
    var beddowsAmountBigNum = new BigNum(beddowsAmount);
    if (validation_1.isGreaterThanMaxTransactionAmount(beddowsAmountBigNum)) {
        throw new Error('Beddows amount out of range');
    }
    var lskAmountBigNum = beddowsAmountBigNum.div(constants_1.FIXED_POINT);
    return lskAmountBigNum.toString(BASE_10);
};
exports.convertLSKToBeddows = function (lskAmount) {
    if (typeof lskAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(lskAmount) > LISK_MAX_DECIMAL_POINTS) {
        throw new Error('LSK amount has too many decimal points');
    }
    var lskAmountBigNum = new BigNum(lskAmount);
    var beddowsAmountBigNum = lskAmountBigNum.mul(constants_1.FIXED_POINT);
    if (validation_1.isGreaterThanMaxTransactionAmount(beddowsAmountBigNum)) {
        throw new Error('LSK amount out of range');
    }
    return beddowsAmountBigNum.toString();
};
exports.prependPlusToPublicKeys = function (publicKeys) { return publicKeys.map(function (publicKey) { return "+" + publicKey; }); };
exports.prependMinusToPublicKeys = function (publicKeys) { return publicKeys.map(function (publicKey) { return "-" + publicKey; }); };
//# sourceMappingURL=format.js.map