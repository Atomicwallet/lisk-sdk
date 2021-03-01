/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { RegisteredSchemas } from './types';
export declare const getTransactionAssetSchema: (transaction: Record<string, unknown>, registeredSchema: RegisteredSchemas) => Schema;
export declare const decodeAccount: (encodedAccount: Buffer, registeredSchema: RegisteredSchemas) => Record<string, unknown>;
export declare const decodeTransaction: (encodedTransaction: Buffer, registeredSchema: RegisteredSchemas) => Record<string, unknown>;
export declare const encodeTransaction: (transaction: Record<string, unknown>, registeredSchema: RegisteredSchemas) => Buffer;
export declare const decodeBlock: (encodedBlock: Buffer, registeredSchema: RegisteredSchemas) => Record<string, unknown>;
export declare const encodeBlock: (block: {
    header: Record<string, unknown>;
    payload: Record<string, unknown>[];
}, registeredSchema: RegisteredSchemas) => Buffer;
