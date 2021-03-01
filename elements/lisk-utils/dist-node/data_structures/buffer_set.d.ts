/// <reference types="node" />
export declare class BufferSet {
    private _data;
    constructor(data?: Buffer[]);
    delete(key: Buffer): void;
    add(value: Buffer): void;
    has(value: Buffer): boolean;
    clone(): BufferSet;
    get size(): number;
    [Symbol.iterator](): {
        next: () => {
            value: Buffer;
            done: boolean;
        };
    };
}
