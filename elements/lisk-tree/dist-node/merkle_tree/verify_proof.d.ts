/// <reference types="node" />
import { Proof, VerifyResult } from './types';
export declare const verifyProof: (options: {
    queryData: ReadonlyArray<Buffer>;
    proof: Proof;
    rootHash: Buffer;
}) => VerifyResult;
