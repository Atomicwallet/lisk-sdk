/// <reference types="node" />
export declare class CommonBlockError extends Error {
    lastBlockID: string;
    constructor(message: string, lastBlockID: Buffer);
}
export declare const convertErrorsToString: (errors?: string | Error | readonly Error[] | undefined) => string;
