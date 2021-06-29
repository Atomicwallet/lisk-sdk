/// <reference types="node" />
import { Keypair } from './types';
export declare const getPrivateAndPublicKeyFromPassphrase: (passphrase: string) => Keypair;
export declare const getKeys: (passphrase: string) => Keypair;
export declare const getAddressFromPublicKey: (publicKey: Buffer) => Buffer;
export declare const getAddressAndPublicKeyFromPassphrase: (passphrase: string) => {
    readonly address: Buffer;
    readonly publicKey: Buffer;
};
export declare const getAddressFromPassphrase: (passphrase: string) => Buffer;
export declare const getAddressFromPrivateKey: (privateKey: Buffer) => Buffer;
export declare const createChecksum: (uint5Array: number[]) => number[];
export declare const verifyChecksum: (integerSequence: number[]) => boolean;
export declare const getLisk32AddressFromPublicKey: (publicKey: Buffer, prefix?: string) => string;
export declare const getBase32AddressFromPublicKey: (publicKey: Buffer, prefix?: string) => string;
export declare const getLisk32AddressFromPassphrase: (passphrase: string, prefix?: string) => string;
export declare const getBase32AddressFromPassphrase: (passphrase: string, prefix?: string) => string;
export declare const validateLisk32Address: (address: string, prefix?: string) => boolean;
export declare const validateBase32Address: (address: string, prefix?: string) => boolean;
export declare const getAddressFromLisk32Address: (base32Address: string, prefix?: string) => Buffer;
export declare const getAddressFromBase32Address: (base32Address: string, prefix?: string) => Buffer;
export declare const getLisk32AddressFromAddress: (address: Buffer, prefix?: string) => string;
export declare const getBase32AddressFromAddress: (address: Buffer, prefix?: string) => string;
