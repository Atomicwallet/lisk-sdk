/// <reference types="node" />
export interface BlsLib {
    blsKeyValidate: (pk: Buffer) => boolean;
    blsKeyGen: (ikm: Buffer) => Buffer;
    blsSkToPk: (sk: Buffer) => Buffer;
    blsAggregate: (signatures: Buffer[]) => Buffer | false;
    blsSign: (sk: Buffer, message: Buffer) => Buffer;
    blsVerify: (pk: Buffer, message: Buffer, signature: Buffer) => boolean;
    blsAggregateVerify: (publicKeys: ReadonlyArray<Buffer>, messages: ReadonlyArray<Buffer>, signature: Buffer) => boolean;
    blsFastAggregateVerify: (publicKeys: ReadonlyArray<Buffer>, messages: Buffer, signature: Buffer) => boolean;
    blsPopProve: (sk: Buffer) => Buffer;
    blsPopVerify: (pk: Buffer, proof: Buffer) => boolean;
}
