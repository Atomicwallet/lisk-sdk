"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prependMinusToPublicKeys = exports.prependPlusToPublicKeys = exports.convertLSKToBeddows = exports.convertBeddowsToLSK = void 0;
const BN = require("bn.js");
const constants_1 = require("../constants");
const validation_1 = require("./validation");
const BASE_10 = 10;
const LISK_MAX_DECIMAL_POINTS = 8;
const getDecimalPlaces = (amount) => (amount.split('.')[1] || '').length;
const convertBeddowsToLSK = (beddowsAmount) => {
    if (typeof beddowsAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(beddowsAmount)) {
        throw new Error('Beddows amount should not have decimal points');
    }
    const beddowsAmountBigNum = new BN(beddowsAmount);
    if (validation_1.isGreaterThanMaxTransactionAmount(beddowsAmountBigNum)) {
        throw new Error('Beddows amount out of range');
    }
    const lskAmountBigNum = beddowsAmountBigNum.div(constants_1.FIXED_POINT);
    return lskAmountBigNum.toString(BASE_10);
};
exports.convertBeddowsToLSK = convertBeddowsToLSK;
const convertLSKToBeddows = (lskAmount) => {
    if (typeof lskAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(lskAmount) > LISK_MAX_DECIMAL_POINTS) {
        throw new Error('LSK amount has too many decimal points');
    }
    const lskAmountBigNum = new BN(lskAmount);
    const beddowsAmountBigNum = lskAmountBigNum.mul(constants_1.FIXED_POINT);
    if (validation_1.isGreaterThanMaxTransactionAmount(beddowsAmountBigNum)) {
        throw new Error('LSK amount out of range');
    }
    return beddowsAmountBigNum.toString();
};
exports.convertLSKToBeddows = convertLSKToBeddows;
const prependPlusToPublicKeys = (publicKeys) => publicKeys.map(publicKey => `+${publicKey}`);
exports.prependPlusToPublicKeys = prependPlusToPublicKeys;
const prependMinusToPublicKeys = (publicKeys) => publicKeys.map(publicKey => `-${publicKey}`);
exports.prependMinusToPublicKeys = prependMinusToPublicKeys;
//# sourceMappingURL=format.js.map