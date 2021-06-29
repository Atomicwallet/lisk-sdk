/// <reference types="node" />
export interface SignedMessageWithOnePassphrase {
    readonly message: string;
    readonly publicKey: Buffer;
    readonly signature: Buffer;
}
export declare const digestMessage: (message: string) => Buffer;
export declare const signMessageWithPassphrase: (message: string, passphrase: string) => SignedMessageWithOnePassphrase;
export declare const verifyMessageWithPublicKey: ({ message, publicKey, signature, }: SignedMessageWithOnePassphrase) => boolean;
export interface SignedMessage {
    readonly message: string;
    readonly publicKey: Buffer;
    readonly signature: Buffer;
}
export declare const printSignedMessage: ({ message, signature, publicKey }: SignedMessage) => string;
export declare const signAndPrintMessage: (message: string, passphrase: string) => string;
export declare const signDataWithPrivateKey: (tag: string, networkIdentifier: Buffer, data: Buffer, privateKey: Buffer) => Buffer;
export declare const signDataWithPassphrase: (tag: string, networkIdentifier: Buffer, data: Buffer, passphrase: string) => Buffer;
export declare const signData: (tag: string, networkIdentifier: Buffer, data: Buffer, passphrase: string) => Buffer;
export declare const verifyData: (tag: string, networkIdentifier: Buffer, data: Buffer, signature: Buffer, publicKey: Buffer) => boolean;
