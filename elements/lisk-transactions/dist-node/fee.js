"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMinFee = void 0;
const sign_1 = require("./sign");
const DEFAULT_MIN_FEE_PER_BYTE = 1000;
const DEFAULT_NUMBER_OF_SIGNATURES = 1;
const DEFAULT_BASE_FEE = '0';
const DEFAULT_SIGNATURE_BYTE_SIZE = 64;
const computeTransactionMinFee = (assetSchema, trx, options) => {
    var _a, _b, _c, _d, _e;
    const mockSignatures = new Array((_a = options === null || options === void 0 ? void 0 : options.numberOfSignatures) !== null && _a !== void 0 ? _a : DEFAULT_NUMBER_OF_SIGNATURES).fill(Buffer.alloc(DEFAULT_SIGNATURE_BYTE_SIZE));
    if (options === null || options === void 0 ? void 0 : options.numberOfEmptySignatures) {
        mockSignatures.push(...new Array(options.numberOfEmptySignatures).fill(Buffer.alloc(0)));
    }
    const size = sign_1.getBytes(assetSchema, {
        ...trx,
        signatures: mockSignatures,
    }).length;
    const baseFee = (_d = (_c = (_b = options === null || options === void 0 ? void 0 : options.baseFees) === null || _b === void 0 ? void 0 : _b.find(bf => bf.moduleID === trx.moduleID && bf.assetID === trx.assetID)) === null || _c === void 0 ? void 0 : _c.baseFee) !== null && _d !== void 0 ? _d : DEFAULT_BASE_FEE;
    return BigInt(size * ((_e = options === null || options === void 0 ? void 0 : options.minFeePerByte) !== null && _e !== void 0 ? _e : DEFAULT_MIN_FEE_PER_BYTE)) + BigInt(baseFee);
};
const computeMinFee = (assetSchema, trx, options) => {
    const { fee, ...trxWithoutFee } = trx;
    trxWithoutFee.fee = BigInt(0);
    let minFee = computeTransactionMinFee(assetSchema, trxWithoutFee, options);
    while (minFee > BigInt(trxWithoutFee.fee)) {
        trxWithoutFee.fee = minFee;
        minFee = computeTransactionMinFee(assetSchema, trxWithoutFee, options);
    }
    return minFee;
};
exports.computeMinFee = computeMinFee;
//# sourceMappingURL=fee.js.map