"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    $id: '#/plugins/lisk-faucet/config',
    type: 'object',
    properties: {
        port: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
        },
        host: {
            type: 'string',
            format: 'ip',
        },
        encryptedPassphrase: {
            type: 'string',
            format: 'encryptedPassphrase',
            description: 'Encrypted passphrase of the genesis account',
        },
        applicationUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL to connect',
        },
        fee: {
            type: 'string',
            description: 'The transaction fee used to faucet an account',
        },
        amount: {
            type: 'string',
            description: 'Number of tokens to fund an account per request',
        },
        tokenPrefix: {
            type: 'string',
            description: 'The token prefix associated with your application',
        },
        logoURL: {
            type: 'string',
            format: 'uri',
            description: 'The URL of the logo used on the UI',
        },
        captchaSecretkey: {
            type: 'string',
            description: 'The re-captcha secret key',
        },
        captchaSitekey: {
            type: 'string',
            description: 'The re-captcha site key',
        },
    },
    required: ['encryptedPassphrase', 'captchaSecretkey', 'captchaSitekey'],
    default: {
        port: 4004,
        host: '127.0.0.1',
        applicationUrl: 'ws://localhost:8080/ws',
        fee: '0.1',
        amount: '100',
        tokenPrefix: 'lsk',
    },
};
//# sourceMappingURL=config.js.map