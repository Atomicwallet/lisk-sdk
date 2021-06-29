"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const path_1 = require("path");
const inquirer = require("inquirer");
const config_1 = require("../../../utils/config");
class CreateCommand extends command_1.Command {
    async run() {
        const { flags: { output, label, 'community-identifier': communityIdentifier }, } = this.parse(CreateCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /^([a-z]+)(([A-Z]([a-z]+))+)$/;
        if (regexCamelCase.test(output) || regexWhitespace.test(output)) {
            this.error('Invalid name');
        }
        const configPath = path_1.resolve(output);
        const filePath = path_1.join(configPath, 'config');
        config_1.defaultConfig.label = label;
        config_1.defaultConfig.genesisConfig.communityIdentifier = communityIdentifier;
        if (fs.existsSync(filePath)) {
            const userResponse = await inquirer.prompt({
                type: 'confirm',
                name: 'confirm',
                message: 'A config file already exists at the given location. Do you want to overwrite it?',
            });
            if (!userResponse.confirm) {
                this.error('Operation cancelled, config file already present at the desired location');
            }
            else {
                fs.writeJSONSync(path_1.resolve(configPath, 'config.json'), config_1.defaultConfig, { spaces: '\t' });
            }
        }
        else {
            fs.mkdirSync(configPath, { recursive: true });
            fs.writeJSONSync(path_1.resolve(configPath, 'config.json'), config_1.defaultConfig, { spaces: '\t' });
        }
    }
}
exports.CreateCommand = CreateCommand;
CreateCommand.description = 'Creates network configuration file.';
CreateCommand.examples = [
    'config:create --output mydir',
    'config:create --output mydir --label beta-sdk-app',
    'config:create --output mydir --label beta-sdk-app --community-identifier sdk',
];
CreateCommand.flags = {
    output: command_1.flags.string({
        char: 'o',
        description: 'Directory where the config file is saved',
        default: process.cwd(),
    }),
    label: command_1.flags.string({
        char: 'l',
        description: 'App Label',
        default: 'beta-sdk-app',
    }),
    'community-identifier': command_1.flags.string({
        char: 'i',
        description: 'Community Identifier',
        default: 'sdk',
    }),
};
//# sourceMappingURL=create.js.map