"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLSKToBeddows = exports.convertBeddowsToLSK = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const FIXED_POINT = 10 ** 8;
const LISK_MAX_DECIMAL_POINTS = 8;
const getDecimalPlaces = (amount) => (amount.split('.')[1] || '').length;
const convertBeddowsToLSK = (beddowsAmount) => {
    if (typeof beddowsAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(beddowsAmount)) {
        throw new Error('Beddows amount should not have decimal points');
    }
    const beddowsAmountBigInt = BigInt(beddowsAmount);
    if (beddowsAmountBigInt > lisk_validator_1.MAX_UINT64) {
        throw new Error('Beddows amount out of range');
    }
    const int = (beddowsAmountBigInt / BigInt(FIXED_POINT)).toString();
    const floating = Number(beddowsAmountBigInt % BigInt(FIXED_POINT)) / FIXED_POINT;
    const floatingPointsSplit = floating
        .toLocaleString('en-US', {
        maximumFractionDigits: LISK_MAX_DECIMAL_POINTS,
    })
        .split('.')[1];
    const res = floating !== 0 ? `${int}.${floatingPointsSplit}` : int;
    return res;
};
exports.convertBeddowsToLSK = convertBeddowsToLSK;
const convertLSKToBeddows = (lskAmount) => {
    var _a;
    if (typeof lskAmount !== 'string') {
        throw new Error('Cannot convert non-string amount');
    }
    if (getDecimalPlaces(lskAmount) > LISK_MAX_DECIMAL_POINTS) {
        throw new Error('LSK amount has too many decimal points');
    }
    const splitAmount = lskAmount.split('.');
    const liskAmountInt = BigInt(splitAmount[0]);
    const liskAmountFloatBigInt = BigInt(((_a = splitAmount[1]) !== null && _a !== void 0 ? _a : '0').padEnd(LISK_MAX_DECIMAL_POINTS, '0'));
    const beddowsAmountBigInt = liskAmountInt * BigInt(FIXED_POINT) + liskAmountFloatBigInt;
    if (beddowsAmountBigInt > lisk_validator_1.MAX_UINT64) {
        throw new Error('LSK amount out of range');
    }
    return beddowsAmountBigInt.toString();
};
exports.convertLSKToBeddows = convertLSKToBeddows;
//# sourceMappingURL=format.js.map