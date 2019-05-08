"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var flags_1 = require("../../utils/flags");
var input_1 = require("../../utils/input");
var processInputs = function (message) { return function (_a) {
    var passphrase = _a.passphrase, data = _a.data;
    var targetMessage = message || data;
    if (!targetMessage) {
        throw new error_1.ValidationError('No message was provided.');
    }
    if (!passphrase) {
        throw new error_1.ValidationError('No passphrase was provided.');
    }
    return lisk_cryptography_1.signMessageWithPassphrase(targetMessage, passphrase);
}; };
var SignCommand = (function (_super) {
    tslib_1.__extends(SignCommand, _super);
    function SignCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, _b, passphraseSource, messageSource, message, inputs, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(SignCommand), args = _a.args, _b = _a.flags, passphraseSource = _b.passphrase, messageSource = _b.message;
                        message = args.message;
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
                        result = processInputs(message)(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
    SignCommand.args = [
        {
            name: 'message',
            description: 'Message to sign.',
        },
    ];
    SignCommand.description = "\n\tSigns a message using your secret passphrase.\n\t";
    SignCommand.examples = ['message:sign "Hello world"'];
    SignCommand.flags = tslib_1.__assign({}, base_1.default.flags, { passphrase: command_1.flags.string(flags_1.flags.passphrase), message: command_1.flags.string(flags_1.flags.message) });
    return SignCommand;
}(base_1.default));
exports.default = SignCommand;
//# sourceMappingURL=sign.js.map