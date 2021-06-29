"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseForgingCommand = void 0;
const command_1 = require("@oclif/command");
const inquirer = require("inquirer");
const flags_1 = require("../../utils/flags");
const base_ipc_client_1 = require("./base_ipc_client");
const isLessThanZero = (value) => value === null || value === undefined || value < 0;
class BaseForgingCommand extends base_ipc_client_1.BaseIPCClientCommand {
    async run() {
        const { args, flags } = this.parse(this.constructor);
        const { address, height, maxHeightPreviouslyForged, maxHeightPrevoted } = args;
        let password;
        if (this.forging &&
            (isLessThanZero(height) ||
                isLessThanZero(maxHeightPreviouslyForged) ||
                isLessThanZero(maxHeightPrevoted))) {
            throw new Error('The maxHeightPreviouslyForged and maxHeightPrevoted parameter value must be greater than or equal to 0');
        }
        if (flags.password) {
            password = flags.password;
        }
        else {
            const answers = await inquirer.prompt([
                {
                    type: 'password',
                    message: 'Enter password to decrypt the encrypted passphrase: ',
                    name: 'password',
                    mask: '*',
                },
            ]);
            password = answers.password;
        }
        if (!this._client) {
            this.error('APIClient is not initialized.');
        }
        try {
            const result = await this._client.invoke('app:updateForgingStatus', {
                address,
                password,
                forging: this.forging,
                height: Number(height !== null && height !== void 0 ? height : 0),
                maxHeightPreviouslyForged: Number(maxHeightPreviouslyForged !== null && maxHeightPreviouslyForged !== void 0 ? maxHeightPreviouslyForged : 0),
                maxHeightPrevoted: Number(maxHeightPrevoted !== null && maxHeightPrevoted !== void 0 ? maxHeightPrevoted : 0),
                overwrite: flags.overwrite,
            });
            this.log('Forging status:');
            this.printJSON(result);
        }
        catch (error) {
            this.error(error);
        }
    }
}
exports.BaseForgingCommand = BaseForgingCommand;
BaseForgingCommand.args = [
    {
        name: 'address',
        required: true,
        description: 'Address of an account in a base32 format.',
    },
];
BaseForgingCommand.flags = {
    ...base_ipc_client_1.BaseIPCClientCommand.flags,
    password: flags_1.flagsWithParser.password,
    overwrite: command_1.flags.boolean({
        description: 'Overwrites the forger info',
        default: false,
    }),
};
//# sourceMappingURL=base_forging.js.map