"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecryptCommand = void 0;
const cryptography = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const flags_1 = require("../../../utils/flags");
const reader_1 = require("../../../utils/reader");
const processInputs = (password, encryptedPassphrase) => {
    const encryptedPassphraseObject = cryptography.parseEncryptedPassphrase(encryptedPassphrase);
    const passphrase = cryptography.decryptPassphraseWithPassword(encryptedPassphraseObject, password);
    return { passphrase };
};
class DecryptCommand extends command_1.default {
    async run() {
        const { args, flags: { password: passwordSource, pretty }, } = this.parse(DecryptCommand);
        const { encryptedPassphrase } = args;
        const password = passwordSource !== null && passwordSource !== void 0 ? passwordSource : (await reader_1.getPasswordFromPrompt('password', true));
        const result = processInputs(password, encryptedPassphrase);
        this.printJSON(result, pretty);
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
exports.DecryptCommand = DecryptCommand;
DecryptCommand.args = [
    {
        name: 'encryptedPassphrase',
        description: 'Encrypted passphrase to decrypt.',
        required: true,
    },
];
DecryptCommand.description = 'Decrypt secret passphrase using the password provided at the time of encryption.';
DecryptCommand.examples = [
    'passphrase:decrypt "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c01112134317a63bcf3d41ea74e83b&version=1"',
    'passphrase:decrypt "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c01112134317a63bcf3d41ea74e83b&version=1" --password your-password',
];
DecryptCommand.flags = {
    password: flags_1.flagsWithParser.password,
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=decrypt.js.map