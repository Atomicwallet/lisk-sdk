/// <reference types="node" />
export declare const enum NodeType {
    BRANCH = "branch",
    LEAF = "leaf"
}
export interface NodeData {
    readonly value: Buffer;
    readonly hash: Buffer;
}
export interface NodeInfo {
    readonly type: NodeType;
    readonly hash: Buffer;
    readonly value: Buffer;
    readonly leftHash: Buffer;
    readonly rightHash: Buffer;
    readonly layerIndex: number;
    readonly nodeIndex: number;
}
export declare const enum NodeSide {
    LEFT = 0,
    RIGHT = 1
}
export interface TreeStructure {
    [key: number]: NodeInfo[];
}
export interface Proof {
    readonly path: ReadonlyArray<{
        hash: Buffer;
        layerIndex: number | undefined;
        nodeIndex: number | undefined;
    }>;
    readonly indexes: ReadonlyArray<{
        layerIndex: number | undefined;
        nodeIndex: number | undefined;
    }>;
    readonly dataLength: number;
}
export interface NodeLocation {
    readonly layerIndex: number;
    readonly nodeIndex: number;
    readonly side?: NodeSide;
}
export declare type VerifyResult = ReadonlyArray<{
    hash: Buffer;
    verified: boolean;
}>;
