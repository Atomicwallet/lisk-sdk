"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var flags_1 = require("../../utils/flags");
var input_1 = require("../../utils/input");
var processInputs = function (publicKey, signature, message) { return function (_a) {
    var data = _a.data;
    var targetMessage = message || data;
    if (!targetMessage) {
        throw new error_1.ValidationError('No message was provided.');
    }
    return {
        verified: lisk_cryptography_1.verifyMessageWithPublicKey({
            publicKey: publicKey,
            signature: signature,
            message: targetMessage,
        }),
    };
}; };
var VerifyCommand = (function (_super) {
    tslib_1.__extends(VerifyCommand, _super);
    function VerifyCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VerifyCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, messageSource, publicKey, signature, message, inputs, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.parse(VerifyCommand), args = _a.args, messageSource = _a.flags.message;
                        publicKey = args.publicKey, signature = args.signature, message = args.message;
                        if (!message && !messageSource) {
                            throw new error_1.ValidationError('No message was provided.');
                        }
                        return [4, input_1.getInputsFromSources({
                                data: message ? undefined : { source: messageSource },
                            })];
                    case 1:
                        inputs = _b.sent();
                        result = processInputs(publicKey, signature, message)(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
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
    VerifyCommand.description = "\n\tVerifies a signature for a message using the signer\u2019s public key.\n\t";
    VerifyCommand.examples = [
        'message:verify 647aac1e2df8a5c870499d7ddc82236b1e10936977537a3844a6b05ea33f9ef6 2a3ca127efcf7b2bf62ac8c3b1f5acf6997cab62ba9fde3567d188edcbacbc5dc8177fb88d03a8691ce03348f569b121bca9e7a3c43bf5c056382f35ff843c09 "Hello world"',
    ];
    VerifyCommand.flags = tslib_1.__assign({}, base_1.default.flags, { message: command_1.flags.string(flags_1.flags.message) });
    return VerifyCommand;
}(base_1.default));
exports.default = VerifyCommand;
//# sourceMappingURL=verify.js.map