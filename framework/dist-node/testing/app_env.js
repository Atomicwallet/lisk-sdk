"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultApplicationEnv = exports.ApplicationEnv = void 0;
const lisk_api_client_1 = require("@liskhq/lisk-api-client");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const path_1 = require("path");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const os_1 = require("os");
const fs_extra_1 = require("fs-extra");
const fixtures_1 = require("./fixtures");
const create_genesis_block_1 = require("./create_genesis_block");
const application_1 = require("../application");
const modules_1 = require("../modules");
class ApplicationEnv {
    constructor(appConfig) {
        this._initApplication(appConfig);
    }
    get application() {
        return this._application;
    }
    get ipcClient() {
        return this._ipcClient;
    }
    get dataPath() {
        return this._dataPath;
    }
    get networkIdentifier() {
        return this._application.networkIdentifier;
    }
    get lastBlock() {
        return this._application['_node']['_chain'].lastBlock;
    }
    async startApplication() {
        await Promise.race([
            this._application.run(),
            new Promise(resolve => setTimeout(resolve, 3000)),
        ]);
        if (this._application.config.rpc.enable && this._application.config.rpc.mode === 'ipc') {
            this._ipcClient = await lisk_api_client_1.createIPCClient(this._dataPath);
        }
    }
    async stopApplication(options = { clearDB: true }) {
        if (options.clearDB) {
            await this._application['_forgerDB'].clear();
            await this._application['_blockchainDB'].clear();
            await this._application['_nodeDB'].clear();
        }
        if (this._application.config.rpc.enable && this._application.config.rpc.mode === 'ipc') {
            await this._ipcClient.disconnect();
        }
        await this._application.shutdown();
    }
    async waitNBlocks(n = 1) {
        const height = this.lastBlock.header.height + n;
        return new Promise(resolve => {
            this._application['_channel'].subscribe('app:block:new', () => {
                if (this.lastBlock.header.height >= height) {
                    resolve();
                }
            });
        });
    }
    _initApplication(appConfig) {
        var _a, _b, _c;
        lisk_codec_1.codec.clearCache();
        const { genesisBlockJSON } = create_genesis_block_1.createGenesisBlock({ modules: appConfig.modules });
        const config = lisk_utils_1.objects.mergeDeep({}, fixtures_1.defaultConfig, (_a = appConfig.config) !== null && _a !== void 0 ? _a : {});
        const { label } = config;
        const application = new application_1.Application((_b = appConfig.genesisBlockJSON) !== null && _b !== void 0 ? _b : genesisBlockJSON, config);
        appConfig.modules.map(module => application.registerModule(module));
        (_c = appConfig.plugins) === null || _c === void 0 ? void 0 : _c.map(plugin => application.registerPlugin(plugin));
        this._dataPath = path_1.join(application.config.rootPath, label);
        this._application = application;
        return application;
    }
}
exports.ApplicationEnv = ApplicationEnv;
const createDefaultApplicationEnv = (appEnvConfig) => {
    var _a, _b, _c, _d, _e;
    const rootPath = (_b = (_a = appEnvConfig.config) === null || _a === void 0 ? void 0 : _a.rootPath) !== null && _b !== void 0 ? _b : fixtures_1.defaultConfig.rootPath;
    const label = (_d = (_c = appEnvConfig.config) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : fixtures_1.defaultConfig.label;
    const dataPath = path_1.join(rootPath.replace('~', os_1.homedir()), label);
    if (fs_extra_1.existsSync(dataPath)) {
        fs_extra_1.rmdirSync(dataPath, { recursive: true });
    }
    const defaultModules = [modules_1.TokenModule, modules_1.SequenceModule, modules_1.KeysModule, modules_1.DPoSModule];
    const modules = [...new Set([...((_e = appEnvConfig.modules) !== null && _e !== void 0 ? _e : []), ...defaultModules])];
    const faucetAccount = {
        address: fixtures_1.defaultFaucetAccount.address,
        token: { balance: BigInt(fixtures_1.defaultFaucetAccount.balance) },
        sequence: { nonce: BigInt('0') },
    };
    const defaultDelegateAccounts = fixtures_1.defaultAccounts().map((a, i) => fixtures_1.createDefaultAccount(modules, {
        address: a.address,
        dpos: {
            delegate: {
                username: `delegate_${i}`,
            },
        },
    }));
    const accounts = [faucetAccount, ...defaultDelegateAccounts];
    const { genesisBlockJSON } = create_genesis_block_1.createGenesisBlock({
        modules,
        accounts,
    });
    const appEnv = new ApplicationEnv({
        ...appEnvConfig,
        modules,
        genesisBlockJSON,
    });
    return appEnv;
};
exports.createDefaultApplicationEnv = createDefaultApplicationEnv;
//# sourceMappingURL=app_env.js.map