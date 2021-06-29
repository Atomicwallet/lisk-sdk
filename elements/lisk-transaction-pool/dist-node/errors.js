"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPoolError = void 0;
class TransactionPoolError extends Error {
    constructor(message = '', id = Buffer.alloc(0), dataPath = '', actual, expected) {
        super();
        this.message = message;
        this.id = id;
        this.name = 'TransactionPoolError';
        this.dataPath = dataPath;
        this.actual = actual;
        this.expected = expected;
    }
    toString() {
        const defaultMessage = `TransactionPool: ${this.id.toString('hex')} failed to process at ${this.dataPath}: ${this.message}`;
        const withActual = this.actual
            ?
                `${defaultMessage}, actual: ${this.actual}`
            : defaultMessage;
        const withExpected = this.expected
            ?
                `${withActual}, expected: ${this.expected}`
            : withActual;
        return withExpected;
    }
}
exports.TransactionPoolError = TransactionPoolError;
//# sourceMappingURL=errors.js.map