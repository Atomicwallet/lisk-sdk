"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommonBlockError extends Error {
    constructor(message, lastBlockID) {
        super(message);
        this.lastBlockID = lastBlockID.toString('hex');
    }
}
exports.CommonBlockError = CommonBlockError;
exports.convertErrorsToString = (errors) => {
    if (Array.isArray(errors) && errors.length > 0) {
        return errors
            .filter((e) => e instanceof Error)
            .map((error) => error.message)
            .join(', ');
    }
    if (errors instanceof Error) {
        return errors.message;
    }
    if (typeof errors === 'string') {
        return errors;
    }
    return '';
};
//# sourceMappingURL=error_handlers.js.map