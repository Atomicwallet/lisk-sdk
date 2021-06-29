"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowCommand = void 0;
const utils = require("@liskhq/lisk-utils");
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const flags_1 = require("../../../utils/flags");
const path_1 = require("../../../utils/path");
class ShowCommand extends command_1.Command {
    async run() {
        const { flags } = this.parse(ShowCommand);
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        const pathConfig = path_1.splitPath(dataPath);
        const configDir = path_1.getConfigDirs(dataPath);
        if (configDir.length !== 1) {
            this.error(`Folder in ${dataPath} does not contain valid config`);
        }
        const network = configDir[0];
        const { configFilePath } = path_1.getNetworkConfigFilesPath(dataPath, network);
        let config = (await fs.readJSON(configFilePath));
        if (flags.config) {
            const customConfig = (await fs.readJSON(flags.config));
            config = utils.objects.mergeDeep({}, config, customConfig);
        }
        config.rootPath = pathConfig.rootPath;
        config.label = pathConfig.label;
        config.version = this.config.pjson.version;
        if (flags.pretty) {
            this.log(JSON.stringify(config, undefined, '  '));
        }
        else {
            this.log(JSON.stringify(config));
        }
    }
}
exports.ShowCommand = ShowCommand;
ShowCommand.description = 'Show application config.';
ShowCommand.examples = [
    'config:show',
    'config:show --pretty',
    'config:show --config ./custom-config.json --data-path ./data',
];
ShowCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    config: flags_1.flagsWithParser.config,
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=show.js.map