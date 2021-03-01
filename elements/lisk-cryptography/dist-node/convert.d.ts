/// <reference types="node" />
import * as ed2curve from 'ed2curve';
import { EncryptedPassphraseObject } from './encrypt';
export declare const convertUIntArray: (uintArray: number[], fromBits: number, toBits: number) => number[];
export declare const convertUInt5ToBase32: (uint5Array: number[]) => string;
export declare const getFirstEightBytesReversed: (input: string | Buffer) => Buffer;
export declare const convertPublicKeyEd2Curve: typeof ed2curve.convertPublicKey;
export declare const convertPrivateKeyEd2Curve: typeof ed2curve.convertSecretKey;
export declare const stringifyEncryptedPassphrase: (encryptedPassphrase: EncryptedPassphraseObject) => string;
export declare const parseEncryptedPassphrase: (encryptedPassphrase: string) => EncryptedPassphraseObject;
