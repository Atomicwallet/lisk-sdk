"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const path_1 = require("path");
const tar = require("tar");
const flags_1 = require("../../../utils/flags");
const path_2 = require("../../../utils/path");
class ExportCommand extends command_1.Command {
    async run() {
        const { flags } = this.parse(ExportCommand);
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_2.getDefaultPath(this.config.pjson.name);
        const blockchainPath = path_2.getBlockchainDBPath(dataPath);
        const exportPath = flags.output ? flags.output : process.cwd();
        this.log('Exporting blockchain:');
        this.log(`   ${path_2.getFullPath(blockchainPath)}`);
        const filePath = path_1.join(exportPath, 'blockchain.db.tar.gz');
        await tar.create({
            gzip: true,
            file: filePath,
            cwd: path_1.join(dataPath, 'data'),
        }, ['blockchain.db']);
        this.log('Export completed:');
        this.log(`   ${filePath}`);
    }
}
exports.ExportCommand = ExportCommand;
ExportCommand.description = 'Export to <FILE>.';
ExportCommand.examples = [
    'blockchain:export',
    'blockchain:export --data-path ./data --output ./my/path/',
];
ExportCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    output: flags_1.flagsWithParser.output,
};
//# sourceMappingURL=export.js.map