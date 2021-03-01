/// <reference types="node" />
export interface Keypair {
    readonly privateKey: Buffer;
    readonly publicKey: Buffer;
}
