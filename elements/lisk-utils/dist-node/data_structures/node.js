"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    clone() {
        return new Node(this.key, this.value);
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map