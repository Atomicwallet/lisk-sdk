"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const codec_1 = require("./codec");
class Transaction {
    constructor(channel, registeredSchema, nodeInfo) {
        this._channel = channel;
        this._schema = registeredSchema;
        this._nodeInfo = nodeInfo;
    }
    async create(input, passphrase, options) {
        var _a;
        const txInput = input;
        const networkIdentifier = Buffer.from(this._nodeInfo.networkIdentifier, 'hex');
        const { publicKey, address } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase);
        const accountHex = await this._channel.invoke('app:getAccount', {
            address: address.toString('hex'),
        });
        const account = codec_1.decodeAccount(Buffer.from(accountHex, 'hex'), this._schema);
        if (!txInput.moduleID) {
            if (!txInput.moduleName) {
                throw new Error('Missing moduleID and moduleName');
            }
            const registeredModule = this._nodeInfo.registeredModules.find(module => module.name === input.moduleName);
            if (!registeredModule) {
                throw new Error(`Module corresponding to name ${txInput.moduleName} not registered.`);
            }
            txInput.moduleID = registeredModule.id;
        }
        if (typeof txInput.assetID !== 'number') {
            if (!txInput.assetName) {
                throw new Error('Missing assetID and assetName');
            }
            const registeredModule = this._nodeInfo.registeredModules.find(m => m.id === txInput.moduleID);
            if (!registeredModule) {
                throw new Error(`Module corresponding to id ${txInput.moduleID} not registered.`);
            }
            const registeredAsset = registeredModule.transactionAssets.find(asset => asset.name === txInput.assetName);
            if (!registeredAsset) {
                throw new Error(`Asset corresponding to name ${txInput.assetName} not registered.`);
            }
            txInput.assetID = registeredAsset.id;
        }
        if (typeof txInput.nonce !== 'bigint') {
            if (typeof account.sequence !== 'object' ||
                typeof account.sequence.nonce !== 'bigint') {
                throw new Error('Unsupported account type');
            }
            txInput.nonce = account.sequence.nonce;
        }
        if (txInput.nonce < BigInt(0)) {
            throw new Error('Nonce must be greater or equal to zero');
        }
        if (!txInput.senderPublicKey) {
            txInput.senderPublicKey = publicKey;
        }
        txInput.signatures = (_a = txInput.signatures) !== null && _a !== void 0 ? _a : [];
        const assetSchema = codec_1.getTransactionAssetSchema(txInput, this._schema);
        if (account.keys && account.keys.numberOfSignatures > 0) {
            return lisk_transactions_1.signMultiSignatureTransaction(assetSchema, txInput, networkIdentifier, passphrase, account.keys, options === null || options === void 0 ? void 0 : options.includeSenderSignature);
        }
        if ((options === null || options === void 0 ? void 0 : options.multisignatureKeys) && (options === null || options === void 0 ? void 0 : options.includeSenderSignature)) {
            return lisk_transactions_1.signMultiSignatureTransaction(assetSchema, txInput, networkIdentifier, passphrase, options.multisignatureKeys, options.includeSenderSignature);
        }
        return lisk_transactions_1.signTransaction(assetSchema, txInput, networkIdentifier, passphrase);
    }
    async get(id) {
        const idString = Buffer.isBuffer(id) ? id.toString('hex') : id;
        const transactionHex = await this._channel.invoke('app:getTransactionByID', {
            id: idString,
        });
        return codec_1.decodeTransaction(Buffer.from(transactionHex, 'hex'), this._schema);
    }
    async getFromPool() {
        const transactionsHex = await this._channel.invoke('app:getTransactionsFromPool');
        const decodedTransactions = [];
        for (const transactionHex of transactionsHex) {
            decodedTransactions.push(codec_1.decodeTransaction(Buffer.from(transactionHex, 'hex'), this._schema));
        }
        return decodedTransactions;
    }
    async sign(transaction, passphrases, options) {
        const assetSchema = codec_1.getTransactionAssetSchema(transaction, this._schema);
        const networkIdentifier = Buffer.from(this._nodeInfo.networkIdentifier, 'hex');
        const address = lisk_cryptography_1.getAddressFromPublicKey(transaction.senderPublicKey);
        const accountHex = await this._channel.invoke('app:getAccount', {
            address: address.toString('hex'),
        });
        const account = codec_1.decodeAccount(Buffer.from(accountHex, 'hex'), this._schema);
        if (account.keys && account.keys.numberOfSignatures > 0) {
            for (const passphrase of passphrases) {
                lisk_transactions_1.signMultiSignatureTransaction(assetSchema, transaction, networkIdentifier, passphrase, account.keys, options === null || options === void 0 ? void 0 : options.includeSenderSignature);
            }
            return transaction;
        }
        if ((options === null || options === void 0 ? void 0 : options.multisignatureKeys) && (options === null || options === void 0 ? void 0 : options.includeSenderSignature)) {
            for (const passphrase of passphrases) {
                lisk_transactions_1.signMultiSignatureTransaction(assetSchema, transaction, networkIdentifier, passphrase, options.multisignatureKeys, options.includeSenderSignature);
            }
            return transaction;
        }
        return lisk_transactions_1.signTransaction(assetSchema, transaction, networkIdentifier, passphrases[0]);
    }
    async send(transaction) {
        const encodedTx = codec_1.encodeTransaction(transaction, this._schema);
        return this._channel.invoke('app:postTransaction', { transaction: encodedTx.toString('hex') });
    }
    decode(transaction) {
        const transactionBuffer = Buffer.isBuffer(transaction)
            ? transaction
            : Buffer.from(transaction, 'hex');
        return codec_1.decodeTransaction(transactionBuffer, this._schema);
    }
    encode(transaction) {
        return codec_1.encodeTransaction(transaction, this._schema);
    }
    computeMinFee(transaction) {
        const assetSchema = codec_1.getTransactionAssetSchema(transaction, this._schema);
        const numberOfSignatures = transaction.signatures
            ? transaction.signatures.length
            : 1;
        const options = {
            minFeePerByte: this._nodeInfo.genesisConfig.minFeePerByte,
            baseFees: this._nodeInfo.genesisConfig.baseFees,
            numberOfSignatures,
        };
        return lisk_transactions_1.computeMinFee(assetSchema, transaction, options);
    }
    toJSON(transaction) {
        const { asset: txAsset, ...txRoot } = transaction;
        const tmpId = txRoot.id;
        delete txRoot.id;
        const schemaAsset = codec_1.getTransactionAssetSchema(txRoot, this._schema);
        const jsonTxAsset = lisk_codec_1.codec.toJSON(schemaAsset, txAsset);
        const jsonTxRoot = lisk_codec_1.codec.toJSON(this._schema.transaction, txRoot);
        const jsonTx = {
            ...jsonTxRoot,
            asset: jsonTxAsset,
            id: Buffer.isBuffer(tmpId) ? tmpId.toString('hex') : tmpId,
        };
        return jsonTx;
    }
    fromJSON(transaction) {
        const { asset: txAsset, ...txRoot } = transaction;
        const tmpId = txRoot.id;
        delete txRoot.id;
        const schemaAsset = codec_1.getTransactionAssetSchema(txRoot, this._schema);
        const txAssetObject = lisk_codec_1.codec.fromJSON(schemaAsset, txAsset);
        const txRootObject = lisk_codec_1.codec.fromJSON(this._schema.transaction, txRoot);
        const txObject = {
            ...txRootObject,
            asset: txAssetObject,
            id: typeof tmpId === 'string' ? Buffer.from(tmpId, 'hex') : Buffer.alloc(0),
        };
        return txObject;
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map