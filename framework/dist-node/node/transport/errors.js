"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTransactionError = void 0;
class InvalidTransactionError extends Error {
    constructor(message, id) {
        super(message);
        this.message = message;
        this.id = id;
    }
}
exports.InvalidTransactionError = InvalidTransactionError;
//# sourceMappingURL=errors.js.map