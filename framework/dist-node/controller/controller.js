"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const childProcess = require("child_process");
const path = require("path");
const base_plugin_1 = require("../plugins/base_plugin");
const system_dirs_1 = require("../system_dirs");
const bus_1 = require("./bus");
const in_memory_channel_1 = require("./channels/in_memory_channel");
class Controller {
    constructor(options) {
        this.logger = options.logger;
        this.appLabel = options.appLabel;
        this.channel = options.channel;
        this.logger.info('Initializing controller');
        const dirs = system_dirs_1.systemDirs(this.appLabel, options.config.rootPath);
        this.config = {
            dataPath: dirs.dataPath,
            dirs: {
                ...dirs,
            },
            socketsPath: {
                root: `unix://${dirs.sockets}`,
                pub: `unix://${dirs.sockets}/lisk_pub.sock`,
                sub: `unix://${dirs.sockets}/lisk_sub.sock`,
                rpc: `unix://${dirs.sockets}/lisk_rpc.sock`,
            },
            rpc: options.config.rpc,
        };
        this._inMemoryPlugins = {};
        this._childProcesses = {};
    }
    async load() {
        this.logger.info('Loading controller');
        await this._setupBus();
    }
    async loadPlugins(plugins, pluginOptions) {
        if (!this.bus) {
            throw new Error('Controller bus is not initialized. Plugins can not be loaded.');
        }
        for (const alias of Object.keys(plugins)) {
            const klass = plugins[alias];
            const options = pluginOptions[alias];
            if (options.loadAsChildProcess && this.config.rpc.enable) {
                await this._loadChildProcessPlugin(alias, klass, options);
            }
            else {
                await this._loadInMemoryPlugin(alias, klass, options);
            }
        }
    }
    async unloadPlugins(plugins = []) {
        const pluginsToUnload = plugins.length > 0
            ? plugins
            : [...Object.keys(this._inMemoryPlugins), ...Object.keys(this._childProcesses)];
        let hasError = false;
        for (const alias of pluginsToUnload) {
            try {
                if (this._inMemoryPlugins[alias]) {
                    await this._unloadInMemoryPlugin(alias);
                }
                else if (this._childProcesses[alias]) {
                    await this._unloadChildProcessPlugin(alias);
                }
                else {
                    throw new Error(`Unknown plugin "${alias}" was asked to unload.`);
                }
            }
            catch (error) {
                this.logger.error(error);
                hasError = true;
            }
        }
        if (hasError) {
            throw new Error('Unload Plugins failed');
        }
    }
    async cleanup(_code, reason) {
        this.logger.info('Controller cleanup started');
        if (reason) {
            this.logger.debug(`Reason: ${reason}`);
        }
        try {
            this.logger.debug('Plugins cleanup started');
            await this.unloadPlugins();
            this.logger.debug('Plugins cleanup completed');
            this.logger.debug('Bus cleanup started');
            await this.bus.cleanup();
            this.logger.debug('Bus cleanup completed');
            this.logger.info('Controller cleanup completed');
        }
        catch (err) {
            this.logger.error(err, 'Controller cleanup failed');
        }
    }
    async _setupBus() {
        this.bus = new bus_1.Bus(this.logger, this.config);
        await this.bus.setup();
        await this.channel.registerToBus(this.bus);
        this.bus.subscribe('*', (event) => {
            this.logger.error(`eventName: ${event.method},`, 'Monitor Bus Channel');
        });
    }
    async _loadInMemoryPlugin(alias, Klass, options) {
        const pluginAlias = alias || Klass.alias;
        const { name, version } = Klass.info;
        const plugin = new Klass(options);
        this.logger.info({ name, version, alias: pluginAlias }, 'Loading in-memory plugin');
        const channel = new in_memory_channel_1.InMemoryChannel(pluginAlias, plugin.events, plugin.actions);
        await channel.registerToBus(this.bus);
        channel.publish(`${pluginAlias}:registeredToBus`);
        channel.publish(`${pluginAlias}:loading:started`);
        await plugin.init(channel);
        await plugin.load(channel);
        channel.publish(`${pluginAlias}:loading:finished`);
        this._inMemoryPlugins[pluginAlias] = { plugin, channel };
        this.logger.info({ name, version, alias: pluginAlias }, 'Loaded in-memory plugin');
    }
    async _loadChildProcessPlugin(alias, Klass, options) {
        const pluginAlias = alias || Klass.alias;
        const { name, version } = Klass.info;
        this.logger.info({ name, version, alias: pluginAlias }, 'Loading child-process plugin');
        const program = path.resolve(__dirname, 'child_process_loader');
        const parameters = [base_plugin_1.getPluginExportPath(Klass), Klass.name];
        const forkedProcessOptions = {
            execArgv: undefined,
        };
        const maxPort = 20000;
        const minPort = 10000;
        if (process.env.NODE_DEBUG) {
            forkedProcessOptions.execArgv = [
                `--inspect=${Math.floor(Math.random() * (maxPort - minPort) + minPort)}`,
            ];
        }
        const child = childProcess.fork(program, parameters, forkedProcessOptions);
        child.send({
            action: 'load',
            config: this.config,
            options,
        });
        this._childProcesses[pluginAlias] = child;
        child.on('exit', (code, signal) => {
            if (code !== null && code !== undefined && code !== 0) {
                this.logger.error({ name, version, pluginAlias, code, signal: signal !== null && signal !== void 0 ? signal : '' }, 'Child process plugin exited');
            }
        });
        child.on('error', error => {
            this.logger.error(error, `Child process for "${pluginAlias}" faced error.`);
        });
        await Promise.race([
            new Promise(resolve => {
                this.channel.once(`${pluginAlias}:loading:finished`, () => {
                    this.logger.info({ name, version, alias: pluginAlias }, 'Loaded child-process plugin');
                    resolve();
                });
            }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Child process plugin loading timeout'));
                }, 2000);
            }),
        ]);
    }
    async _unloadInMemoryPlugin(alias) {
        this._inMemoryPlugins[alias].channel.publish(`${alias}:unloading:started`);
        try {
            await this._inMemoryPlugins[alias].plugin.unload();
            this._inMemoryPlugins[alias].channel.publish(`${alias}:unloading:finished`);
        }
        catch (error) {
            this._inMemoryPlugins[alias].channel.publish(`${alias}:unloading:error`, error);
        }
        finally {
            delete this._inMemoryPlugins[alias];
        }
    }
    async _unloadChildProcessPlugin(alias) {
        if (!this._childProcesses[alias].connected) {
            this._childProcesses[alias].kill('SIGTERM');
            delete this._childProcesses[alias];
            throw new Error('Child process is not connected any more.');
        }
        this._childProcesses[alias].send({
            action: 'unload',
        });
        await Promise.race([
            new Promise(resolve => {
                this.channel.once(`${alias}:unloading:finished`, () => {
                    this.logger.info(`Child process plugin "${alias}" unloaded`);
                    delete this._childProcesses[alias];
                    resolve();
                });
            }),
            new Promise((_, reject) => {
                this.channel.once(`${alias}:unloading:error`, data => {
                    this.logger.info(`Child process plugin "${alias}" unloaded with error`);
                    this.logger.error(data !== null && data !== void 0 ? data : {}, 'Unloading plugin error.');
                    delete this._childProcesses[alias];
                    reject(data);
                });
            }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    this._childProcesses[alias].kill('SIGTERM');
                    delete this._childProcesses[alias];
                    reject(new Error('Child process plugin unload timeout'));
                }, 2000);
            }),
        ]);
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map