/// <reference types="node" />
import { Account } from '@liskhq/lisk-chain';
import { AccountKeys } from '../types';
export declare const isMultisignatureAccount: (account: Account<AccountKeys>) => boolean;
export declare const validateSignature: (publicKey: Buffer, signature: Buffer, transactionBytes: Buffer, id: Buffer) => void;
export declare const validateKeysSignatures: (keys: readonly Buffer[], signatures: readonly Buffer[], transactionBytes: Buffer, id: Buffer) => void;
export declare const verifyMultiSignatureTransaction: (id: Buffer, sender: Account<AccountKeys>, signatures: readonly Buffer[], transactionBytes: Buffer) => void;
