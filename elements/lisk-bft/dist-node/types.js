"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BFTInvalidAttributeError = exports.BFTError = exports.ForkStatus = void 0;
var ForkStatus;
(function (ForkStatus) {
    ForkStatus[ForkStatus["IDENTICAL_BLOCK"] = 1] = "IDENTICAL_BLOCK";
    ForkStatus[ForkStatus["VALID_BLOCK"] = 2] = "VALID_BLOCK";
    ForkStatus[ForkStatus["DOUBLE_FORGING"] = 3] = "DOUBLE_FORGING";
    ForkStatus[ForkStatus["TIE_BREAK"] = 4] = "TIE_BREAK";
    ForkStatus[ForkStatus["DIFFERENT_CHAIN"] = 5] = "DIFFERENT_CHAIN";
    ForkStatus[ForkStatus["DISCARD"] = 6] = "DISCARD";
})(ForkStatus = exports.ForkStatus || (exports.ForkStatus = {}));
class BFTError extends Error {
}
exports.BFTError = BFTError;
class BFTInvalidAttributeError extends BFTError {
}
exports.BFTInvalidAttributeError = BFTInvalidAttributeError;
//# sourceMappingURL=types.js.map