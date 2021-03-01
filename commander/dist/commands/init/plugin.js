"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_bootstrap_command_1 = require("../../base_bootstrap_command");
class PluginCommand extends base_bootstrap_command_1.default {
    async run() {
        var _a;
        const { args: { alias, path }, } = this.parse(PluginCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /^([a-z]+)(([A-Z]([a-z]+))+)$/;
        if (regexCamelCase.test(alias) || regexWhitespace.test(alias)) {
            this.error('Invalid plugin alias');
        }
        return this._runBootstrapCommand('lisk:init:plugin', {
            alias,
            projectPath: (_a = path !== null && path !== void 0 ? path : process.env.INIT_CWD) !== null && _a !== void 0 ? _a : process.cwd(),
        });
    }
}
exports.default = PluginCommand;
PluginCommand.description = 'Create custom plugin as a standalone package.';
PluginCommand.examples = ['init:plugin my-plugin', 'init:plugin my-plugin ./path'];
PluginCommand.args = [
    {
        name: 'alias',
        description: 'Alias of the plugin.',
        required: true,
    },
    {
        name: 'path',
        description: 'Path to create the plugin.',
        default: (_a = process.env.INIT_CWD) !== null && _a !== void 0 ? _a : process.cwd(),
    },
];
PluginCommand.flags = {
    ...base_bootstrap_command_1.default.flags,
};
//# sourceMappingURL=plugin.js.map