"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = void 0;
const lisk_cryptography_1 = ("../../lisk-cryptography");
const lisk_utils_1 = ("../../lisk-utils");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class MerkleTree {
    constructor(initValues = [], options) {
        var _a, _b;
        this._width = 0;
        this._hashToValueMap = {};
        this._locationToHashMap = {};
        if (initValues.length <= 1) {
            const rootNode = initValues.length
                ? this._generateLeaf(initValues[0], 0)
                : { hash: constants_1.EMPTY_HASH, value: Buffer.alloc(0) };
            this._root = rootNode.hash;
            this._hashToValueMap[this._root.toString('binary')] = rootNode.value;
            this._locationToHashMap[`${utils_1.getBinaryString(0, this._getHeight())}`] = this._root;
            this._width = initValues.length ? 1 : 0;
            this._preHashedLeaf = (_a = options === null || options === void 0 ? void 0 : options.preHashedLeaf) !== null && _a !== void 0 ? _a : false;
            return;
        }
        this._preHashedLeaf = (_b = options === null || options === void 0 ? void 0 : options.preHashedLeaf) !== null && _b !== void 0 ? _b : false;
        this._root = this._build(initValues);
    }
    get root() {
        return this._root;
    }
    getNode(nodeHash) {
        const value = this._hashToValueMap[nodeHash.toString('binary')];
        if (!value) {
            throw new Error(`Hash does not exist in merkle tree: ${nodeHash.toString('hex')}`);
        }
        const type = utils_1.isLeaf(value) ? "leaf" : "branch";
        const layerIndex = type === "leaf" ? 0 : value.readInt8(constants_1.BRANCH_PREFIX.length);
        const nodeIndex = type === "branch"
            ? value.readInt32BE(constants_1.BRANCH_PREFIX.length + constants_1.LAYER_INDEX_SIZE)
            : value.readInt32BE(constants_1.LEAF_PREFIX.length);
        const rightHash = type === "branch" ? value.slice(-1 * constants_1.NODE_HASH_SIZE) : Buffer.alloc(0);
        const leftHash = type === "branch"
            ? value.slice(-2 * constants_1.NODE_HASH_SIZE, -1 * constants_1.NODE_HASH_SIZE)
            : Buffer.alloc(0);
        return {
            type,
            hash: nodeHash,
            value,
            layerIndex,
            nodeIndex,
            rightHash,
            leftHash,
        };
    }
    append(value) {
        if (this._width === 0) {
            const leaf = this._generateLeaf(value, 0);
            this._root = leaf.hash;
            this._width += 1;
            return this._root;
        }
        const appendPath = [];
        let currentNode = this.getNode(this._root);
        if (this._width === 2 ** (this._getHeight() - 1)) {
            appendPath.push(currentNode);
        }
        else {
            while (true) {
                const currentLayer = currentNode.layerIndex;
                let currentLayerSize = this._width >> currentLayer;
                if (currentLayerSize % 2 === 1 && currentNode.nodeIndex % 2 === 0) {
                    appendPath.push(currentNode);
                }
                if (currentNode.type === "leaf") {
                    break;
                }
                currentLayerSize = this._width >> (currentLayer - 1);
                if (currentLayerSize % 2 === 1) {
                    const leftNode = this.getNode(currentNode.leftHash);
                    appendPath.push(leftNode);
                }
                currentNode = this.getNode(currentNode.rightHash);
            }
        }
        const appendData = this._generateLeaf(value, this._width);
        const appendNode = this.getNode(appendData.hash);
        appendPath.push(appendNode);
        while (appendPath.length > 1) {
            const rightNodeInfo = appendPath.pop();
            const leftNodeInfo = appendPath.pop();
            const newBranchNode = this._generateBranch(leftNodeInfo.hash, rightNodeInfo.hash, leftNodeInfo.layerIndex + 1, leftNodeInfo.nodeIndex + 1);
            appendPath.push(this.getNode(newBranchNode.hash));
        }
        this._root = appendPath[0].hash;
        return this.root;
    }
    generateProof(queryData) {
        if (this._width === 0) {
            return {
                path: [],
                indexes: [],
                dataLength: 0,
            };
        }
        const path = [];
        const addedPath = new lisk_utils_1.dataStructures.BufferSet();
        const indexes = [];
        let queryNode;
        for (let i = 0; i < queryData.length; i += 1) {
            try {
                queryNode = this.getNode(queryData[i]);
            }
            catch (err) {
                path.push({
                    hash: queryData[i],
                    layerIndex: undefined,
                    nodeIndex: undefined,
                });
                indexes.push({
                    layerIndex: undefined,
                    nodeIndex: undefined,
                });
                continue;
            }
            if (this._width === 1 && this._root.equals(queryNode.hash)) {
                if (!addedPath.has(queryNode.hash)) {
                    addedPath.add(queryNode.hash);
                    path.push({
                        hash: queryNode.hash,
                        layerIndex: 0,
                        nodeIndex: 0,
                    });
                    indexes.push({
                        layerIndex: 0,
                        nodeIndex: 0,
                    });
                }
                continue;
            }
            indexes.push({
                layerIndex: queryNode.layerIndex,
                nodeIndex: queryNode.nodeIndex,
            });
            let currentNode = queryNode;
            while (!currentNode.hash.equals(this._root)) {
                const { layerIndex: pairLayerIndex, nodeIndex: pairNodeIndex, side: pairSide, } = utils_1.getPairLocation({
                    layerIndex: currentNode.layerIndex,
                    nodeIndex: currentNode.nodeIndex,
                    dataLength: this._width,
                });
                const pairNodeHash = this._locationToHashMap[`${utils_1.getBinaryString(pairNodeIndex, this._getHeight() - pairLayerIndex)}`];
                if (!addedPath.has(pairNodeHash)) {
                    addedPath.add(pairNodeHash);
                    path.push({
                        hash: pairNodeHash,
                        layerIndex: pairLayerIndex,
                        nodeIndex: pairNodeIndex,
                    });
                }
                const leftHashBuffer = pairSide === 0 ? pairNodeHash : currentNode.hash;
                const rightHashBuffer = pairSide === 1 ? pairNodeHash : currentNode.hash;
                const parentNodeHash = utils_1.generateHash(constants_1.BRANCH_PREFIX, leftHashBuffer, rightHashBuffer);
                currentNode = this.getNode(parentNodeHash);
            }
        }
        return {
            path,
            indexes,
            dataLength: this._width,
        };
    }
    clear() {
        this._width = 0;
        this._root = constants_1.EMPTY_HASH;
        this._hashToValueMap = { [this._root.toString('2')]: Buffer.alloc(0) };
    }
    toString() {
        if (this._width === 0) {
            return this.root.toString('hex');
        }
        return this._printNode(this.root);
    }
    getData() {
        return this._width === 0
            ? []
            : Object.keys(this._hashToValueMap).map(key => this.getNode(Buffer.from(key, 'binary')));
    }
    _getHeight() {
        return Math.ceil(Math.log2(this._width)) + 1;
    }
    _generateLeaf(value, nodeIndex) {
        const nodeIndexBuffer = Buffer.alloc(constants_1.NODE_INDEX_SIZE);
        nodeIndexBuffer.writeInt32BE(nodeIndex, 0);
        const leafValueWithoutNodeIndex = Buffer.concat([constants_1.LEAF_PREFIX, value], constants_1.LEAF_PREFIX.length + value.length);
        const leafHash = this._preHashedLeaf ? value : lisk_cryptography_1.hash(leafValueWithoutNodeIndex);
        const leafValueWithNodeIndex = Buffer.concat([constants_1.LEAF_PREFIX, nodeIndexBuffer, value], constants_1.LEAF_PREFIX.length + nodeIndexBuffer.length + value.length);
        this._hashToValueMap[leafHash.toString('binary')] = leafValueWithNodeIndex;
        this._locationToHashMap[`${utils_1.getBinaryString(nodeIndex, this._getHeight())}`] = leafHash;
        return {
            value: leafValueWithNodeIndex,
            hash: leafHash,
        };
    }
    _generateBranch(leftHashBuffer, rightHashBuffer, layerIndex, nodeIndex) {
        const layerIndexBuffer = Buffer.alloc(constants_1.LAYER_INDEX_SIZE);
        const nodeIndexBuffer = Buffer.alloc(constants_1.NODE_INDEX_SIZE);
        layerIndexBuffer.writeInt8(layerIndex, 0);
        nodeIndexBuffer.writeInt32BE(nodeIndex, 0);
        const branchValue = Buffer.concat([constants_1.BRANCH_PREFIX, layerIndexBuffer, nodeIndexBuffer, leftHashBuffer, rightHashBuffer], constants_1.BRANCH_PREFIX.length +
            layerIndexBuffer.length +
            nodeIndexBuffer.length +
            leftHashBuffer.length +
            rightHashBuffer.length);
        const branchHash = utils_1.generateHash(constants_1.BRANCH_PREFIX, leftHashBuffer, rightHashBuffer);
        this._hashToValueMap[branchHash.toString('binary')] = branchValue;
        this._locationToHashMap[`${utils_1.getBinaryString(nodeIndex, this._getHeight() - layerIndex)}`] = branchHash;
        return {
            hash: branchHash,
            value: branchValue,
        };
    }
    _build(initValues) {
        const leafHashes = [];
        this._width = initValues.length;
        for (let i = 0; i < initValues.length; i += 1) {
            const leaf = this._generateLeaf(initValues[i], i);
            leafHashes.push(leaf.hash);
        }
        let currentLayerIndex = 0;
        let currentLayerHashes = leafHashes;
        let orphanNodeHashInPreviousLayer;
        while (currentLayerHashes.length > 1 || orphanNodeHashInPreviousLayer !== undefined) {
            const pairsOfHashes = [];
            for (let i = 0; i < currentLayerHashes.length - 1; i += 2) {
                pairsOfHashes.push([currentLayerHashes[i], currentLayerHashes[i + 1]]);
            }
            if (currentLayerHashes.length % 2 === 1) {
                if (orphanNodeHashInPreviousLayer === undefined) {
                    orphanNodeHashInPreviousLayer = currentLayerHashes[currentLayerHashes.length - 1];
                }
                else {
                    pairsOfHashes.push([
                        currentLayerHashes[currentLayerHashes.length - 1],
                        orphanNodeHashInPreviousLayer,
                    ]);
                    orphanNodeHashInPreviousLayer = undefined;
                }
            }
            const parentLayerHashes = [];
            for (let i = 0; i < pairsOfHashes.length; i += 1) {
                const leftHash = pairsOfHashes[i][0];
                const rightHash = pairsOfHashes[i][1];
                const node = this._generateBranch(leftHash, rightHash, currentLayerIndex + 1, i);
                parentLayerHashes.push(node.hash);
            }
            currentLayerHashes = parentLayerHashes;
            currentLayerIndex += 1;
        }
        return currentLayerHashes[0];
    }
    _printNode(hashValue, level = 1) {
        const nodeValue = this._hashToValueMap[hashValue.toString('binary')];
        if (nodeValue && utils_1.isLeaf(nodeValue)) {
            return hashValue.toString('hex');
        }
        const node = this.getNode(hashValue);
        return [
            hashValue.toString('hex'),
            `├${' ─ '.repeat(level)} ${this._printNode(node.leftHash, level + 1)}`,
            `├${' ─ '.repeat(level)} ${this._printNode(node.rightHash, level + 1)}`,
        ].join('\n');
    }
}
exports.MerkleTree = MerkleTree;
//# sourceMappingURL=merkle_tree.js.map
