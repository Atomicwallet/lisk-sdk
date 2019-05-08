"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var flags_1 = require("../../utils/flags");
var input_1 = require("../../utils/input");
var processInputs = function (recipientPublicKey, message) { return function (_a) {
    var passphrase = _a.passphrase, data = _a.data;
    var targetMessage = message || data;
    if (!targetMessage) {
        throw new error_1.ValidationError('No message was provided.');
    }
    if (!passphrase) {
        throw new error_1.ValidationError('No passphrase was provided.');
    }
    return tslib_1.__assign({}, lisk_cryptography_1.encryptMessageWithPassphrase(targetMessage, passphrase, recipientPublicKey), { recipientPublicKey: recipientPublicKey });
}; };
var EncryptCommand = (function (_super) {
    tslib_1.__extends(EncryptCommand, _super);
    function EncryptCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EncryptCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, _b, passphraseSource, messageSource, recipientPublicKey, message, inputs, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(EncryptCommand), args = _a.args, _b = _a.flags, passphraseSource = _b.passphrase, messageSource = _b.message;
                        recipientPublicKey = args.recipientPublicKey, message = args.message;
                        if (!message && !messageSource) {
                            throw new error_1.ValidationError('No message was provided.');
                        }
                        return [4, input_1.getInputsFromSources({
                                passphrase: {
                                    source: passphraseSource,
                                    repeatPrompt: true,
                                },
                                data: message
                                    ? undefined
                                    : {
                                        source: messageSource,
                                    },
                            })];
                    case 1:
                        inputs = _c.sent();
                        result = processInputs(recipientPublicKey, message)(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
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
    EncryptCommand.description = "\n\tEncrypts a message for a given recipient public key using your secret passphrase.\n\t";
    EncryptCommand.examples = [
        'message:encrypt bba7e2e6a4639c431b68e31115a71ffefcb4e025a4d1656405dfdcd8384719e0 "Hello world"',
    ];
    EncryptCommand.flags = tslib_1.__assign({}, base_1.default.flags, { passphrase: command_1.flags.string(flags_1.flags.passphrase), message: command_1.flags.string(flags_1.flags.message) });
    return EncryptCommand;
}(base_1.default));
exports.default = EncryptCommand;
//# sourceMappingURL=encrypt.js.map