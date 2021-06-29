/// <reference types="node" />
export declare class FrameworkError extends Error {
    name: string;
    code: string;
    constructor(...args: any[]);
}
export declare class NonceOutOfBoundsError extends FrameworkError {
    code: string;
    actual: string;
    expected: string;
    constructor(message: string, actual: bigint, expected: bigint);
}
export declare class SchemaValidationError extends FrameworkError {
    errors: Error[];
    code: string;
    constructor(errors: Error[]);
}
export declare class DuplicateAppInstanceError extends FrameworkError {
    appLabel: string;
    pidPath: string;
    code: string;
    constructor(appLabel: string, pidPath: string);
}
export declare class ImplementationMissingError extends FrameworkError {
    code: string;
    constructor();
}
export declare class ValidationError extends FrameworkError {
    code: string;
    value: string;
    constructor(message: string, value: string);
}
export declare class TransactionApplyError extends Error {
    id: Buffer;
    transactionError: Error;
    code: string;
    constructor(message: string, id: Buffer, transactionError: Error);
}
export declare class ApplyPenaltyError extends FrameworkError {
    code: string;
}
