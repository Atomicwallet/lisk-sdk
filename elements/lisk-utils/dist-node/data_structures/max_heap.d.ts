import { MinHeap } from './min_heap';
export declare class MaxHeap<T, K = bigint | number> extends MinHeap<T, K> {
    protected _moveUp(originalIndex: number): void;
    protected _moveDown(originalIndex: number): void;
}
