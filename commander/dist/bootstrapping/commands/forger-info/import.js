"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportCommand = void 0;
const command_1 = require("@oclif/command");
const path = require("path");
const fs = require("fs-extra");
const path_1 = require("../../../utils/path");
const downloadUtils = require("../../../utils/download");
const flags_1 = require("../../../utils/flags");
class ImportCommand extends command_1.Command {
    async run() {
        const { args, flags } = this.parse(ImportCommand);
        const { sourcePath } = args;
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        const forgerDBPath = path_1.getForgerDBPath(dataPath);
        if (path.extname(sourcePath) !== '.gz') {
            this.error('Forger data should be provided in gzip format.');
        }
        if (fs.existsSync(forgerDBPath)) {
            if (!flags.force) {
                this.error(`Forger data already exists at ${dataPath}. Use --force flag to overwrite`);
            }
            fs.removeSync(forgerDBPath);
        }
        fs.ensureDirSync(forgerDBPath);
        this.log(`Importing forger data from ${path_1.getFullPath(sourcePath)}`);
        await downloadUtils.extract(path.dirname(sourcePath), path.basename(sourcePath), forgerDBPath);
        this.log('Import completed.');
        this.log(`   ${path_1.getFullPath(dataPath)}`);
    }
}
exports.ImportCommand = ImportCommand;
ImportCommand.description = 'Import from <FILE>.';
ImportCommand.args = [
    {
        name: 'sourcePath',
        required: true,
        description: 'Path to the forger-info zip file that you want to import.',
    },
];
ImportCommand.examples = [
    'forger-info:import ./my/path',
    'forger-info:import --data-path ./data --force',
];
ImportCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    force: command_1.flags.boolean({
        char: 'f',
        description: 'To overwrite the existing data if present.',
    }),
};
//# sourceMappingURL=import.js.map