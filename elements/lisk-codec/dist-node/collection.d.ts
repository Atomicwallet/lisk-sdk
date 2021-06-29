/// <reference types="node" />
import { GenericObject, CompiledSchema, CompiledSchemasArray } from './types';
export declare const writeObject: (compiledSchema: CompiledSchemasArray, message: GenericObject, chunks: Buffer[]) => [Buffer[], number];
export declare const readObject: (message: Buffer, offset: number, compiledSchema: CompiledSchemasArray, terminateIndex: number) => [GenericObject, number];
export declare const readArray: (message: Buffer, offset: number, compiledSchema: CompiledSchemasArray, terminateIndex: number) => [Array<any>, number];
export declare const writeArray: (compiledSchema: CompiledSchema[], message: Array<unknown>, chunks: Buffer[]) => [Buffer[], number];
