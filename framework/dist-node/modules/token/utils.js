"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalFees = void 0;
const getTotalFees = (block, minFeePerByte, baseFees) => block.payload.reduce((prev, current) => {
    var _a, _b;
    const baseFee = (_b = (_a = baseFees.find((fee) => fee.moduleID === current.moduleID && fee.assetID === current.assetID)) === null || _a === void 0 ? void 0 : _a.baseFee) !== null && _b !== void 0 ? _b : BigInt(0);
    const minFee = minFeePerByte * BigInt(current.getBytes().length) + BigInt(baseFee);
    return {
        totalFee: prev.totalFee + current.fee,
        totalMinFee: prev.totalMinFee + minFee,
    };
}, { totalFee: BigInt(0), totalMinFee: BigInt(0) });
exports.getTotalFees = getTotalFees;
//# sourceMappingURL=utils.js.map