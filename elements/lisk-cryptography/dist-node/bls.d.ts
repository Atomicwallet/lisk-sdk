/// <reference types="node" />
import { BLS_SUPPORTED } from './bls_lib';
export { BLS_SUPPORTED };
export declare const generatePrivateKey: (ikm: Buffer) => Buffer;
export declare const getPublicKeyFromPrivateKey: (sk: Buffer) => Buffer;
export declare const validateKey: (pk: Buffer) => boolean;
export declare const signBLS: (tag: string, networkIdentifier: Buffer, data: Buffer, privateKey: Buffer) => Buffer;
export declare const verifyBLS: (tag: string, networkIdentifier: Buffer, data: Buffer, signature: Buffer, publicKey: Buffer) => boolean;
export declare const createAggSig: (publicKeysList: Buffer[], pubKeySignaturePairs: {
    publicKey: Buffer;
    signature: Buffer;
}[]) => {
    aggregationBits: Buffer;
    signature: Buffer;
};
export declare const verifyAggSig: (publicKeysList: Buffer[], aggregationBits: Buffer, signature: Buffer, tag: string, networkIdentifier: Buffer, message: Buffer) => boolean;
export declare const verifyWeightedAggSig: (publicKeysList: Buffer[], aggregationBits: Buffer, signature: Buffer, tag: string, networkIdentifier: Buffer, message: Buffer, weights: number[], threshold: number) => boolean;
