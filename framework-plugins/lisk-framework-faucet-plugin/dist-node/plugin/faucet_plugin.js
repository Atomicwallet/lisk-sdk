"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetPlugin = void 0;
const lisk_api_client_1 = require("@liskhq/lisk-api-client");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const axios_1 = require("axios");
const lisk_framework_1 = require("lisk-framework");
const express = require("express");
const path_1 = require("path");
const defaults = require("./defaults");
const packageJSON = require('../../package.json');
const authorizeParamsSchema = {
    $id: 'lisk/faucet/auth',
    type: 'object',
    required: ['password', 'enable'],
    properties: {
        password: {
            type: 'string',
        },
        enable: {
            type: 'boolean',
        },
    },
};
const fundParamsSchema = {
    $id: 'lisk/faucet/fund',
    type: 'object',
    required: ['address'],
    properties: {
        address: {
            type: 'string',
            format: 'hex',
        },
        token: {
            type: 'string',
        },
    },
};
class FaucetPlugin extends lisk_framework_1.BasePlugin {
    constructor() {
        super(...arguments);
        this._state = { publicKey: undefined, passphrase: undefined };
    }
    static get alias() {
        return 'faucet';
    }
    static get info() {
        return {
            author: packageJSON.author,
            version: packageJSON.version,
            name: packageJSON.name,
        };
    }
    get defaults() {
        return defaults.config;
    }
    get events() {
        return [];
    }
    get actions() {
        return {
            authorize: (params) => {
                const errors = lisk_validator_1.validator.validate(authorizeParamsSchema, params);
                if (errors.length) {
                    throw new lisk_validator_1.LiskValidationError([...errors]);
                }
                if (!this._options.encryptedPassphrase ||
                    typeof this._options.encryptedPassphrase !== 'string') {
                    throw new Error('Encrypted passphrase string must be set in the config.');
                }
                const { enable, password } = params;
                try {
                    const parsedEncryptedPassphrase = lisk_cryptography_1.parseEncryptedPassphrase(this._options.encryptedPassphrase);
                    const passphrase = lisk_cryptography_1.decryptPassphraseWithPassword(parsedEncryptedPassphrase, password);
                    const { publicKey } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase);
                    this._state.publicKey = enable ? publicKey : undefined;
                    this._state.passphrase = enable ? passphrase : undefined;
                    const changedState = enable ? 'enabled' : 'disabled';
                    return {
                        result: `Successfully ${changedState} the faucet.`,
                    };
                }
                catch (error) {
                    throw new Error('Password given is not valid.');
                }
            },
            fundTokens: async (params) => {
                var _a;
                const errors = lisk_validator_1.validator.validate(fundParamsSchema, params);
                const { address, token } = params;
                if (errors.length) {
                    throw new lisk_validator_1.LiskValidationError([...errors]);
                }
                if (!this._state.publicKey || !this._state.passphrase) {
                    throw new Error('Faucet is not enabled.');
                }
                const captchaResult = await axios_1.default({
                    method: 'post',
                    url: 'https://www.google.com/recaptcha/api/siteverify',
                    params: {
                        secret: this.options.captchaSecretkey,
                        response: token,
                    },
                });
                if (!((_a = captchaResult === null || captchaResult === void 0 ? void 0 : captchaResult.data) === null || _a === void 0 ? void 0 : _a.success)) {
                    throw new Error('Captcha response was invalid.');
                }
                await this._transferFunds(address);
                return {
                    result: `Successfully funded account at address: ${address}.`,
                };
            },
        };
    }
    async load(channel) {
        this._channel = channel;
        this._client = await lisk_api_client_1.createClient(this._channel);
        this._options = lisk_utils_1.objects.mergeDeep({}, defaults.config.default, this.options);
        const app = express();
        app.get('/api/config', (_req, res) => {
            const config = {
                applicationUrl: this._options.applicationUrl,
                amount: this._options.amount,
                tokenPrefix: this._options.tokenPrefix,
                captchaSitekey: this._options.captchaSitekey,
                logoURL: this._options.logoURL,
                faucetAddress: this._state.publicKey
                    ? lisk_cryptography_1.getLisk32AddressFromPublicKey(this._state.publicKey)
                    : undefined,
            };
            res.json(config);
        });
        app.use(express.static(path_1.join(__dirname, '../../build')));
        this._server = app.listen(this._options.port, this._options.host);
    }
    async unload() {
        return new Promise((resolve, reject) => {
            this._server.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    async _transferFunds(address) {
        const transferTransactionAsset = {
            amount: BigInt(lisk_transactions_1.convertLSKToBeddows(this._options.amount)),
            recipientAddress: Buffer.from(address, 'hex'),
            data: '',
        };
        const transaction = await this._client.transaction.create({
            moduleID: 2,
            assetID: 0,
            senderPublicKey: this._state.publicKey,
            fee: BigInt(lisk_transactions_1.convertLSKToBeddows(this._options.fee)),
            asset: transferTransactionAsset,
        }, this._state.passphrase);
        await this._client.transaction.send(transaction);
    }
}
exports.FaucetPlugin = FaucetPlugin;
//# sourceMappingURL=faucet_plugin.js.map