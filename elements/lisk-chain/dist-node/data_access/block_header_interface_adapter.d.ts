/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { BlockHeader } from '../types';
export interface RegisteredBlockHeaders {
    readonly [key: number]: Schema;
}
export declare class BlockHeaderInterfaceAdapter {
    private readonly _blockSchemaMap;
    constructor(registeredBlocks?: RegisteredBlockHeaders);
    getSchema(version: number): Schema;
    decode<T>(buffer: Buffer): BlockHeader<T>;
    encode<T = Record<string, unknown>>(header: BlockHeader<T>, skipSignature?: boolean): Buffer;
}
