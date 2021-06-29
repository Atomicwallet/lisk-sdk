/// <reference types="node" />
export declare const createMessageTag: (domain: string, version?: string | number | undefined) => string;
export declare const tagMessage: (tag: string, networkIdentifier: Buffer, message: string | Buffer) => Buffer;
