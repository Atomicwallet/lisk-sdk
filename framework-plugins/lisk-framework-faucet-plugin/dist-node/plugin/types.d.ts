/// <reference types="node" />
import { PluginOptionsWithAppConfig } from 'lisk-framework';
export interface FaucetPluginOptions extends PluginOptionsWithAppConfig {
    port: number;
    host: string;
    encryptedPassphrase: string;
    applicationUrl: string;
    fee: string;
    amount: string;
    tokenPrefix: string;
    captchaSecret: string;
    logoURL?: string;
}
export interface State {
    publicKey?: Buffer;
    passphrase?: string;
}
