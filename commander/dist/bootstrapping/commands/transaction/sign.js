"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignCommand = void 0;
const command_1 = require("@oclif/command");
const cryptography = require("@liskhq/lisk-cryptography");
const transactions = require("@liskhq/lisk-transactions");
const flags_1 = require("../../../utils/flags");
const reader_1 = require("../../../utils/reader");
const transaction_1 = require("../../../utils/transaction");
const path_1 = require("../../../utils/path");
const application_1 = require("../../../utils/application");
const signTransaction = async (flags, registeredSchema, transactionHexStr, networkIdentifier, keys) => {
    var _a;
    const transactionObject = transaction_1.decodeTransaction(registeredSchema, transactionHexStr);
    const assetSchema = transaction_1.getAssetSchema(registeredSchema, transactionObject.moduleID, transactionObject.assetID);
    const networkIdentifierBuffer = Buffer.from(networkIdentifier, 'hex');
    const passphrase = (_a = flags.passphrase) !== null && _a !== void 0 ? _a : (await reader_1.getPassphraseFromPrompt('passphrase', true));
    if (!flags['include-sender'] && !flags['sender-public-key']) {
        return transactions.signTransaction(assetSchema, transactionObject, networkIdentifierBuffer, passphrase);
    }
    return transactions.signMultiSignatureTransaction(assetSchema, transactionObject, networkIdentifierBuffer, passphrase, keys, flags['include-sender']);
};
const signTransactionOffline = async (flags, registeredSchema, transactionHexStr) => {
    let signedTransaction;
    if (!flags['include-sender'] && !flags['sender-public-key']) {
        signedTransaction = await signTransaction(flags, registeredSchema, transactionHexStr, flags['network-identifier'], {});
        return signedTransaction;
    }
    const mandatoryKeys = flags['mandatory-keys'];
    const optionalKeys = flags['optional-keys'];
    if (!mandatoryKeys.length && !optionalKeys.length) {
        throw new Error('--mandatory-keys or --optional-keys flag must be specified to sign transaction from multi signature account.');
    }
    const keys = {
        mandatoryKeys: mandatoryKeys ? mandatoryKeys.map(k => Buffer.from(k, 'hex')) : [],
        optionalKeys: optionalKeys ? optionalKeys.map(k => Buffer.from(k, 'hex')) : [],
    };
    signedTransaction = await signTransaction(flags, registeredSchema, transactionHexStr, flags['network-identifier'], keys);
    return signedTransaction;
};
const signTransactionOnline = async (flags, client, registeredSchema, transactionHexStr) => {
    var _a, _b, _c;
    const transactionObject = transaction_1.decodeTransaction(registeredSchema, transactionHexStr);
    const passphrase = (_a = flags.passphrase) !== null && _a !== void 0 ? _a : (await reader_1.getPassphraseFromPrompt('passphrase', true));
    const address = cryptography.getAddressFromPassphrase(passphrase);
    let signedTransaction;
    if (!flags['include-sender']) {
        signedTransaction = await client.transaction.sign(transactionObject, [passphrase]);
        return signedTransaction;
    }
    const account = (await client.account.get(address));
    let keysAsset;
    if (((_b = account.keys) === null || _b === void 0 ? void 0 : _b.mandatoryKeys.length) === 0 && ((_c = account.keys) === null || _c === void 0 ? void 0 : _c.optionalKeys.length) === 0) {
        keysAsset = transactionObject.asset;
    }
    else {
        keysAsset = account.keys;
    }
    const keys = {
        mandatoryKeys: keysAsset.mandatoryKeys.map(k => Buffer.from(k, 'hex')),
        optionalKeys: keysAsset.optionalKeys.map(k => Buffer.from(k, 'hex')),
    };
    signedTransaction = await client.transaction.sign(transactionObject, [passphrase], {
        includeSenderSignature: flags['include-sender'],
        multisignatureKeys: keys,
    });
    return signedTransaction;
};
class SignCommand extends command_1.default {
    async run() {
        const { args: { transaction }, flags, } = this.parse(SignCommand);
        const { offline, 'data-path': dataPath } = flags;
        this._dataPath = dataPath !== null && dataPath !== void 0 ? dataPath : path_1.getDefaultPath(this.config.pjson.name);
        let signedTransaction;
        if (offline) {
            const app = this.getApplication({}, {});
            this._schema = app.getSchema();
            signedTransaction = await signTransactionOffline(flags, this._schema, transaction);
        }
        else {
            this._client = await transaction_1.getApiClient(dataPath, this.config.pjson.name);
            this._schema = this._client.schemas;
            signedTransaction = await signTransactionOnline(flags, this._client, this._schema, transaction);
        }
        if (flags.json) {
            this.printJSON(flags.pretty, {
                transaction: transaction_1.encodeTransaction(this._schema, signedTransaction, this._client).toString('hex'),
            });
            this.printJSON(flags.pretty, {
                transaction: transaction_1.transactionToJSON(this._schema, signedTransaction, this._client),
            });
        }
        else {
            this.printJSON(flags.pretty, {
                transaction: transaction_1.encodeTransaction(this._schema, signedTransaction, this._client).toString('hex'),
            });
        }
    }
    printJSON(pretty, message) {
        if (pretty) {
            this.log(JSON.stringify(message, undefined, '  '));
        }
        else {
            this.log(JSON.stringify(message));
        }
    }
    async finally(error) {
        if (error) {
            if (!application_1.isApplicationRunning(this._dataPath)) {
                throw new Error(`Application at data path ${this._dataPath} is not running.`);
            }
            this.error(error instanceof Error ? error.message : error);
        }
        if (this._client) {
            await this._client.disconnect();
        }
    }
}
exports.SignCommand = SignCommand;
SignCommand.description = 'Sign encoded transaction.';
SignCommand.args = [
    {
        name: 'transaction',
        required: true,
        description: 'The transaction to be signed encoded as hex string',
    },
];
SignCommand.flags = {
    passphrase: flags_1.flagsWithParser.passphrase,
    json: flags_1.flagsWithParser.json,
    offline: {
        ...flags_1.flagsWithParser.offline,
        dependsOn: ['network-identifier'],
        exclusive: ['data-path'],
    },
    'include-sender': command_1.flags.boolean({
        description: 'Include sender signature in transaction.',
        default: false,
    }),
    'mandatory-keys': command_1.flags.string({
        multiple: true,
        description: 'Mandatory publicKey string in hex format.',
    }),
    'optional-keys': command_1.flags.string({
        multiple: true,
        description: 'Optional publicKey string in hex format.',
    }),
    'network-identifier': flags_1.flagsWithParser.networkIdentifier,
    'sender-public-key': flags_1.flagsWithParser.senderPublicKey,
    'data-path': flags_1.flagsWithParser.dataPath,
    pretty: flags_1.flagsWithParser.pretty,
};
SignCommand.examples = [
    'transaction:sign <hex-encoded-binary-transaction>',
    'transaction:sign <hex-encoded-binary-transaction> --network testnet',
];
//# sourceMappingURL=sign.js.map