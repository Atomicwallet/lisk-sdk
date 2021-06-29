/// <reference types="node" />
import { NodeInfo, Proof } from './types';
export declare class MerkleTree {
    private _root;
    private _width;
    private readonly _preHashedLeaf;
    private _hashToValueMap;
    private _locationToHashMap;
    constructor(initValues?: Buffer[], options?: {
        preHashedLeaf: boolean;
    });
    get root(): Buffer;
    getNode(nodeHash: Buffer): NodeInfo;
    append(value: Buffer): Buffer;
    generateProof(queryData: ReadonlyArray<Buffer>): Proof;
    clear(): void;
    toString(): string;
    getData(): NodeInfo[];
    private _getHeight;
    private _generateLeaf;
    private _generateBranch;
    private _build;
    private _printNode;
}
