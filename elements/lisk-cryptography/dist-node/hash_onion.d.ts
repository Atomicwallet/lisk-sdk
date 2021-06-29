/// <reference types="node" />
export declare const generateHashOnionSeed: () => Buffer;
export declare const hashOnion: (seed: Buffer, count?: number, distance?: number) => ReadonlyArray<Buffer>;
