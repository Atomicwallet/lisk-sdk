export declare class Node<V = object, K = number | bigint> {
    key: K;
    value: V;
    constructor(key: K, value: V);
    clone(): Node<V, K>;
}
