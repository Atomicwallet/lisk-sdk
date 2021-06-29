"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_bootstrap_command_1 = require("../../base_bootstrap_command");
class AssetCommand extends base_bootstrap_command_1.default {
    async run() {
        const { args } = this.parse(AssetCommand);
        const { moduleName, assetName, assetID } = args;
        const regexWhitespace = /\s/g;
        const regexCamelCase = /[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/;
        const regexAlphabets = /[^A-Za-z]/;
        if (!regexCamelCase.test(moduleName) ||
            regexWhitespace.test(moduleName) ||
            regexAlphabets.test(moduleName)) {
            this.error('Invalid module name');
        }
        if (!regexCamelCase.test(assetName) ||
            regexWhitespace.test(assetName) ||
            regexAlphabets.test(assetName)) {
            this.error('Invalid asset name');
        }
        if (Number.isNaN(Number(assetID)) || Number(assetID) < 0) {
            this.error('Invalid asset ID, only positive integers are allowed');
        }
        if (!this._isLiskAppDir(process.cwd())) {
            this.error('You can run this command only in lisk app directory. Run "lisk init --help" command for more details.');
        }
        this.log(`Creating asset skeleton with asset name "${assetName}" and asset ID "${assetID}" for module "${moduleName}"`);
        return this._runBootstrapCommand('lisk:generate:asset', {
            moduleName,
            assetName,
            assetID,
        });
    }
}
exports.default = AssetCommand;
AssetCommand.description = 'Creates an asset skeleton for the given module name, name and id.';
AssetCommand.examples = [
    'generate:asset moduleName assetName assetID',
    'generate:asset nft transfer 1',
];
AssetCommand.args = [
    {
        name: 'moduleName',
        description: 'Module name.',
        required: true,
    },
    {
        name: 'assetName',
        description: 'Asset name.',
        required: true,
    },
    {
        name: 'assetID',
        description: 'Asset Id.',
        required: true,
    },
];
//# sourceMappingURL=asset.js.map