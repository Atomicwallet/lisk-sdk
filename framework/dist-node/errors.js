"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyPenaltyError = exports.TransactionApplyError = exports.ValidationError = exports.ImplementationMissingError = exports.DuplicateAppInstanceError = exports.SchemaValidationError = exports.NonceOutOfBoundsError = exports.FrameworkError = void 0;
class FrameworkError extends Error {
    constructor(...args) {
        super(...args);
        this.code = 'ERR_FRAMEWORK';
        this.name = this.constructor.name;
        Error.captureStackTrace(this, FrameworkError);
    }
}
exports.FrameworkError = FrameworkError;
class NonceOutOfBoundsError extends FrameworkError {
    constructor(message, actual, expected) {
        super(message);
        this.code = 'ERR_NONCE_OUT_OF_BOUNDS';
        this.actual = actual.toString();
        this.expected = expected.toString();
    }
}
exports.NonceOutOfBoundsError = NonceOutOfBoundsError;
class SchemaValidationError extends FrameworkError {
    constructor(errors) {
        super(JSON.stringify(errors, null, 2));
        this.code = 'ERR_SCHEMA_VALIDATION';
        this.errors = errors;
    }
}
exports.SchemaValidationError = SchemaValidationError;
class DuplicateAppInstanceError extends FrameworkError {
    constructor(appLabel, pidPath) {
        super(`Duplicate app instance for "${appLabel}"`);
        this.code = 'ERR_DUPLICATE_APP_INSTANCE';
        this.appLabel = appLabel;
        this.pidPath = pidPath;
    }
}
exports.DuplicateAppInstanceError = DuplicateAppInstanceError;
class ImplementationMissingError extends FrameworkError {
    constructor() {
        super('Implementation missing error');
        this.code = 'ERR_IMPLEMENTATION_MISSING';
    }
}
exports.ImplementationMissingError = ImplementationMissingError;
class ValidationError extends FrameworkError {
    constructor(message, value) {
        super(message);
        this.code = 'ERR_VALIDATION';
        this.value = value;
    }
}
exports.ValidationError = ValidationError;
class TransactionApplyError extends Error {
    constructor(message, id, transactionError) {
        super(message);
        this.code = 'ERR_TRANSACTION_VERIFICATION_FAIL';
        this.name = this.constructor.name;
        this.id = id;
        this.transactionError = transactionError;
    }
}
exports.TransactionApplyError = TransactionApplyError;
class ApplyPenaltyError extends FrameworkError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_APPLY_PENALTY';
    }
}
exports.ApplyPenaltyError = ApplyPenaltyError;
//# sourceMappingURL=errors.js.map