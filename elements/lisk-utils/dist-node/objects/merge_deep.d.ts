interface KVPair {
    [key: string]: any;
}
export declare const mergeDeep: (dest: KVPair, ...srcs: KVPair[]) => KVPair;
export {};
