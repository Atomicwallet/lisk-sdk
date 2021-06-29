"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashOnionCommand = void 0;
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const path = require("path");
const cryptography = require("@liskhq/lisk-cryptography");
const validator = require("@liskhq/lisk-validator");
const flags_1 = require("../../utils/flags");
class HashOnionCommand extends command_1.default {
    async run() {
        const { flags: { output, count, distance, pretty }, } = this.parse(HashOnionCommand);
        if (distance <= 0 || !validator.isValidInteger(distance)) {
            throw new Error('Distance flag must be an integer and greater than 0.');
        }
        if (count <= 0 || !validator.isValidInteger(count)) {
            throw new Error('Count flag must be an integer and greater than 0.');
        }
        if (output) {
            const { dir } = path.parse(output);
            fs.ensureDirSync(dir);
        }
        const seed = cryptography.generateHashOnionSeed();
        const hashBuffers = cryptography.hashOnion(seed, count, distance);
        const hashes = hashBuffers.map(buf => buf.toString('hex'));
        const result = { count, distance, hashes };
        if (output) {
            if (pretty) {
                fs.writeJSONSync(output, result, { spaces: ' ' });
            }
            else {
                fs.writeJSONSync(output, result);
            }
        }
        else {
            this.printJSON(result, pretty);
        }
    }
    printJSON(message, pretty = false) {
        if (pretty) {
            this.log(JSON.stringify(message, undefined, '  '));
        }
        else {
            this.log(JSON.stringify(message));
        }
    }
}
exports.HashOnionCommand = HashOnionCommand;
HashOnionCommand.description = 'Create hash onions to be used by the forger.';
HashOnionCommand.examples = [
    'hash-onion --count=1000000 --distance=2000 --pretty',
    'hash-onion --count=1000000 --distance=2000 --output ~/my_onion.json',
];
HashOnionCommand.flags = {
    output: command_1.flags.string({
        char: 'o',
        description: 'Output file path',
    }),
    count: command_1.flags.integer({
        char: 'c',
        description: 'Total number of hashes to produce',
        default: 1000000,
    }),
    distance: command_1.flags.integer({
        char: 'd',
        description: 'Distance between each hashes',
        default: 1000,
    }),
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=hash-onion.js.map