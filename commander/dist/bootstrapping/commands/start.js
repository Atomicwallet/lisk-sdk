"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const utils = require("@liskhq/lisk-utils");
const flags_1 = require("../../utils/flags");
const path_1 = require("../../utils/path");
const LOG_OPTIONS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
class StartCommand extends command_1.Command {
    async run() {
        var _a, _b, _c, _d;
        const { flags } = this.parse(this.constructor);
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        this.log(`Starting Lisk ${this.config.pjson.name} at ${path_1.getFullPath(dataPath)}.`);
        const pathConfig = path_1.splitPath(dataPath);
        const defaultNetworkConfigDir = path_1.getConfigDirs(this.getApplicationConfigDir(), true);
        if (!defaultNetworkConfigDir.includes(flags.network)) {
            this.error(`Network ${flags.network} is not supported, supported networks: ${defaultNetworkConfigDir.join(',')}.`);
        }
        const configDir = path_1.getConfigDirs(dataPath);
        if (configDir.length > 1 || (configDir.length === 1 && configDir[0] !== flags.network)) {
            if (!flags['overwrite-config']) {
                this.error(`Datapath ${dataPath} already contains configs for ${configDir.join(',')}. Please use --overwrite-config to overwrite the config.`);
            }
            for (const configFolder of configDir) {
                if (configFolder !== flags.network) {
                    path_1.removeConfigDir(dataPath, configFolder);
                }
            }
        }
        path_1.ensureConfigDir(dataPath, flags.network);
        const { genesisBlockFilePath, configFilePath } = path_1.getNetworkConfigFilesPath(dataPath, flags.network);
        const { genesisBlockFilePath: defaultGenesisBlockFilePath, configFilePath: defaultConfigFilepath, } = path_1.getNetworkConfigFilesPath(this.getApplicationConfigDir(), flags.network, true);
        if (!fs.existsSync(genesisBlockFilePath) ||
            (fs.existsSync(genesisBlockFilePath) && flags['overwrite-config'])) {
            fs.copyFileSync(defaultGenesisBlockFilePath, genesisBlockFilePath);
        }
        if (!fs.existsSync(configFilePath) ||
            (fs.existsSync(configFilePath) && flags['overwrite-config'])) {
            fs.copyFileSync(defaultConfigFilepath, configFilePath);
        }
        const genesisBlock = await fs.readJSON(genesisBlockFilePath);
        let config = await fs.readJSON(configFilePath);
        if (flags.config) {
            const customConfig = await fs.readJSON(flags.config);
            config = utils.objects.mergeDeep({}, config, customConfig);
        }
        config.rootPath = pathConfig.rootPath;
        config.label = pathConfig.label;
        config.version = this.config.pjson.version;
        if (flags['api-ipc']) {
            config.rpc = utils.objects.mergeDeep({}, config.rpc, {
                enable: flags['api-ipc'],
                mode: 'ipc',
            });
        }
        if (flags['api-ws']) {
            config.rpc = utils.objects.mergeDeep({}, config.rpc, {
                enable: flags['api-ws'],
                mode: 'ws',
                port: flags['api-ws-port'],
            });
        }
        if (flags['console-log']) {
            config.logger = (_a = config.logger) !== null && _a !== void 0 ? _a : {};
            config.logger.consoleLogLevel = flags['console-log'];
        }
        if (flags.log) {
            config.logger = (_b = config.logger) !== null && _b !== void 0 ? _b : {};
            config.logger.fileLogLevel = flags.log;
        }
        if (flags.port) {
            config.network = (_c = config.network) !== null && _c !== void 0 ? _c : {};
            config.network.port = flags.port;
        }
        if (flags['seed-peers']) {
            config.network = (_d = config.network) !== null && _d !== void 0 ? _d : {};
            config.network.seedPeers = [];
            const peers = flags['seed-peers'].split(',');
            for (const seed of peers) {
                const [ip, port] = seed.split(':');
                if (!ip || !port || Number.isNaN(Number(port))) {
                    this.error('Invalid seed-peers, ip or port is invalid or not specified.');
                }
                config.network.seedPeers.push({ ip, port: Number(port) });
            }
        }
        try {
            const app = this.getApplication(genesisBlock, config);
            await app.run();
        }
        catch (errors) {
            this.error(Array.isArray(errors) ? errors.map(err => err.message).join(',') : errors);
        }
    }
}
exports.StartCommand = StartCommand;
StartCommand.description = 'Start Blockchain Node.';
StartCommand.examples = [
    'start',
    'start --network devnet --data-path /path/to/data-dir --log debug',
    'start --network devnet --api-ws',
    'start --network devnet --api-ws --api-ws-port 8888',
    'start --network devnet --port 9000',
    'start --network devnet --port 9002 --seed-peers 127.0.0.1:9001,127.0.0.1:9000',
    'start --network testnet --overwrite-config',
    'start --network testnet --config ~/my_custom_config.json',
];
StartCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    network: flags_1.flagsWithParser.network,
    config: flags_1.flagsWithParser.config,
    'overwrite-config': command_1.flags.boolean({
        description: 'Overwrite network configs if they exist already',
        default: false,
    }),
    port: command_1.flags.integer({
        char: 'p',
        description: 'Open port for the peer to peer incoming connections. Environment variable "LISK_PORT" can also be used.',
        env: 'LISK_PORT',
    }),
    'api-ipc': command_1.flags.boolean({
        description: 'Enable IPC communication. This will load plugins as a child process and communicate over IPC. Environment variable "LISK_API_IPC" can also be used.',
        env: 'LISK_API_IPC',
        default: false,
        exclusive: ['api-ws'],
    }),
    'api-ws': command_1.flags.boolean({
        description: 'Enable websocket communication for api-client. Environment variable "LISK_API_WS" can also be used.',
        env: 'LISK_API_WS',
        default: false,
        exclusive: ['api-ipc'],
    }),
    'api-ws-port': command_1.flags.integer({
        description: 'Port to be used for api-client websocket. Environment variable "LISK_API_WS_PORT" can also be used.',
        env: 'LISK_API_WS_PORT',
        dependsOn: ['api-ws'],
    }),
    'console-log': command_1.flags.string({
        description: 'Console log level. Environment variable "LISK_CONSOLE_LOG_LEVEL" can also be used.',
        env: 'LISK_CONSOLE_LOG_LEVEL',
        options: LOG_OPTIONS,
    }),
    log: command_1.flags.string({
        char: 'l',
        description: 'File log level. Environment variable "LISK_FILE_LOG_LEVEL" can also be used.',
        env: 'LISK_FILE_LOG_LEVEL',
        options: LOG_OPTIONS,
    }),
    'seed-peers': command_1.flags.string({
        env: 'LISK_SEED_PEERS',
        description: 'Seed peers to initially connect to in format of comma separated "ip:port". IP can be DNS name or IPV4 format. Environment variable "LISK_SEED_PEERS" can also be used.',
    }),
};
//# sourceMappingURL=start.js.map