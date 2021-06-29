"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMisbehaviorPlugin = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_framework_1 = require("lisk-framework");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const db_1 = require("./db");
const config = require("./defaults");
const schema_1 = require("./schema");
const packageJSON = require('../package.json');
const actionParamsSchema = {
    $id: 'lisk/report_misbehavior/auth',
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
class ReportMisbehaviorPlugin extends lisk_framework_1.BasePlugin {
    constructor() {
        super(...arguments);
        this._state = { currentHeight: 0 };
    }
    static get alias() {
        return 'reportMisbehavior';
    }
    static get info() {
        return {
            author: packageJSON.author,
            version: packageJSON.version,
            name: packageJSON.name,
        };
    }
    get defaults() {
        return config.defaultConfig;
    }
    get events() {
        return [];
    }
    get actions() {
        return {
            authorize: (params) => {
                const errors = lisk_validator_1.validator.validate(actionParamsSchema, params);
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
                        result: `Successfully ${changedState} the reporting of misbehavior.`,
                    };
                }
                catch (error) {
                    throw new Error('Password given is not valid.');
                }
            },
        };
    }
    async load(channel) {
        this._channel = channel;
        this._options = lisk_utils_1.objects.mergeDeep({}, config.defaultConfig.default, this.options);
        this._clearBlockHeadersInterval = this._options.clearBlockHeadersInterval || 60000;
        this._pluginDB = await db_1.getDBInstance(this._options.dataPath);
        this._subscribeToChannel();
        this._clearBlockHeadersIntervalId = setInterval(() => {
            db_1.clearBlockHeaders(this._pluginDB, this.schemas, this._state.currentHeight).catch(error => this._logger.error(error));
        }, this._clearBlockHeadersInterval);
    }
    async unload() {
        clearInterval(this._clearBlockHeadersIntervalId);
        await this._pluginDB.close();
    }
    _subscribeToChannel() {
        this._channel.subscribe('app:network:event', async (eventData) => {
            const { event, data } = eventData;
            if (event === 'postBlock') {
                const errors = lisk_validator_1.validator.validate(schema_1.postBlockEventSchema, data);
                if (errors.length > 0) {
                    this._logger.error(errors, 'Invalid block data');
                    return;
                }
                const blockData = data;
                const { header } = lisk_codec_1.codec.decode(this.schemas.block, Buffer.from(blockData.block, 'hex'));
                try {
                    const saved = await db_1.saveBlockHeaders(this._pluginDB, this.schemas, header);
                    if (!saved) {
                        return;
                    }
                    const decodedBlockHeader = db_1.decodeBlockHeader(header, this.schemas);
                    if (decodedBlockHeader.height > this._state.currentHeight) {
                        this._state.currentHeight = decodedBlockHeader.height;
                    }
                    const contradictingBlock = await db_1.getContradictingBlockHeader(this._pluginDB, decodedBlockHeader, this.schemas);
                    if (contradictingBlock && this._state.passphrase) {
                        const encodedTransaction = await this._createPoMTransaction(decodedBlockHeader, contradictingBlock);
                        const result = await this._channel.invoke('app:postTransaction', {
                            transaction: encodedTransaction,
                        });
                        this._logger.debug('Sent Report misbehavior transaction', result.transactionId);
                    }
                }
                catch (error) {
                    this._logger.error(error);
                }
            }
        });
    }
    async _createPoMTransaction(contradictingBlock, decodedBlockHeader) {
        var _a;
        const pomAssetInfo = this.schemas.transactionsAssets.find(({ moduleID, assetID }) => moduleID === 5 && assetID === 3);
        if (!pomAssetInfo) {
            throw new Error('PoM asset schema is not registered in the application.');
        }
        const passphrase = this._state.passphrase;
        const encodedAccount = await this._channel.invoke('app:getAccount', {
            address: lisk_cryptography_1.getAddressFromPassphrase(passphrase).toString('hex'),
        });
        const { sequence: { nonce }, } = lisk_codec_1.codec.decode(this.schemas.account, Buffer.from(encodedAccount, 'hex'));
        const pomTransactionAsset = {
            header1: decodedBlockHeader,
            header2: contradictingBlock,
        };
        const { networkIdentifier } = await this._channel.invoke('app:getNodeInfo');
        const encodedAsset = lisk_codec_1.codec.encode(pomAssetInfo.schema, pomTransactionAsset);
        const tx = new lisk_chain_1.Transaction({
            moduleID: pomAssetInfo.moduleID,
            assetID: pomAssetInfo.assetID,
            nonce,
            senderPublicKey: (_a = this._state.publicKey) !== null && _a !== void 0 ? _a : lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase).publicKey,
            fee: BigInt(this._options.fee),
            asset: encodedAsset,
            signatures: [],
        });
        tx.signatures.push(lisk_cryptography_1.signData(lisk_chain_1.TAG_TRANSACTION, Buffer.from(networkIdentifier, 'hex'), tx.getSigningBytes(), passphrase));
        return tx.getBytes().toString('hex');
    }
}
exports.ReportMisbehaviorPlugin = ReportMisbehaviorPlugin;
//# sourceMappingURL=report_misbehavior_plugin.js.map