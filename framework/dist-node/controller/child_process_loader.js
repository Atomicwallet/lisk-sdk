"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const channels_1 = require("./channels");
const modulePath = process.argv[2];
const moduleExportName = process.argv[3];
const Klass = require(modulePath)[moduleExportName];
let channel;
let plugin;
const _loadPlugin = async (config, pluginOptions) => {
    const pluginAlias = Klass.alias;
    plugin = new Klass(pluginOptions);
    channel = new channels_1.IPCChannel(pluginAlias, plugin.events, plugin.actions, {
        socketsPath: config.socketsPath,
    });
    await channel.registerToBus();
    channel.publish(`${pluginAlias}:registeredToBus`);
    channel.publish(`${pluginAlias}:loading:started`);
    await plugin.init(channel);
    await plugin.load(channel);
    channel.publish(`${pluginAlias}:loading:finished`);
};
const _unloadPlugin = async (code = 0) => {
    const pluginAlias = Klass.alias;
    channel.publish(`${pluginAlias}:unloading:started`);
    try {
        await plugin.unload();
        channel.publish(`${pluginAlias}:unloading:finished`);
        channel.cleanup();
        process.exit(code);
    }
    catch (error) {
        channel.publish(`${pluginAlias}:unloading:error`, error);
        channel.cleanup();
        process.exit(1);
    }
};
process.on('message', ({ action, config, options, }) => {
    const internalWorker = async () => {
        if (action === 'load') {
            await _loadPlugin(config, options);
        }
        else if (action === 'unload') {
            await _unloadPlugin();
        }
        else {
            console.error(`Unknown child process plugin action: ${action}`);
        }
    };
    internalWorker().catch((err) => err);
});
process.on('disconnect', () => {
    const internalWorker = async () => {
        await _unloadPlugin(1);
    };
    internalWorker().catch((err) => err);
});
process.once('SIGINT', () => {
});
process.once('SIGTERM', () => {
});
//# sourceMappingURL=child_process_loader.js.map