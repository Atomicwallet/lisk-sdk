"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const base_1 = require("../../base");
const error_1 = require("../../utils/error");
const flags_1 = require("../../utils/flags");
const reader_1 = require("../../utils/reader");
const processInputs = (recipientPublicKey, passphrase, message) => {
    if (!message) {
        throw new error_1.ValidationError('No message was provided.');
    }
    return {
        ...lisk_cryptography_1.encryptMessageWithPassphrase(message, passphrase, Buffer.from(recipientPublicKey, 'hex')),
        recipientPublicKey,
    };
};
class EncryptCommand extends base_1.default {
    async run() {
        const { args, flags: { passphrase: passphraseSource, message: messageSource }, } = this.parse(EncryptCommand);
        const { recipientPublicKey, message } = args;
        if (!message && !messageSource) {
            throw new error_1.ValidationError('No message was provided.');
        }
        const passphrase = passphraseSource !== null && passphraseSource !== void 0 ? passphraseSource : (await reader_1.getPassphraseFromPrompt('passphrase', true));
        const dataFromSource = messageSource && reader_1.isFileSource(messageSource)
            ? await reader_1.readFileSource(messageSource)
            : messageSource;
        const result = processInputs(recipientPublicKey, passphrase, message !== null && message !== void 0 ? message : dataFromSource);
        this.print(result);
    }
}
exports.default = EncryptCommand;
EncryptCommand.args = [
    {
        name: 'recipientPublicKey',
        description: 'Public key of the recipient of the message.',
        required: true,
    },
    {
        name: 'message',
        description: 'Message to encrypt.',
    },
];
EncryptCommand.description = `
	Encrypts a message for a given recipient public key using your secret passphrase.
	`;
EncryptCommand.examples = [
    'message:encrypt bba7e2e6a4639c431b68e31115a71ffefcb4e025a4d1656405dfdcd8384719e0 "Hello world"',
];
EncryptCommand.flags = {
    ...base_1.default.flags,
    passphrase: command_1.flags.string(flags_1.flags.passphrase),
    message: command_1.flags.string(flags_1.flags.message),
};
//# sourceMappingURL=encrypt.js.map