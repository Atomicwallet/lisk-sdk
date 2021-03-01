/// <reference types="node" />
import { Channel, RegisteredSchemas } from './types';
export declare class Account {
    private readonly _channel;
    private readonly _schemas;
    constructor(channel: Channel, schemas: RegisteredSchemas);
    get(address: Buffer | string): Promise<Record<string, unknown>>;
    encode(input: Record<string, unknown>): Buffer;
    decode(input: Buffer | string): Record<string, unknown>;
    toJSON(account: Record<string, unknown>): Record<string, unknown>;
    fromJSON(account: Record<string, unknown>): Record<string, unknown>;
}
