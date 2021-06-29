"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const fs = require("fs-extra");
const path = require("path");
const psList = require("ps-list");
const assert = require("assert");
const util_1 = require("util");
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("./constants");
const base_plugin_1 = require("./plugins/base_plugin");
const system_dirs_1 = require("./system_dirs");
const controller_1 = require("./controller");
const schema_1 = require("./schema");
const node_1 = require("./node");
const logger_1 = require("./logger");
const errors_1 = require("./errors");
const modules_1 = require("./modules");
const MINIMUM_EXTERNAL_MODULE_ID = 1000;
const rm = util_1.promisify(fs.unlink);
const isPidRunning = async (pid) => psList().then(list => list.some(x => x.pid === pid));
const registerProcessHooks = (app) => {
    const handleShutdown = async (code, message) => {
        await app.shutdown(code, message);
    };
    process.title = `${app.config.label}(${app.config.version})`;
    process.on('uncaughtException', err => {
        app.logger.error({
            err,
        }, 'System error: uncaughtException');
        handleShutdown(1, err.message).catch((error) => app.logger.error({ error }));
    });
    process.on('unhandledRejection', err => {
        app.logger.fatal({
            err,
        }, 'System error: unhandledRejection');
        handleShutdown(1, err.message).catch((error) => app.logger.error({ error }));
    });
    process.once('SIGTERM', () => {
        handleShutdown(0, 'SIGTERM').catch((error) => app.logger.error({ error }));
    });
    process.once('SIGINT', () => {
        handleShutdown(0, 'SIGINT').catch((error) => app.logger.error({ error }));
    });
    process.once('exit', (code) => {
        handleShutdown(code, 'process.exit').catch((error) => app.logger.error({ error }));
    });
};
class Application {
    constructor(genesisBlock, config = {}) {
        var _a, _b;
        this._mutex = new lisk_utils_1.jobHandlers.Mutex();
        this._genesisBlock = genesisBlock;
        const appConfig = lisk_utils_1.objects.cloneDeep(schema_1.applicationConfigSchema.default);
        appConfig.label =
            (_a = config.label) !== null && _a !== void 0 ? _a : `lisk-${(_b = config.genesisConfig) === null || _b === void 0 ? void 0 : _b.communityIdentifier}`;
        const mergedConfig = lisk_utils_1.objects.mergeDeep({}, appConfig, config);
        const applicationConfigErrors = lisk_validator_1.validator.validate(schema_1.applicationConfigSchema, mergedConfig);
        if (applicationConfigErrors.length) {
            throw new lisk_validator_1.LiskValidationError(applicationConfigErrors);
        }
        this.config = mergedConfig;
        this._plugins = {};
        const { plugins, ...rootConfigs } = this.config;
        this._node = new node_1.Node({
            genesisBlockJSON: this._genesisBlock,
            options: rootConfigs,
        });
    }
    get networkIdentifier() {
        return this._node.networkIdentifier;
    }
    static getDefaultModules() {
        return [modules_1.TokenModule, modules_1.SequenceModule, modules_1.KeysModule, modules_1.DPoSModule];
    }
    static defaultApplication(genesisBlock, config = {}) {
        const application = new Application(genesisBlock, config);
        for (const Module of Application.getDefaultModules()) {
            application._registerModule(Module);
        }
        return application;
    }
    registerPlugin(pluginKlass, options = { loadAsChildProcess: false }) {
        var _a, _b;
        assert(pluginKlass, 'Plugin implementation is required');
        assert(typeof options === 'object', 'Plugin options must be provided or set to empty object.');
        const pluginAlias = (_a = options === null || options === void 0 ? void 0 : options.alias) !== null && _a !== void 0 ? _a : pluginKlass.alias;
        assert(!Object.keys(this._plugins).includes(pluginAlias), `A plugin with alias "${pluginAlias}" already registered.`);
        if (options.loadAsChildProcess) {
            if (!base_plugin_1.getPluginExportPath(pluginKlass)) {
                throw new Error(`Unable to register plugin "${pluginAlias}" to load as child process. \n -> To load plugin as child process it must be exported. \n -> You can specify npm package as "info.name". \n -> Or you can specify any static path as "info.exportPath". \n -> To fix this issue you can simply assign __filename to info.exportPath in your plugin.`);
            }
        }
        this.config.plugins[pluginAlias] = Object.assign((_b = this.config.plugins[pluginAlias]) !== null && _b !== void 0 ? _b : {}, options);
        base_plugin_1.validatePluginSpec(pluginKlass, this.config.plugins[pluginAlias]);
        this._plugins[pluginAlias] = pluginKlass;
    }
    overridePluginOptions(alias, options) {
        assert(Object.keys(this._plugins).includes(alias), `No plugin ${alias} is registered`);
        this.config.plugins[alias] = {
            ...this.config.plugins[alias],
            ...options,
        };
    }
    registerModule(Module) {
        this._registerModule(Module, true);
    }
    getSchema() {
        return this._node.getSchema();
    }
    getDefaultAccount() {
        return this._node.getDefaultAccount();
    }
    getRegisteredModules() {
        return this._node.getRegisteredModules();
    }
    async run() {
        Object.freeze(this._genesisBlock);
        Object.freeze(this.config);
        registerProcessHooks(this);
        await this._setupDirectories();
        this.logger = this._initLogger();
        this.logger.info(`Starting the app - ${this.config.label}`);
        this.logger.info('If you experience any type of error, please open an issue on Lisk GitHub: https://github.com/LiskHQ/lisk-sdk/issues');
        this.logger.info('Contribution guidelines can be found at Lisk-sdk: https://github.com/LiskHQ/lisk-sdk/blob/development/docs/CONTRIBUTING.md');
        this.logger.info(`Booting the application with Lisk Framework(${this.config.version})`);
        await this._validatePidFile();
        this._forgerDB = this._getDBInstance(this.config, 'forger.db');
        this._blockchainDB = this._getDBInstance(this.config, 'blockchain.db');
        this._nodeDB = this._getDBInstance(this.config, 'node.db');
        await this._mutex.runExclusive(async () => {
            this._channel = this._initChannel();
            this._controller = this._initController();
            await this._controller.load();
            await this._node.init({
                bus: this._controller.bus,
                channel: this._channel,
                forgerDB: this._forgerDB,
                blockchainDB: this._blockchainDB,
                nodeDB: this._nodeDB,
                logger: this.logger,
            });
            await this._loadPlugins();
            this.logger.debug(this._controller.bus.getEvents(), 'Application listening to events');
            this.logger.debug(this._controller.bus.getActions(), 'Application ready for actions');
            this._channel.publish(constants_1.APP_EVENT_READY);
        });
    }
    async shutdown(errorCode = 0, message = '') {
        this.logger.info({ errorCode, message }, 'Application shutdown started');
        const release = await this._mutex.acquire();
        try {
            this._channel.publish(constants_1.APP_EVENT_SHUTDOWN);
            await this._node.cleanup();
            await this._controller.cleanup(errorCode, message);
            await this._blockchainDB.close();
            await this._forgerDB.close();
            await this._nodeDB.close();
            await this._emptySocketsDirectory();
            this._clearControllerPidFile();
            this.logger.info({ errorCode, message }, 'Application shutdown completed');
        }
        catch (error) {
            this.logger.fatal({ err: error }, 'Application shutdown failed');
        }
        finally {
            this.config = lisk_utils_1.objects.mergeDeep({}, this.config);
            release();
            process.removeAllListeners('exit');
            process.exit(errorCode);
        }
    }
    _registerModule(Module, validateModuleID = false) {
        assert(Module, 'Module implementation is required');
        const InstantiableModule = Module;
        const moduleInstance = new InstantiableModule(this.config.genesisConfig);
        if (Application.getDefaultModules().includes(Module)) {
            this._node.registerModule(moduleInstance);
        }
        else if (validateModuleID && moduleInstance.id < MINIMUM_EXTERNAL_MODULE_ID) {
            throw new Error(`Custom module must have id greater than or equal to ${MINIMUM_EXTERNAL_MODULE_ID}`);
        }
        else {
            this._node.registerModule(moduleInstance);
        }
    }
    async _loadPlugins() {
        const dirs = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        const pluginOptions = {};
        const appConfigForPlugin = {
            version: this.config.version,
            networkVersion: this.config.networkVersion,
            genesisConfig: this.config.genesisConfig,
            logger: {
                consoleLogLevel: this.config.logger.consoleLogLevel,
                fileLogLevel: this.config.logger.fileLogLevel,
            },
            rootPath: this.config.rootPath,
            label: this.config.label,
        };
        Object.keys(this._plugins).forEach(alias => {
            pluginOptions[alias] = {
                ...this.config.plugins[alias],
                dataPath: dirs.dataPath,
                appConfig: appConfigForPlugin,
            };
        });
        await this._controller.loadPlugins(this._plugins, pluginOptions);
    }
    _initLogger() {
        const dirs = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        return logger_1.createLogger({
            ...this.config.logger,
            logFilePath: path.join(dirs.logs, this.config.logger.logFileName),
            module: 'lisk:app',
        });
    }
    _initChannel() {
        return new controller_1.InMemoryChannel(constants_1.APP_IDENTIFIER, [
            constants_1.APP_EVENT_READY.replace('app:', ''),
            constants_1.APP_EVENT_SHUTDOWN.replace('app:', ''),
            constants_1.APP_EVENT_NETWORK_EVENT.replace('app:', ''),
            constants_1.APP_EVENT_NETWORK_READY.replace('app:', ''),
            constants_1.APP_EVENT_TRANSACTION_NEW.replace('app:', ''),
            constants_1.APP_EVENT_CHAIN_FORK.replace('app:', ''),
            constants_1.APP_EVENT_CHAIN_VALIDATORS_CHANGE.replace('app:', ''),
            constants_1.APP_EVENT_BLOCK_NEW.replace('app:', ''),
            constants_1.APP_EVENT_BLOCK_DELETE.replace('app:', ''),
        ], {
            getConnectedPeers: {
                handler: () => this._node.actions.getConnectedPeers(),
            },
            getDisconnectedPeers: {
                handler: () => this._node.actions.getDisconnectedPeers(),
            },
            getNetworkStats: {
                handler: () => this._node.actions.getNetworkStats(),
            },
            getForgers: {
                handler: async () => this._node.actions.getValidators(),
            },
            updateForgingStatus: {
                handler: async (params) => this._node.actions.updateForgingStatus(params),
            },
            getForgingStatus: {
                handler: async () => this._node.actions.getForgingStatus(),
            },
            getTransactionsFromPool: {
                handler: () => this._node.actions.getTransactionsFromPool(),
            },
            postTransaction: {
                handler: async (params) => this._node.actions.postTransaction(params),
            },
            getLastBlock: {
                handler: () => this._node.actions.getLastBlock(),
            },
            getAccount: {
                handler: async (params) => this._node.actions.getAccount(params),
            },
            getAccounts: {
                handler: async (params) => this._node.actions.getAccounts(params),
            },
            getBlockByID: {
                handler: async (params) => this._node.actions.getBlockByID(params),
            },
            getBlocksByIDs: {
                handler: async (params) => this._node.actions.getBlocksByIDs(params),
            },
            getBlockByHeight: {
                handler: async (params) => this._node.actions.getBlockByHeight(params),
            },
            getBlocksByHeightBetween: {
                handler: async (params) => this._node.actions.getBlocksByHeightBetween(params),
            },
            getTransactionByID: {
                handler: async (params) => this._node.actions.getTransactionByID(params),
            },
            getTransactionsByIDs: {
                handler: async (params) => this._node.actions.getTransactionsByIDs(params),
            },
            getSchema: {
                handler: () => this._node.actions.getSchema(),
            },
            getRegisteredModules: {
                handler: () => this._node.actions.getRegisteredModules(),
            },
            getNodeInfo: {
                handler: () => this._node.actions.getNodeInfo(),
            },
            getRegisteredActions: {
                handler: () => this._controller.bus.getActions(),
            },
            getRegisteredEvents: {
                handler: () => this._controller.bus.getEvents(),
            },
        }, { skipInternalEvents: true });
    }
    _initController() {
        return new controller_1.Controller({
            appLabel: this.config.label,
            config: {
                rootPath: this.config.rootPath,
                rpc: this.config.rpc,
            },
            logger: this.logger,
            channel: this._channel,
        });
    }
    async _setupDirectories() {
        const dirs = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        await Promise.all(Array.from(Object.values(dirs)).map(async (dirPath) => fs.ensureDir(dirPath)));
    }
    async _emptySocketsDirectory() {
        const { sockets } = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        const socketFiles = fs.readdirSync(sockets);
        await Promise.all(socketFiles.map(async (aSocketFile) => rm(path.join(sockets, aSocketFile))));
    }
    async _validatePidFile() {
        const dirs = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        const pidPath = path.join(dirs.pids, 'controller.pid');
        const pidExists = await fs.pathExists(pidPath);
        if (pidExists) {
            const pid = parseInt((await fs.readFile(pidPath)).toString(), 10);
            const pidRunning = await isPidRunning(pid);
            this.logger.info({ pid }, 'Previous Lisk PID');
            this.logger.info({ pid: process.pid }, 'Current Lisk PID');
            if (pidRunning && pid !== process.pid) {
                this.logger.error({ appLabel: this.config.label }, 'An instance of application is already running, please change the application label to run another instance');
                throw new errors_1.DuplicateAppInstanceError(this.config.label, pidPath);
            }
        }
        await fs.writeFile(pidPath, process.pid);
    }
    _clearControllerPidFile() {
        const dirs = system_dirs_1.systemDirs(this.config.label, this.config.rootPath);
        fs.unlinkSync(path.join(dirs.pids, 'controller.pid'));
    }
    _getDBInstance(options, dbName) {
        const dirs = system_dirs_1.systemDirs(options.label, options.rootPath);
        const dbPath = `${dirs.data}/${dbName}`;
        this.logger.debug({ dbName, dbPath }, 'Create database instance.');
        return new lisk_db_1.KVStore(dbPath);
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map