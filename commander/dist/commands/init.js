"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_bootstrap_command_1 = require("../base_bootstrap_command");
class InitCommand extends base_bootstrap_command_1.default {
    async run() {
        var _a;
        const { args: { projectPath }, } = this.parse(InitCommand);
        return this._runBootstrapCommand('lisk:init', {
            projectPath: (_a = projectPath !== null && projectPath !== void 0 ? projectPath : process.env.INIT_CWD) !== null && _a !== void 0 ? _a : process.cwd(),
        });
    }
}
exports.default = InitCommand;
InitCommand.description = 'Bootstrap a blockchain application using Lisk SDK.';
InitCommand.examples = [
    'init',
    'init --template lisk-ts',
    'init --template @some-global-npm-package',
    'init /project/path',
    'init /project/path --template lisk-ts',
];
InitCommand.flags = {
    ...base_bootstrap_command_1.default.flags,
};
InitCommand.args = [
    {
        name: 'projectPath',
        description: 'Path to create the project.',
        default: (_a = process.env.INIT_CWD) !== null && _a !== void 0 ? _a : process.cwd(),
    },
];
//# sourceMappingURL=init.js.map