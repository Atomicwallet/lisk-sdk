"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TransactionError extends Error {
    constructor(message = '', id = '', dataPath = '', actual, expected) {
        super();
        this.message = message;
        this.name = 'TransactionError';
        this.id = id;
        this.dataPath = dataPath;
        this.actual = actual;
        this.expected = expected;
    }
    toString() {
        const defaultMessage = `Transaction: ${this.id} failed at ${this.dataPath}: ${this.message}`;
        const withActual = this.actual
            ? `${defaultMessage}, actual: ${this.actual}`
            : defaultMessage;
        const withExpected = this.expected
            ? `${withActual}, expected: ${this.expected}`
            : withActual;
        return withExpected;
    }
}
exports.TransactionError = TransactionError;
class TransactionPendingError extends TransactionError {
    constructor(message = '', id = '', dataPath = '') {
        super(message);
        this.name = 'TransactionPendingError';
        this.id = id;
        this.dataPath = dataPath;
    }
    toString() {
        return `Transaction: ${this.id} failed at ${this.dataPath}: ${this.message} `;
    }
}
exports.TransactionPendingError = TransactionPendingError;
exports.convertToTransactionError = (id, errors) => {
    if (!errors) {
        return [];
    }
    return errors.map(error => new TransactionError(`'${error.dataPath}' ${error.message}`, id, error.dataPath));
};
exports.convertToAssetError = (id, errors) => {
    if (!errors) {
        return [];
    }
    return errors.map(error => new TransactionError(`'${error.dataPath || '.asset'}' ${error.message}`, id, error.dataPath || '.asset'));
};
//# sourceMappingURL=errors.js.map