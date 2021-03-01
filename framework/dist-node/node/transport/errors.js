"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidTransactionError extends Error {
    constructor(message, id) {
        super(message);
        this.message = message;
        this.id = id;
    }
}
exports.InvalidTransactionError = InvalidTransactionError;
//# sourceMappingURL=errors.js.map