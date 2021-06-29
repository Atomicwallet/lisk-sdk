"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommand = void 0;
const cryptography = require("@liskhq/lisk-cryptography");
const validator = require("@liskhq/lisk-validator");
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const path = require("path");
const commons_1 = require("../../../utils/commons");
const flags_1 = require("../../../utils/flags");
const reader_1 = require("../../../utils/reader");
class ConfigCommand extends command_1.Command {
    async run() {
        const { flags: { count, distance, output, passphrase: passphraseSource, password: passwordSource, pretty, }, } = this.parse(ConfigCommand);
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
        const hashOnion = { count, distance, hashes };
        const passphrase = passphraseSource !== null && passphraseSource !== void 0 ? passphraseSource : (await reader_1.getPassphraseFromPrompt('passphrase', true));
        const address = cryptography.getAddressFromPassphrase(passphrase).toString('hex');
        const password = passwordSource !== null && passwordSource !== void 0 ? passwordSource : (await reader_1.getPasswordFromPrompt('password', true));
        const { encryptedPassphrase } = commons_1.encryptPassphrase(passphrase, password, false);
        const message = { address, encryptedPassphrase, hashOnion };
        if (output) {
            if (pretty) {
                fs.writeJSONSync(output, message, { spaces: ' ' });
            }
            else {
                fs.writeJSONSync(output, message);
            }
        }
        else {
            this.printJSON(message, pretty);
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
exports.ConfigCommand = ConfigCommand;
ConfigCommand.description = 'Generate delegate forging config for given passphrase and password.';
ConfigCommand.examples = [
    'forging:config',
    'forging:config --password your_password',
    'forging:config --passphrase your_passphrase --password your_password --pretty',
    'forging:config --count=1000000 --distance=2000 --output /tmp/forging_config.json',
];
ConfigCommand.flags = {
    password: flags_1.flagsWithParser.password,
    passphrase: flags_1.flagsWithParser.passphrase,
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
    output: flags_1.flagsWithParser.output,
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=config.js.map