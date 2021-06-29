"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_bootstrap_command_1 = require("../../base_bootstrap_command");
const MINIMUM_EXTERNAL_MODULE_ID = 1000;
class ModuleCommand extends base_bootstrap_command_1.default {
    async run() {
        const { args: { moduleName, moduleID }, } = this.parse(ModuleCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/;
        const regexAlphabets = /[^A-Za-z]/;
        if (!regexCamelCase.test(moduleName) ||
            regexWhitespace.test(moduleName) ||
            regexAlphabets.test(moduleName)) {
            this.error('Invalid module name');
        }
        if (Number.isNaN(Number(moduleID)) || +moduleID < MINIMUM_EXTERNAL_MODULE_ID) {
            this.error(`Invalid module ID, only integers are allowed and it should be greater than and equal to ${MINIMUM_EXTERNAL_MODULE_ID}`);
        }
        if (!this._isLiskAppDir(process.cwd())) {
            this.error('You can run this command only in lisk app directory. Run "lisk init --help" command for more details.');
        }
        this.log(`Creating module skeleton with module name "${moduleName}" and module ID "${moduleID}"`);
        return this._runBootstrapCommand('lisk:generate:module', {
            moduleName: moduleName,
            moduleID: moduleID,
        });
    }
}
exports.default = ModuleCommand;
ModuleCommand.description = 'Creates a module skeleton for the given name and id.';
ModuleCommand.examples = ['generate:module nft 5000'];
ModuleCommand.args = [
    {
        name: 'moduleName',
        description: 'Module name.',
        required: true,
    },
    {
        name: 'moduleID',
        description: 'Module Id, should be atleast 1000 or more',
        required: true,
    },
];
//# sourceMappingURL=module.js.map