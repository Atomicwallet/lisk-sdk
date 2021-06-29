"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePluginSpec = exports.getPluginExportPath = exports.BasePlugin = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const assert = require("assert");
const path_1 = require("path");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const logger_1 = require("../logger");
const system_dirs_1 = require("../system_dirs");
const decodeTransactionToJSON = (transactionBuffer, baseSchema, assetsSchemas) => {
    const baseTransaction = lisk_codec_1.codec.decodeJSON(baseSchema, transactionBuffer);
    const transactionTypeAsset = assetsSchemas.find(s => s.assetID === baseTransaction.assetID && s.moduleID === baseTransaction.moduleID);
    if (!transactionTypeAsset) {
        throw new Error('Transaction type not found.');
    }
    const transactionAsset = lisk_codec_1.codec.decodeJSON(transactionTypeAsset.schema, Buffer.from(baseTransaction.asset, 'hex'));
    return {
        ...baseTransaction,
        id: lisk_cryptography_1.hash(transactionBuffer).toString('hex'),
        asset: transactionAsset,
    };
};
const encodeTransactionFromJSON = (transaction, baseSchema, assetsSchemas) => {
    const transactionTypeAsset = assetsSchemas.find(s => s.assetID === transaction.assetID && s.moduleID === transaction.moduleID);
    if (!transactionTypeAsset) {
        throw new Error('Transaction type not found.');
    }
    const transactionAssetBuffer = lisk_codec_1.codec.encode(transactionTypeAsset.schema, lisk_codec_1.codec.fromJSON(transactionTypeAsset.schema, transaction.asset));
    const transactionBuffer = lisk_codec_1.codec.encode(baseSchema, lisk_codec_1.codec.fromJSON(baseSchema, {
        ...transaction,
        asset: transactionAssetBuffer,
    }));
    return transactionBuffer.toString('hex');
};
const decodeAccountToJSON = (encodedAccount, accountSchema) => {
    const decodedAccount = lisk_codec_1.codec.decodeJSON(accountSchema, encodedAccount);
    return {
        ...decodedAccount,
    };
};
const decodeRawBlock = (blockSchema, encodedBlock) => lisk_codec_1.codec.decode(blockSchema, encodedBlock);
const decodeBlockToJSON = (registeredSchema, encodedBlock) => {
    const { header, payload } = lisk_codec_1.codec.decode(registeredSchema.block, encodedBlock);
    const baseHeaderJSON = lisk_codec_1.codec.decodeJSON(registeredSchema.blockHeader, header);
    const blockAssetJSON = lisk_codec_1.codec.decodeJSON(registeredSchema.blockHeadersAssets[baseHeaderJSON.version], Buffer.from(baseHeaderJSON.asset, 'hex'));
    const payloadJSON = payload.map(transactionBuffer => decodeTransactionToJSON(transactionBuffer, registeredSchema.transaction, registeredSchema.transactionsAssets));
    const blockId = lisk_cryptography_1.hash(header);
    return {
        header: { ...baseHeaderJSON, asset: { ...blockAssetJSON }, id: blockId.toString('hex') },
        payload: payloadJSON,
    };
};
class BasePlugin {
    constructor(options) {
        var _a;
        if (this.defaults) {
            this.options = lisk_utils_1.objects.mergeDeep({}, (_a = this.defaults.default) !== null && _a !== void 0 ? _a : {}, options);
            const errors = lisk_validator_1.validator.validate(this.defaults, this.options);
            if (errors.length) {
                throw new lisk_validator_1.LiskValidationError([...errors]);
            }
        }
        else {
            this.options = lisk_utils_1.objects.cloneDeep(options);
        }
        this.codec = {
            decodeAccount: (data) => {
                const accountBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
                return decodeAccountToJSON(accountBuffer, this.schemas.account);
            },
            decodeBlock: (data) => {
                const blockBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
                return decodeBlockToJSON(this.schemas, blockBuffer);
            },
            decodeRawBlock: (data) => {
                const blockBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
                return decodeRawBlock(this.schemas.block, blockBuffer);
            },
            decodeTransaction: (data) => {
                const transactionBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
                return decodeTransactionToJSON(transactionBuffer, this.schemas.transaction, this.schemas.transactionsAssets);
            },
            encodeTransaction: (transaction) => encodeTransactionFromJSON(transaction, this.schemas.transaction, this.schemas.transactionsAssets),
        };
    }
    async init(channel) {
        const dirs = system_dirs_1.systemDirs(this.options.appConfig.label, this.options.appConfig.rootPath);
        this._logger = logger_1.createLogger({
            consoleLogLevel: this.options.appConfig.logger.consoleLogLevel,
            fileLogLevel: this.options.appConfig.logger.fileLogLevel,
            logFilePath: path_1.join(dirs.logs, `plugin-${this.constructor.alias}.log`),
            module: `plugin:${this.constructor.alias}`,
        });
        channel.once(constants_1.APP_EVENT_READY, async () => {
            this.schemas = await channel.invoke('app:getSchema');
        });
    }
    static get alias() {
        throw new errors_1.ImplementationMissingError();
    }
    static get info() {
        throw new errors_1.ImplementationMissingError();
    }
    get defaults() {
        return undefined;
    }
}
exports.BasePlugin = BasePlugin;
const getPluginExportPath = (pluginKlass, strict = true) => {
    let nodeModule;
    let nodeModulePath;
    try {
        nodeModule = require(pluginKlass.info.name);
        nodeModulePath = pluginKlass.info.name;
    }
    catch (error) {
    }
    if (!nodeModule && pluginKlass.info.exportPath) {
        try {
            nodeModule = require(pluginKlass.info.exportPath);
            nodeModulePath = pluginKlass.info.exportPath;
        }
        catch (error) {
        }
    }
    if (!nodeModule || !nodeModule[pluginKlass.name]) {
        return;
    }
    if (strict && nodeModule[pluginKlass.name] !== pluginKlass) {
        return;
    }
    return nodeModulePath;
};
exports.getPluginExportPath = getPluginExportPath;
const validatePluginSpec = (PluginKlass, options = {}) => {
    const pluginObject = new PluginKlass(options);
    assert(PluginKlass.alias, 'Plugin alias is required.');
    assert(PluginKlass.info.name, 'Plugin name is required.');
    assert(PluginKlass.info.author, 'Plugin author is required.');
    assert(PluginKlass.info.version, 'Plugin version is required.');
    assert(pluginObject.events, 'Plugin events are required.');
    assert(pluginObject.actions, 'Plugin actions are required.');
    assert(pluginObject.load, 'Plugin load action is required.');
    assert(pluginObject.unload, 'Plugin unload actions is required.');
    if (pluginObject.defaults) {
        const errors = lisk_validator_1.validator.validateSchema(pluginObject.defaults);
        if (errors.length) {
            throw new lisk_validator_1.LiskValidationError([...errors]);
        }
    }
};
exports.validatePluginSpec = validatePluginSpec;
//# sourceMappingURL=base_plugin.js.map