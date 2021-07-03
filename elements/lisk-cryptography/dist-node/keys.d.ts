export interface KeypairBytes {
    readonly privateKeyBytes: Buffer;
    readonly publicKeyBytes: Buffer;
}
export interface Keypair {
    readonly privateKey: string;
    readonly publicKey: string;
}
export declare const getPrivateAndPublicKeyBytesFromPassphrase: (passphrase: string) => KeypairBytes;
export declare const getPrivateAndPublicKeyFromPassphrase: (passphrase: string) => Keypair;
export declare const getKeys: (passphrase: string) => Keypair;
export declare const getAddressAndPublicKeyFromPassphrase: (passphrase: string) => {
    readonly address: string;
    readonly publicKey: string;
};
export declare const getAddressFromPassphrase: (passphrase: string) => string;
export declare const getAddressFromPrivateKey: (privateKey: string) => string;
