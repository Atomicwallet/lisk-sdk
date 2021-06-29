"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const base_bootstrap_command_1 = require("../../base_bootstrap_command");
class PluginCommand extends base_bootstrap_command_1.default {
    async run() {
        var _a;
        const { args: { alias }, flags: { standalone, output, registry }, } = this.parse(PluginCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/;
        const regexAlphabets = /[^A-Za-z]/;
        if (!regexCamelCase.test(alias) || regexWhitespace.test(alias) || regexAlphabets.test(alias)) {
            this.error('Invalid plugin alias');
        }
        if (standalone) {
            return this._runBootstrapCommand('lisk:init:plugin', {
                alias,
                projectPath: (_a = output !== null && output !== void 0 ? output : process.env.INIT_CWD) !== null && _a !== void 0 ? _a : process.cwd(),
                registry,
            });
        }
        if (!this._isLiskAppDir(process.cwd())) {
            this.error('You can run this command only in lisk app directory. Run "lisk init --help" command for more details.');
        }
        return this._runBootstrapCommand('lisk:generate:plugin', {
            alias,
        });
    }
}
exports.default = PluginCommand;
PluginCommand.description = 'Creates custom plugin.';
PluginCommand.examples = [
    'generate:plugin myPlugin',
    'generate:plugin myPlugin --standalone --output ./my_plugin',
];
PluginCommand.args = [
    {
        name: 'alias',
        description: 'Alias of the plugin.',
        required: true,
    },
];
PluginCommand.flags = {
    ...base_bootstrap_command_1.default.flags,
    standalone: command_1.flags.boolean({
        description: 'Create a standalone plugin package.',
    }),
    output: command_1.flags.string({
        description: 'Path to create the plugin.',
        char: 'o',
        dependsOn: ['standalone'],
    }),
    registry: command_1.flags.string({
        description: 'URL of a registry to download dependencies from.',
        dependsOn: ['standalone'],
    }),
};
//# sourceMappingURL=plugin.js.map