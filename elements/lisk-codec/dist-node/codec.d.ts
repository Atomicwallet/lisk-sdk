/// <reference types="node" />
import { Schema } from './types';
export declare const validateSchema: (schema: {
    [key: string]: any;
    $schema?: string | undefined;
    $id?: string | undefined;
}) => boolean;
export declare class Codec {
    private _compileSchemas;
    addSchema(schema: Schema): boolean;
    encode(schema: Schema, message: object): Buffer;
    decode<T>(schema: Schema, message: Buffer): T;
    decodeJSON<T>(schema: Schema, message: Buffer): T;
    encodeJSON(schema: Schema, message: object): Buffer;
    toJSON<T = object>(schema: Schema, message: object): T;
    fromJSON<T = object>(schema: Schema, message: object): T;
    clearCache(): void;
    private _compileSchema;
}
export declare const codec: Codec;
