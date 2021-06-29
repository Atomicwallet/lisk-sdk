"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCommand = void 0;
const command_1 = require("@oclif/command");
const inquirer = require("inquirer");
const path_1 = require("../../../utils/path");
const flags_1 = require("../../../utils/flags");
const application_1 = require("../../../utils/application");
const db_1 = require("../../../utils/db");
class ResetCommand extends command_1.Command {
    async run() {
        var _a;
        const { flags } = this.parse(ResetCommand);
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        const skipPrompt = (_a = flags.yes) !== null && _a !== void 0 ? _a : false;
        if (application_1.isApplicationRunning(dataPath)) {
            const errorMessage = `Can't reset db while running application. Application at data path ${dataPath} is running with pid ${application_1.getPid(dataPath)}.`;
            this.error(errorMessage);
        }
        if (!skipPrompt) {
            const { answer } = await inquirer.prompt([
                {
                    name: 'answer',
                    message: 'Are you sure you want to reset the db?',
                    type: 'list',
                    choices: ['yes', 'no'],
                },
            ]);
            if (answer === 'no') {
                return;
            }
        }
        const db = db_1.getBlockchainDB(dataPath);
        await db.clear();
        this.log('Blockchain data has been reset.');
    }
}
exports.ResetCommand = ResetCommand;
ResetCommand.description = 'Reset the blockchain data.';
ResetCommand.examples = [
    'blockchain:reset',
    'blockchain:reset --data-path ./lisk',
    'blockchain:reset --yes',
];
ResetCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    yes: command_1.flags.boolean({
        char: 'y',
        description: 'Skip confirmation prompt.',
    }),
};
//# sourceMappingURL=reset.js.map