/// <reference types="node" />
import { IsValidResponse, IsValidResponseWithError, TransactionJSON } from '../transaction_types';
export declare const multiSignTransaction: (transaction: TransactionJSON, passphrase: string) => string;
export declare const validateSignature: (publicKey: string, signature: string, transactionBytes: Buffer, id?: string) => IsValidResponseWithError;
export declare const signaturesAreUnique: (signatures: ReadonlyArray<string>) => boolean;
export declare const checkPublicKeySignatureUniqueness: (publicKeys: ReadonlyArray<string>, signatures: ReadonlyArray<string>, transactionBytes: Buffer, id?: string) => Set<string>;
export declare const validateMultisignatures: (publicKeys: ReadonlyArray<string>, signatures: ReadonlyArray<string>, minimumValidations: number, transactionBytes: Buffer, id?: string) => IsValidResponse;
export declare const signTransaction: (transaction: TransactionJSON, passphrase: string) => string;
export declare const secondSignTransaction: (transaction: TransactionJSON, secondPassphrase: string) => TransactionJSON;
export declare const verifyTransaction: (transaction: TransactionJSON, secondPublicKey?: string) => boolean;
