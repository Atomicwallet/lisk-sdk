"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const base_1 = require("../../base");
const error_1 = require("../../utils/error");
const flags_1 = require("../../utils/flags");
const reader_1 = require("../../utils/reader");
const processInputs = (nonce, senderPublicKey, passphrase, message) => {
    if (!message) {
        throw new error_1.ValidationError('No message was provided.');
    }
    return lisk_cryptography_1.decryptMessageWithPassphrase(message, nonce, passphrase, Buffer.from(senderPublicKey, 'hex'));
};
class DecryptCommand extends base_1.default {
    async run() {
        const { args, flags: { passphrase: passphraseSource, message: messageSource }, } = this.parse(DecryptCommand);
        const { senderPublicKey, nonce, message } = args;
        if (!message && !messageSource) {
            throw new error_1.ValidationError('No message was provided.');
        }
        const passphrase = passphraseSource !== null && passphraseSource !== void 0 ? passphraseSource : (await reader_1.getPassphraseFromPrompt('passphrase'));
        const dataFromSource = messageSource && reader_1.isFileSource(messageSource)
            ? await reader_1.readFileSource(messageSource)
            : messageSource;
        const result = processInputs(nonce, senderPublicKey, passphrase, message !== null && message !== void 0 ? message : dataFromSource);
        this.print({ message: result });
    }
}
exports.default = DecryptCommand;
DecryptCommand.args = [
    {
        name: 'senderPublicKey',
        description: 'Public key of the sender of the message.',
        required: true,
    },
    {
        name: 'nonce',
        description: 'Nonce used during encryption.',
        required: true,
    },
    {
        name: 'message',
        description: 'Encrypted message.',
    },
];
DecryptCommand.description = `
	Decrypts a previously encrypted message from a given sender public key for a known nonce using your secret passphrase.
	`;
DecryptCommand.examples = [
    'message:decrypt bba7e2e6a4639c431b68e31115a71ffefcb4e025a4d1656405dfdcd8384719e0 4b800d90d54eda4d093b5e4e6bf9ed203bc90e1560bd628d dcaa605af45a4107a699755237b4c08e1ef75036743d7e4814dea7',
];
DecryptCommand.flags = {
    ...base_1.default.flags,
    passphrase: command_1.flags.string(flags_1.flags.passphrase),
    message: command_1.flags.string(flags_1.flags.message),
};
//# sourceMappingURL=decrypt.js.map