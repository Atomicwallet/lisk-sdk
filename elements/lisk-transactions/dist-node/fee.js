"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sign_1 = require("./sign");
const DEFAULT_MIN_FEE_PER_BYTE = 1000;
const DEFAULT_NUMBER_OF_SIGNATURES = 1;
const DEFAULT_BASE_FEE = '0';
const DEFAULT_SIGNATURE_BYTE_SIZE = 64;
const computeTransactionMinFee = (assetSchema, trx, options) => {
    var _a, _b, _c, _d;
    const size = sign_1.getBytes(assetSchema, {
        ...trx,
        signatures: new Array((_a = options === null || options === void 0 ? void 0 : options.numberOfSignatures) !== null && _a !== void 0 ? _a : DEFAULT_NUMBER_OF_SIGNATURES).fill(Buffer.alloc(DEFAULT_SIGNATURE_BYTE_SIZE)),
    }).length;
    const baseFee = (_c = (_b = options === null || options === void 0 ? void 0 : options.baseFees.find(bf => bf.moduleID === trx.moduleID && bf.assetID === trx.assetID)) === null || _b === void 0 ? void 0 : _b.baseFee) !== null && _c !== void 0 ? _c : DEFAULT_BASE_FEE;
    return BigInt(size * ((_d = options === null || options === void 0 ? void 0 : options.minFeePerByte) !== null && _d !== void 0 ? _d : DEFAULT_MIN_FEE_PER_BYTE)) + BigInt(baseFee);
};
exports.computeMinFee = (assetSchema, trx, options) => {
    const { fee, ...trxWithoutFee } = trx;
    trxWithoutFee.fee = BigInt(0);
    let minFee = computeTransactionMinFee(assetSchema, trxWithoutFee, options);
    while (minFee > BigInt(trxWithoutFee.fee)) {
        trxWithoutFee.fee = minFee;
        minFee = computeTransactionMinFee(assetSchema, trxWithoutFee, options);
    }
    return minFee;
};
//# sourceMappingURL=fee.js.map