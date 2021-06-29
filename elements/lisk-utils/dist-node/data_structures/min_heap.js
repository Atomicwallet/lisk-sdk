"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
const node_1 = require("./node");
class MinHeap {
    constructor(heap) {
        this._nodes = [];
        if (heap) {
            this._insertAll(heap);
        }
    }
    push(key, value) {
        const node = new node_1.Node(key, value);
        this._nodes.push(node);
        this._moveUp(this._nodes.length - 1);
    }
    pop() {
        if (this.count <= 0) {
            return undefined;
        }
        if (this.count === 1) {
            const node = this._nodes[0];
            this.clear();
            return node;
        }
        const rootNode = this._nodes[0];
        this._nodes[0] = this._nodes.pop();
        this._moveDown(0);
        return rootNode;
    }
    peek() {
        if (this._nodes.length <= 0) {
            return undefined;
        }
        return this._nodes[0];
    }
    clone() {
        return new MinHeap(this);
    }
    clear() {
        this._nodes = [];
    }
    get count() {
        return this._nodes.length;
    }
    get keys() {
        return this._nodes.map(n => n.key);
    }
    get values() {
        return this._nodes.map(n => n.value);
    }
    _moveUp(originalIndex) {
        let index = originalIndex;
        const node = this._nodes[index];
        while (index > 0) {
            const parentIndex = this._parentIndex(index);
            if (this._nodes[parentIndex].key > node.key) {
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
            const nextPath = rightChild < this.count && this._nodes[rightChild].key < this._nodes[leftChild].key
                ? rightChild
                : leftChild;
            if (this._nodes[nextPath].key > node.key) {
                break;
            }
            this._nodes[index] = this._nodes[nextPath];
            index = nextPath;
        }
        this._nodes[index] = node;
    }
    _parentIndex(index) {
        return (index - 1) >> 1;
    }
    _leftChildIndex(index) {
        return index * 2 + 1;
    }
    _rightChildIndex(index) {
        return index * 2 + 2;
    }
    _insertAll(heap) {
        if (!(heap instanceof MinHeap)) {
            throw new Error('Only heap instance can be inserted');
        }
        this._insertAllFromHeap(heap);
    }
    _insertAllFromHeap(heap) {
        const { keys, values } = heap;
        if (this.count <= 0) {
            for (let i = 0; i < heap.count; i += 1) {
                this._nodes.push(new node_1.Node(keys[i], values[i]));
            }
            return;
        }
        for (let i = 0; i < heap.count; i += 1) {
            this.push(keys[i], values[i]);
        }
    }
}
exports.MinHeap = MinHeap;
//# sourceMappingURL=min_heap.js.map