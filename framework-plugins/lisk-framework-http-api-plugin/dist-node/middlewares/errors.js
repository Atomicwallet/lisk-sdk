"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.ErrorWithStatus = void 0;
class ErrorWithStatus extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ErrorWithStatus = ErrorWithStatus;
const errorMiddleware = () => (err, _req, res, _next) => {
    let errors;
    let responseCode = 500;
    if (Array.isArray(err)) {
        errors = err;
    }
    else if (err.errors) {
        errors = err.errors;
    }
    else {
        errors = [err];
    }
    for (const error of errors) {
        Object.defineProperty(error, 'message', { enumerable: true });
    }
    if (err instanceof ErrorWithStatus) {
        const { statusCode, ...message } = err;
        errors = message;
        responseCode = statusCode;
    }
    res.status(responseCode).send({ errors });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=errors.js.map