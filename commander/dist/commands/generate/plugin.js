"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_bootstrap_command_1 = require("../../base_bootstrap_command");
class PluginCommand extends base_bootstrap_command_1.default {
    async run() {
        const { args: { alias }, } = this.parse(PluginCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /^([a-z]+)(([A-Z]([a-z]+))+)$/;
        if (regexCamelCase.test(alias) || regexWhitespace.test(alias)) {
            this.error('Invalid plugin alias');
        }
        return this._runBootstrapCommand('lisk:generate:plugin', {
            alias,
        });
    }
}
exports.default = PluginCommand;
PluginCommand.description = 'Creates custom plugin.';
PluginCommand.examples = ['generate:plugin my-plugin'];
PluginCommand.args = [
    {
        name: 'alias',
        description: 'Alias of the plugin.',
        required: true,
    },
];
PluginCommand.flags = {
    ...base_bootstrap_command_1.default.flags,
};
//# sourceMappingURL=plugin.js.map