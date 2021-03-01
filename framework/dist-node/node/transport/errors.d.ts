/// <reference types="node" />
export declare class InvalidTransactionError extends Error {
    readonly message: string;
    readonly id: Buffer;
    constructor(message: string, id: Buffer);
}
