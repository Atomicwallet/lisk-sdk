"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeysModule = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const utils_1 = require("./utils");
const base_module_1 = require("../base_module");
const register_asset_1 = require("./register_asset");
const schemas_1 = require("./schemas");
const { bufferArrayOrderByLex, bufferArrayUniqueItems, bufferArrayContainsSome } = lisk_utils_1.objects;
class KeysModule extends base_module_1.BaseModule {
    constructor() {
        super(...arguments);
        this.name = 'keys';
        this.id = 4;
        this.accountSchema = {
            type: 'object',
            properties: {
                numberOfSignatures: { dataType: 'uint32', fieldNumber: 1 },
                mandatoryKeys: {
                    type: 'array',
                    items: { dataType: 'bytes' },
                    fieldNumber: 2,
                },
                optionalKeys: {
                    type: 'array',
                    items: { dataType: 'bytes' },
                    fieldNumber: 3,
                },
            },
            default: {
                mandatoryKeys: [],
                optionalKeys: [],
                numberOfSignatures: 0,
            },
        };
        this.transactionAssets = [new register_asset_1.RegisterAsset()];
    }
    async beforeTransactionApply({ stateStore, transaction, }) {
        const sender = await stateStore.account.get(transaction.senderAddress);
        const { networkIdentifier } = stateStore.chain;
        const transactionBytes = transaction.getSigningBytes();
        if (transaction.moduleID === this.id && transaction.assetID === register_asset_1.RegisterAssetID) {
            const { mandatoryKeys, optionalKeys } = lisk_codec_1.codec.decode(schemas_1.keysSchema, transaction.asset);
            const numberOfExpectedKeys = mandatoryKeys.length + optionalKeys.length + 1;
            if (numberOfExpectedKeys !== transaction.signatures.length) {
                throw new Error(`There are missing signatures. Expected: ${numberOfExpectedKeys} signatures but got: ${transaction.signatures.length}.`);
            }
            if (!transaction.signatures.every(signature => signature.length > 0)) {
                throw new Error('A valid signature is required for each registered key.');
            }
            utils_1.validateSignature(lisk_chain_1.TAG_TRANSACTION, networkIdentifier, transaction.senderPublicKey, transaction.signatures[0], transactionBytes, transaction.id);
            utils_1.validateKeysSignatures(lisk_chain_1.TAG_TRANSACTION, networkIdentifier, mandatoryKeys, transaction.signatures.slice(1, mandatoryKeys.length + 1), transactionBytes, transaction.id);
            utils_1.validateKeysSignatures(lisk_chain_1.TAG_TRANSACTION, networkIdentifier, optionalKeys, transaction.signatures.slice(mandatoryKeys.length + 1), transactionBytes, transaction.id);
            return;
        }
        if (!utils_1.isMultisignatureAccount(sender)) {
            if (transaction.signatures.length !== 1) {
                throw new Error(`Transactions from a single signature account should have exactly one signature. Found ${transaction.signatures.length} signatures.`);
            }
            utils_1.validateSignature(lisk_chain_1.TAG_TRANSACTION, networkIdentifier, transaction.senderPublicKey, transaction.signatures[0], transactionBytes, transaction.id);
            return;
        }
        utils_1.verifyMultiSignatureTransaction(lisk_chain_1.TAG_TRANSACTION, networkIdentifier, transaction.id, sender, transaction.signatures, transactionBytes);
    }
    async afterGenesisBlockApply({ genesisBlock, }) {
        const errors = [];
        const accountsLength = genesisBlock.header.asset.accounts.length;
        for (let index = 0; index < accountsLength; index += 1) {
            const account = genesisBlock.header.asset.accounts[index];
            if (!bufferArrayOrderByLex(account.keys.mandatoryKeys)) {
                errors.push({
                    message: 'should be lexicographically ordered',
                    keyword: 'mandatoryKeys',
                    dataPath: `.accounts[${index}].keys.mandatoryKeys`,
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/mandatoryKeys',
                    params: { keys: account.keys, address: account.address },
                });
            }
            if (!bufferArrayUniqueItems(account.keys.mandatoryKeys)) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.mandatoryKeys`,
                    keyword: 'uniqueItems',
                    message: 'must NOT have duplicate items',
                    params: { keys: account.keys, address: account.address },
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/mandatoryKeys/uniqueItems',
                });
            }
            if (!bufferArrayOrderByLex(account.keys.optionalKeys)) {
                errors.push({
                    message: 'should be lexicographically ordered',
                    keyword: 'optionalKeys',
                    dataPath: `.accounts[${index}].keys.optionalKeys`,
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/optionalKeys',
                    params: { keys: account.keys, address: account.address },
                });
            }
            if (!bufferArrayUniqueItems(account.keys.optionalKeys)) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.optionalKeys`,
                    keyword: 'uniqueItems',
                    message: 'must NOT have duplicate items',
                    params: { keys: account.keys, address: account.address },
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/optionalKeys/uniqueItems',
                });
            }
            if (bufferArrayContainsSome(account.keys.mandatoryKeys, account.keys.optionalKeys)) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.mandatoryKeys, .accounts[${index}].keys.optionalKeys`,
                    keyword: 'uniqueItems',
                    message: 'must NOT have duplicate items among mandatoryKeys and optionalKeys',
                    params: { keys: account.keys, address: account.address },
                    schemaPath: '#/properties/accounts/items/properties/keys',
                });
            }
            if (account.keys.mandatoryKeys.length + account.keys.optionalKeys.length > 64) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.mandatoryKeys, .accounts[${index}].keys.optionalKeys`,
                    keyword: 'maxItems',
                    message: 'should not have more than 64 keys',
                    params: { keys: account.keys, address: account.address, maxItems: 64 },
                    schemaPath: '#/properties/accounts/items/properties/keys',
                });
            }
            if (account.keys.numberOfSignatures < account.keys.mandatoryKeys.length) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.numberOfSignatures`,
                    keyword: 'min',
                    message: 'should be minimum of length of mandatoryKeys',
                    params: {
                        keys: account.keys,
                        address: account.address,
                        min: account.keys.mandatoryKeys.length,
                    },
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/numberOfSignatures',
                });
            }
            if (account.keys.numberOfSignatures >
                account.keys.mandatoryKeys.length + account.keys.optionalKeys.length) {
                errors.push({
                    dataPath: `.accounts[${index}].keys.numberOfSignatures`,
                    keyword: 'max',
                    message: 'should be maximum of length of mandatoryKeys and optionalKeys',
                    params: {
                        keys: account.keys,
                        address: account.address,
                        max: account.keys.mandatoryKeys.length + account.keys.optionalKeys.length,
                    },
                    schemaPath: '#/properties/accounts/items/properties/keys/properties/numberOfSignatures',
                });
            }
        }
        if (errors.length) {
            throw new lisk_validator_1.LiskValidationError(errors);
        }
    }
}
exports.KeysModule = KeysModule;
//# sourceMappingURL=keys_module.js.map