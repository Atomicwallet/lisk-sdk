/// <reference types="node" />
export declare class TransactionPoolError extends Error {
    message: string;
    id: Buffer;
    dataPath: string;
    actual?: string | number;
    expected?: string | number;
    constructor(message?: string, id?: Buffer, dataPath?: string, actual?: string | number, expected?: string | number);
    toString(): string;
}
