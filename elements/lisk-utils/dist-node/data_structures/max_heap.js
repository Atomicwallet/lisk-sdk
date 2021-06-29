"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxHeap = void 0;
const min_heap_1 = require("./min_heap");
class MaxHeap extends min_heap_1.MinHeap {
    _moveUp(originalIndex) {
        let index = originalIndex;
        const node = this._nodes[index];
        while (index > 0) {
            const parentIndex = this._parentIndex(index);
            if (this._nodes[parentIndex].key < node.key) {
                this._nodes[index] = this._nodes[parentIndex];
                index = parentIndex;
                continue;
            }
            break;
        }
        this._nodes[index] = node;
    }
    _moveDown(originalIndex) {
        let index = originalIndex;
        const node = this._nodes[index];
        const halfCount = this.count >> 1;
        while (index < halfCount) {
            const leftChild = this._leftChildIndex(index);
            const rightChild = this._rightChildIndex(index);
            const nextPath = rightChild < this.count && this._nodes[rightChild].key > this._nodes[leftChild].key
                ? rightChild
                : leftChild;
            if (this._nodes[nextPath].key < node.key) {
                break;
            }
            this._nodes[index] = this._nodes[nextPath];
            index = nextPath;
        }
        this._nodes[index] = node;
    }
}
exports.MaxHeap = MaxHeap;
//# sourceMappingURL=max_heap.js.map