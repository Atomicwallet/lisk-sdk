"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportCommand = void 0;
const fs = require("fs-extra");
const path = require("path");
const command_1 = require("@oclif/command");
const path_1 = require("../../../utils/path");
const download_1 = require("../../../utils/download");
const flags_1 = require("../../../utils/flags");
class ImportCommand extends command_1.Command {
    async run() {
        const { args, flags } = this.parse(ImportCommand);
        const { filepath } = args;
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        const blockchainDBPath = path_1.getBlockchainDBPath(dataPath);
        if (path.extname(filepath) !== '.gz') {
            this.error('The blockchain data file must be a gzip file.');
        }
        if (fs.existsSync(blockchainDBPath)) {
            if (!flags.force) {
                this.error(`There is already a blockchain data file found at ${dataPath}. Use --force to override.`);
            }
            fs.removeSync(blockchainDBPath);
        }
        fs.ensureDirSync(blockchainDBPath);
        this.log(`Importing blockchain from ${path_1.getFullPath(filepath)}`);
        await download_1.extract(path.dirname(filepath), path.basename(filepath), blockchainDBPath);
        this.log('Import completed.');
        this.log(`   ${path_1.getFullPath(dataPath)}`);
    }
}
exports.ImportCommand = ImportCommand;
ImportCommand.description = 'Import from <FILE>.';
ImportCommand.args = [
    {
        name: 'filepath',
        required: true,
        description: 'Path to the gzipped blockchain data.',
    },
];
ImportCommand.examples = [
    'blockchain:import ./path/to/blockchain.db.tar.gz',
    'blockchain:import ./path/to/blockchain.db.tar.gz --data-path ./lisk/',
    'blockchain:import ./path/to/blockchain.db.tar.gz --data-path ./lisk/ --force',
];
ImportCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    force: command_1.flags.boolean({
        char: 'f',
        description: 'Delete and overwrite existing blockchain data',
        default: false,
    }),
};
//# sourceMappingURL=import.js.map