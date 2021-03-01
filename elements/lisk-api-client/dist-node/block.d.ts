/// <reference types="node" />
import { Block as BlockType, Channel, RegisteredSchemas } from './types';
export declare class Block {
    private readonly _channel;
    private readonly _schemas;
    constructor(channel: Channel, registeredSchema: RegisteredSchemas);
    get(id: Buffer | string): Promise<Record<string, unknown>>;
    getByHeight(height: number): Promise<Record<string, unknown>>;
    encode(input: {
        header: Record<string, unknown>;
        payload: Record<string, unknown>[];
    }): Buffer;
    decode<T = Record<string, unknown>>(input: Buffer | string): T;
    toJSON(block: BlockType): {
        header: Record<string, unknown>;
        payload: Record<string, unknown>[];
    };
    fromJSON(block: BlockType<string>): {
        header: Record<string, unknown>;
        payload: Record<string, unknown>[];
    };
}
