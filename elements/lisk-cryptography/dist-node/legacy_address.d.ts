/// <reference types="node" />
export declare const getLegacyAddressFromPublicKey: (publicKey: Buffer) => string;
export declare const getLegacyAddressAndPublicKeyFromPassphrase: (passphrase: string) => {
    readonly address: string;
    readonly publicKey: Buffer;
};
export declare const getLegacyAddressFromPassphrase: (passphrase: string) => string;
export declare const getLegacyAddressFromPrivateKey: (privateKey: Buffer) => string;
