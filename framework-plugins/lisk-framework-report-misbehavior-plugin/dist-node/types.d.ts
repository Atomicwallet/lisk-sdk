/// <reference types="node" />
export interface Options {
    version: string;
    readonly dataPath: string;
    readonly encryptedPassphrase: string;
    readonly defaultPassword: string;
    readonly port: number;
    readonly whiteList: ReadonlyArray<string>;
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly limits: {
        readonly max: number;
        readonly delayMs: number;
        readonly delayAfter: number;
        readonly windowMs: number;
        readonly headersTimeout: number;
        readonly serverSetTimeout: number;
    };
    readonly fee: number;
    readonly clearBlockHeadersInterval: number;
}
export interface State {
    publicKey?: Buffer;
    passphrase?: string;
    currentHeight: number;
}
