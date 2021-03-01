/// <reference types="node" />
import { Proof, VerifyResult } from './types';
export declare const verifyProof: (options: {
    queryData: readonly Buffer[];
    proof: Proof;
    rootHash: Buffer;
}) => VerifyResult;
