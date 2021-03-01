/// <reference types="node" />
interface MultiSignatureKeys {
    readonly mandatoryKeys: Array<Buffer>;
    readonly optionalKeys: Array<Buffer>;
}
export declare const getSigningBytes: (assetSchema: object, transactionObject: Record<string, unknown>) => Buffer;
export declare const getBytes: (assetSchema: object, transactionObject: Record<string, unknown>) => Buffer;
export declare const signTransaction: (assetSchema: object, transactionObject: Record<string, unknown>, networkIdentifier: Buffer, passphrase: string) => Record<string, unknown>;
export declare const signMultiSignatureTransaction: (assetSchema: object, transactionObject: Record<string, unknown>, networkIdentifier: Buffer, passphrase: string, keys: MultiSignatureKeys, includeSenderSignature?: boolean) => Record<string, unknown>;
export {};
