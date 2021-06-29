/// <reference types="node" />
import { Account } from '@liskhq/lisk-chain';
import { AccountKeys } from '../types';
export declare const isMultisignatureAccount: (account: Account<AccountKeys>) => boolean;
export declare const validateSignature: (tag: string, networkIdentifier: Buffer, publicKey: Buffer, signature: Buffer, transactionBytes: Buffer, id: Buffer) => void;
export declare const validateKeysSignatures: (tag: string, networkIdentifier: Buffer, keys: ReadonlyArray<Buffer>, signatures: ReadonlyArray<Buffer>, transactionBytes: Buffer, id: Buffer) => void;
export declare const verifyMultiSignatureTransaction: (tag: string, networkIdentifier: Buffer, id: Buffer, sender: Account<AccountKeys>, signatures: ReadonlyArray<Buffer>, transactionBytes: Buffer) => void;
