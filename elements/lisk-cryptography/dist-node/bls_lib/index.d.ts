/// <reference types="node" />
import { BlsLib } from './types';
export declare let lib: BlsLib;
export declare let BLS_SUPPORTED: boolean;
export declare const blsSign: (sk: Buffer, message: Buffer) => Buffer, blsVerify: (pk: Buffer, message: Buffer, signature: Buffer) => boolean, blsKeyValidate: (pk: Buffer) => boolean, blsAggregate: (signatures: Buffer[]) => false | Buffer, blsKeyGen: (ikm: Buffer) => Buffer, blsFastAggregateVerify: (publicKeys: readonly Buffer[], messages: Buffer, signature: Buffer) => boolean, blsAggregateVerify: (publicKeys: readonly Buffer[], messages: readonly Buffer[], signature: Buffer) => boolean, blsSkToPk: (sk: Buffer) => Buffer, blsPopProve: (sk: Buffer) => Buffer, blsPopVerify: (pk: Buffer, proof: Buffer) => boolean;
