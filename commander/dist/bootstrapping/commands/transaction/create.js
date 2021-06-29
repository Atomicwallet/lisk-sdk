"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const cryptography = require("@liskhq/lisk-cryptography");
const transactions = require("@liskhq/lisk-transactions");
const validator = require("@liskhq/lisk-validator");
const command_1 = require("@oclif/command");
const flags_1 = require("../../../utils/flags");
const path_1 = require("../../../utils/path");
const reader_1 = require("../../../utils/reader");
const transaction_1 = require("../../../utils/transaction");
const isSequenceObject = (input, key) => {
    const value = input[key];
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return false;
    }
    const sequence = value;
    if (typeof sequence.nonce !== 'bigint') {
        return false;
    }
    return true;
};
const getAssetObject = async (registeredSchema, flags, args) => {
    const assetSchema = transaction_1.getAssetSchema(registeredSchema, args.moduleID, args.assetID);
    const rawAsset = flags.asset ? JSON.parse(flags.asset) : await reader_1.getAssetFromPrompt(assetSchema);
    const assetObject = lisk_codec_1.codec.fromJSON(assetSchema, rawAsset);
    const assetErrors = validator.validator.validate(assetSchema, assetObject);
    if (assetErrors.length) {
        throw new validator.LiskValidationError([...assetErrors]);
    }
    return assetObject;
};
const getPassphraseAddressAndPublicKey = async (flags) => {
    var _a;
    let passphrase;
    let publicKey;
    let address;
    if (flags['no-signature']) {
        publicKey = Buffer.from(flags['sender-public-key'], 'hex');
        address = cryptography.getAddressFromPublicKey(publicKey);
        passphrase = '';
    }
    else {
        passphrase = (_a = flags.passphrase) !== null && _a !== void 0 ? _a : (await reader_1.getPassphraseFromPrompt('passphrase', true));
        const result = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
        publicKey = result.publicKey;
        address = result.address;
    }
    return { address, passphrase, publicKey };
};
const validateAndSignTransaction = (transaction, schema, networkIdentifier, passphrase, noSignature) => {
    const { asset, ...transactionWithoutAsset } = transaction;
    const assetSchema = transaction_1.getAssetSchema(schema, transaction.moduleID, transaction.assetID);
    const transactionErrors = validator.validator.validate(schema.transaction, {
        ...transactionWithoutAsset,
        asset: Buffer.alloc(0),
    });
    if (transactionErrors.length) {
        throw new validator.LiskValidationError([...transactionErrors]);
    }
    if (!noSignature) {
        return transactions.signTransaction(assetSchema, transaction, Buffer.from(networkIdentifier, 'hex'), passphrase);
    }
    return transaction;
};
const createTransactionOffline = async (args, flags, registeredSchema, transaction) => {
    const asset = await getAssetObject(registeredSchema, flags, args);
    const { passphrase, publicKey } = await getPassphraseAddressAndPublicKey(flags);
    transaction.nonce = BigInt(flags.nonce);
    transaction.asset = asset;
    transaction.senderPublicKey =
        publicKey || Buffer.from(flags['sender-public-key'], 'hex');
    return validateAndSignTransaction(transaction, registeredSchema, flags['network-identifier'], passphrase, flags['no-signature']);
};
const createTransactionOnline = async (args, flags, client, registeredSchema, transaction) => {
    const nodeInfo = await client.node.getNodeInfo();
    const { address, passphrase, publicKey } = await getPassphraseAddressAndPublicKey(flags);
    const account = await client.account.get(address);
    const asset = await getAssetObject(registeredSchema, flags, args);
    if (flags['network-identifier'] && flags['network-identifier'] !== nodeInfo.networkIdentifier) {
        throw new Error(`Invalid networkIdentifier specified, actual: ${flags['network-identifier']}, expected: ${nodeInfo.networkIdentifier}.`);
    }
    if (!isSequenceObject(account, 'sequence')) {
        throw new Error('Account does not have sequence property.');
    }
    if (flags.nonce && BigInt(account.sequence.nonce) > BigInt(flags.nonce)) {
        throw new Error(`Invalid nonce specified, actual: ${flags.nonce}, expected: ${account.sequence.nonce.toString()}`);
    }
    transaction.nonce = flags.nonce ? BigInt(flags.nonce) : account.sequence.nonce;
    transaction.asset = asset;
    transaction.senderPublicKey =
        publicKey || Buffer.from(flags['sender-public-key'], 'hex');
    return validateAndSignTransaction(transaction, registeredSchema, nodeInfo.networkIdentifier, passphrase, flags['no-signature']);
};
class CreateCommand extends command_1.default {
    async run() {
        var _a;
        const { args, flags } = this.parse(CreateCommand);
        const incompleteTransaction = {
            moduleID: Number(args.moduleID),
            assetID: Number(args.assetID),
            fee: BigInt(args.fee),
            nonce: BigInt(0),
            senderPublicKey: Buffer.alloc(0),
            asset: {},
            signatures: [],
        };
        let transactionObject;
        this._dataPath = (_a = flags['data-path']) !== null && _a !== void 0 ? _a : path_1.getDefaultPath(this.config.pjson.name);
        if (flags.offline) {
            const app = this.getApplication({}, {});
            this._schema = app.getSchema();
            transactionObject = await createTransactionOffline(args, flags, this._schema, incompleteTransaction);
        }
        else {
            this._client = await transaction_1.getApiClient(this._dataPath, this.config.pjson.name);
            this._schema = this._client.schemas;
            transactionObject = await createTransactionOnline(args, flags, this._client, this._schema, incompleteTransaction);
        }
        if (flags.json) {
            this.printJSON(flags.pretty, {
                transaction: transaction_1.encodeTransaction(this._schema, transactionObject, this._client).toString('hex'),
            });
            this.printJSON(flags.pretty, {
                transaction: transaction_1.transactionToJSON(this._schema, transactionObject, this._client),
            });
        }
        else {
            this.printJSON(flags.pretty, {
                transaction: transaction_1.encodeTransaction(this._schema, transactionObject, this._client).toString('hex'),
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
    async finally() {
        if (this._client) {
            await this._client.disconnect();
        }
    }
}
exports.CreateCommand = CreateCommand;
CreateCommand.strict = false;
CreateCommand.description = 'Create transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!';
CreateCommand.args = [
    {
        name: 'moduleID',
        required: true,
        description: 'Registered transaction module id.',
    },
    {
        name: 'assetID',
        required: true,
        description: 'Registered transaction asset id.',
    },
    {
        name: 'fee',
        required: true,
        description: 'Transaction fee in Beddows.',
    },
];
CreateCommand.examples = [
    'transaction:create 2 0 100000000 --asset=\'{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}\'',
    'transaction:create 2 0 100000000 --asset=\'{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}\' --json',
    'transaction:create 2 0 100000000 --offline --network mainnet --network-identifier 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 --nonce 1 --asset=\'{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}\'',
];
CreateCommand.flags = {
    passphrase: flags_1.flagsWithParser.passphrase,
    asset: command_1.flags.string({
        char: 'a',
        description: 'Creates transaction with specific asset information',
    }),
    json: flags_1.flagsWithParser.json,
    offline: command_1.flags.boolean({
        ...flags_1.flagsWithParser.offline,
        dependsOn: ['network-identifier', 'nonce'],
        exclusive: ['data-path'],
    }),
    'no-signature': command_1.flags.boolean({
        description: 'Creates the transaction without a signature. Your passphrase will therefore not be required',
        dependsOn: ['sender-public-key'],
    }),
    'network-identifier': flags_1.flagsWithParser.networkIdentifier,
    nonce: command_1.flags.string({
        description: 'Nonce of the transaction.',
    }),
    'sender-public-key': command_1.flags.string({
        char: 's',
        description: 'Creates the transaction with provided sender publickey, when passphrase is not provided',
    }),
    'data-path': flags_1.flagsWithParser.dataPath,
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=create.js.map