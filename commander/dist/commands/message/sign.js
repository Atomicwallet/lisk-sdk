"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const base_1 = require("../../base");
const error_1 = require("../../utils/error");
const flags_1 = require("../../utils/flags");
const reader_1 = require("../../utils/reader");
const processInputs = (passphrase, message) => {
    if (!message) {
        throw new error_1.ValidationError('No message was provided.');
    }
    const signedMessageWithOnePassphrase = lisk_cryptography_1.signMessageWithPassphrase(message, passphrase);
    return {
        ...signedMessageWithOnePassphrase,
        publicKey: signedMessageWithOnePassphrase.publicKey.toString('hex'),
        signature: signedMessageWithOnePassphrase.signature.toString('hex'),
    };
};
class SignCommand extends base_1.default {
    async run() {
        const { args, flags: { passphrase: passphraseSource, message: messageSource }, } = this.parse(SignCommand);
        const { message } = args;
        if (!message && !messageSource) {
            throw new error_1.ValidationError('No message was provided.');
        }
        const passphrase = passphraseSource !== null && passphraseSource !== void 0 ? passphraseSource : (await reader_1.getPassphraseFromPrompt('passphrase', true));
        const dataFromSource = messageSource && reader_1.isFileSource(messageSource)
            ? await reader_1.readFileSource(messageSource)
            : messageSource;
        const result = processInputs(passphrase, message !== null && message !== void 0 ? message : dataFromSource);
        this.print(result);
    }
}
exports.default = SignCommand;
SignCommand.args = [
    {
        name: 'message',
        description: 'Message to sign.',
    },
];
SignCommand.description = `
	Signs a message using your secret passphrase.
	`;
SignCommand.examples = ['message:sign "Hello world"'];
SignCommand.flags = {
    ...base_1.default.flags,
    passphrase: command_1.flags.string(flags_1.flags.passphrase),
    message: command_1.flags.string(flags_1.flags.message),
};
//# sourceMappingURL=sign.js.map