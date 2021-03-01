import { Node } from './node';
export declare class MinHeap<T, K = bigint | number> {
    protected _nodes: Array<Node<T, K>>;
    constructor(heap?: MinHeap<T, K>);
    push(key: K, value: T): void;
    pop(): {
        key: K;
        value: T;
    } | undefined;
    peek(): {
        key: K;
        value: T;
    } | undefined;
    clone(): MinHeap<T, K>;
    clear(): void;
    get count(): number;
    get keys(): ReadonlyArray<K>;
    get values(): ReadonlyArray<T>;
    protected _moveUp(originalIndex: number): void;
    protected _moveDown(originalIndex: number): void;
    protected _parentIndex(index: number): number;
    protected _leftChildIndex(index: number): number;
    protected _rightChildIndex(index: number): number;
    private _insertAll;
    private _insertAllFromHeap;
}
