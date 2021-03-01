/// <reference types="node" />
import { NodeLocation } from './types';
export declare const isLeaf: (value: Buffer) => boolean;
export declare const generateHash: (prefix: Buffer, leftHash: Buffer, rightHash: Buffer) => Buffer;
export declare const getMaxIdxAtLayer: (layer: number, dataLength: number) => number;
export declare const getLayerStructure: (dataLength: number) => number[];
export declare const getBinaryString: (num: number, length: number) => string;
export declare const getBinary: (num: number, length: number) => number[];
export declare const getPairLocation: (nodeInfo: {
    layerIndex: number;
    nodeIndex: number;
    dataLength: number;
}) => NodeLocation;
