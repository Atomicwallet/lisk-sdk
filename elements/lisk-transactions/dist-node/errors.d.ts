export declare class TransactionError extends Error {
    message: string;
    id: string;
    dataPath: string;
    actual?: string | number;
    expected?: string | number;
    constructor(message?: string, id?: string, dataPath?: string, actual?: string | number, expected?: string | number);
    toString(): string;
}
export declare class TransactionPendingError extends TransactionError {
    id: string;
    dataPath: string;
    constructor(message?: string, id?: string, dataPath?: string);
    toString(): string;
}
interface ErrorObject {
    readonly dataPath: string;
    readonly message?: string;
}
export declare const convertToTransactionError: (id: string, errors: ReadonlyArray<ErrorObject> | null | undefined) => ReadonlyArray<TransactionError>;
export declare const convertToAssetError: (id: string, errors: ReadonlyArray<ErrorObject> | null | undefined) => ReadonlyArray<TransactionError>;
export {};
