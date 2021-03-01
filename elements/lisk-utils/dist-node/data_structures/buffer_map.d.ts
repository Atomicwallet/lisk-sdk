/// <reference types="node" />
export declare class BufferMap<V> {
    private _data;
    constructor(data?: {
        [key: string]: V | undefined;
    });
    get size(): number;
    get(key: Buffer): V | undefined;
    delete(key: Buffer): void;
    set(key: Buffer, value: V): void;
    has(key: Buffer): boolean;
    clone(): BufferMap<V>;
    entries(): [Buffer, V][];
    values(): V[];
}
