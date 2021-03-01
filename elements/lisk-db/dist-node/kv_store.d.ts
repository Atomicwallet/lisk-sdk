/// <reference types="node" />
export interface Options {
    readonly gt?: string;
    readonly gte?: string;
    readonly lt?: string;
    readonly lte?: string;
    readonly reverse?: boolean;
    readonly limit?: number;
}
export interface BatchChain {
    put: (key: string, value: Buffer) => this;
    del: (key: string) => this;
    clear: () => this;
    write: () => Promise<this>;
    readonly length: number;
}
export interface ReadStreamOptions extends Options {
    readonly keys?: boolean;
    readonly values?: boolean;
    keyAsBuffer?: boolean;
}
export declare class KVStore {
    private readonly _db;
    constructor(filePath: string);
    close(): Promise<void>;
    get(key: string): Promise<Buffer>;
    exists(key: string): Promise<boolean>;
    clear(options?: Options): Promise<void>;
    put(key: string, val: Buffer): Promise<void>;
    del(key: string): Promise<void>;
    createReadStream(options?: ReadStreamOptions): NodeJS.ReadableStream;
    batch(): BatchChain;
}
