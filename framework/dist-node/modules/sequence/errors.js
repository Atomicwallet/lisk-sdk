"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
class InvalidNonceError extends errors_1.FrameworkError {
    constructor(message, actual, expected) {
        super(message);
        this.code = 'ERR_INVALID_NONCE';
        this.actual = actual.toString();
        this.expected = expected.toString();
    }
}
exports.InvalidNonceError = InvalidNonceError;
//# sourceMappingURL=errors.js.map