"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
const defaultErrorNo = 500;
class APIError extends Error {
    constructor(message = '', errno = defaultErrorNo, errors) {
        super(message);
        this.name = 'APIError';
        this.errno = errno;
        this.errors = errors;
    }
}
exports.APIError = APIError;
//# sourceMappingURL=errors.js.map