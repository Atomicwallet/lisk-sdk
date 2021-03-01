"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const base_1 = require("../../base");
const error_1 = require("../../utils/error");
const flags_1 = require("../../utils/flags");
const reader_1 = require("../../utils/reader");
const processInputs = (publicKey, signature, message) => {
    if (!message) {
        throw new error_1.ValidationError('No message was provided.');
    }
    return {
        verified: lisk_cryptography_1.verifyMessageWithPublicKey({
            publicKey: Buffer.from(publicKey, 'hex'),
            signature: Buffer.from(signature, 'hex'),
            message,
        }),
    };
};
class VerifyCommand extends base_1.default {
    async run() {
        const { args, flags: { message: messageSource }, } = this.parse(VerifyCommand);
        const { publicKey, signature, message } = args;
        if (!message && !messageSource) {
            throw new error_1.ValidationError('No message was provided.');
        }
        const dataFromSource = messageSource && reader_1.isFileSource(messageSource)
            ? await reader_1.readFileSource(messageSource)
            : messageSource;
        const result = processInputs(publicKey, signature, message !== null && message !== void 0 ? message : dataFromSource);
        this.print(result);
    }
}
exports.default = VerifyCommand;
VerifyCommand.args = [
    {
        name: 'publicKey',
        description: 'Public key of the signer of the message.',
        required: true,
    },
    {
        name: 'signature',
        description: 'Signature to verify.',
        required: true,
    },
    {
        name: 'message',
        description: 'Message to verify.',
    },
];
VerifyCommand.description = `
	Verifies a signature for a message using the signer’s public key.
	`;
VerifyCommand.examples = [
    'message:verify 647aac1e2df8a5c870499d7ddc82236b1e10936977537a3844a6b05ea33f9ef6 2a3ca127efcf7b2bf62ac8c3b1f5acf6997cab62ba9fde3567d188edcbacbc5dc8177fb88d03a8691ce03348f569b121bca9e7a3c43bf5c056382f35ff843c09 "Hello world"',
];
VerifyCommand.flags = {
    ...base_1.default.flags,
    message: command_1.flags.string(flags_1.flags.message),
};
//# sourceMappingURL=verify.js.map