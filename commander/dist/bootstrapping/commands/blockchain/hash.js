"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashCommand = void 0;
const crypto = require("crypto");
const command_1 = require("@oclif/command");
const path_1 = require("../../../utils/path");
const application_1 = require("../../../utils/application");
const db_1 = require("../../../utils/db");
const flags_1 = require("../../../utils/flags");
class HashCommand extends command_1.Command {
    async run() {
        const { flags } = this.parse(HashCommand);
        const dataPath = flags['data-path']
            ? flags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        const blockchainPath = path_1.getBlockchainDBPath(dataPath);
        if (application_1.isApplicationRunning(dataPath)) {
            const errorMessage = `Can't generate hash for a running application. Application at data path ${dataPath} is running with pid ${application_1.getPid(dataPath)}.`;
            this.error(errorMessage);
            return;
        }
        this.debug('Compressing data to generate hash.');
        this.debug(`   ${path_1.getFullPath(blockchainPath)}`);
        const db = db_1.getBlockchainDB(dataPath);
        const stream = db.createReadStream({
            keys: false,
            values: true,
        });
        const dbHash = crypto.createHash('sha256');
        const hash = await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                dbHash.update(chunk);
            });
            stream.on('error', error => {
                reject(error);
            });
            stream.on('end', () => {
                resolve(dbHash.digest());
            });
        });
        this.debug('Hash generation completed.');
        this.log(hash.toString('hex'));
    }
}
exports.HashCommand = HashCommand;
HashCommand.description = 'Generate SHA256 hash from <PATH>.';
HashCommand.examples = ['blockchain:hash', 'blockchain:hash --data-path ./data'];
HashCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
};
//# sourceMappingURL=hash.js.map