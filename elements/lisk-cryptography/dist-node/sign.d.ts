/// <reference types="node" />
export interface SignedMessageWithOnePassphrase {
    readonly message: string;
    readonly publicKey: string;
    readonly signature: string;
}
export declare const digestMessage: (message: string) => Buffer;
export declare const signMessageWithPassphrase: (message: string, passphrase: string) => SignedMessageWithOnePassphrase;
export declare const verifyMessageWithPublicKey: ({ message, publicKey, signature, }: SignedMessageWithOnePassphrase) => boolean;
export interface SignedMessageWithTwoPassphrases {
    readonly message: string;
    readonly publicKey: string;
    readonly secondPublicKey: string;
    readonly secondSignature: string;
    readonly signature: string;
}
export declare const signMessageWithTwoPassphrases: (message: string, passphrase: string, secondPassphrase: string) => SignedMessageWithTwoPassphrases;
export declare const verifyMessageWithTwoPublicKeys: ({ message, signature, secondSignature, publicKey, secondPublicKey, }: SignedMessageWithTwoPassphrases) => boolean;
export interface SingleOrDoubleSignedMessage {
    readonly message: string;
    readonly publicKey: string;
    readonly secondPublicKey?: string;
    readonly secondSignature?: string;
    readonly signature: string;
}
export declare const printSignedMessage: ({ message, signature, publicKey, secondSignature, secondPublicKey, }: SingleOrDoubleSignedMessage) => string;
export declare const signAndPrintMessage: (message: string, passphrase: string, secondPassphrase?: string) => string;
export declare const signDataWithPrivateKey: (data: Buffer, privateKey: Buffer) => string;
export declare const signDataWithPassphrase: (data: Buffer, passphrase: string) => string;
export declare const signData: (data: Buffer, passphrase: string) => string;
export declare const verifyData: (data: Buffer, signature: string, publicKey: string) => boolean;
