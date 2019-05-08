"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var flags_1 = require("../../utils/flags");
var input_1 = require("../../utils/input");
var outputPublicKeyOptionDescription = 'Includes the public key in the output. This option is provided for the convenience of node operators.';
var processInputs = function (outputPublicKey) { return function (_a) {
    var passphrase = _a.passphrase, password = _a.password;
    if (!passphrase) {
        throw new error_1.ValidationError('No passphrase was provided');
    }
    if (!password) {
        throw new error_1.ValidationError('No password was provided');
    }
    var encryptedPassphraseObject = lisk_cryptography_1.encryptPassphraseWithPassword(passphrase, password);
    var encryptedPassphrase = lisk_cryptography_1.stringifyEncryptedPassphrase(encryptedPassphraseObject);
    return outputPublicKey
        ? {
            encryptedPassphrase: encryptedPassphrase,
            publicKey: lisk_cryptography_1.getKeys(passphrase).publicKey,
        }
        : { encryptedPassphrase: encryptedPassphrase };
}; };
var EncryptCommand = (function (_super) {
    tslib_1.__extends(EncryptCommand, _super);
    function EncryptCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EncryptCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, passphraseSource, passwordSource, outputPublicKey, inputs, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.parse(EncryptCommand).flags, passphraseSource = _a.passphrase, passwordSource = _a.password, outputPublicKey = _a.outputPublicKey;
                        return [4, input_1.getInputsFromSources({
                                passphrase: {
                                    source: passphraseSource,
                                    repeatPrompt: true,
                                },
                                password: {
                                    source: passwordSource,
                                    repeatPrompt: true,
                                },
                            })];
                    case 1:
                        inputs = _b.sent();
                        result = processInputs(outputPublicKey)(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
    EncryptCommand.description = "\n\t\tEncrypts your secret passphrase under a password.\n\t";
    EncryptCommand.examples = ['passphrase:encrypt'];
    EncryptCommand.flags = tslib_1.__assign({}, base_1.default.flags, { password: command_1.flags.string(flags_1.flags.password), passphrase: command_1.flags.string(flags_1.flags.passphrase), outputPublicKey: command_1.flags.boolean({
            description: outputPublicKeyOptionDescription,
        }) });
    return EncryptCommand;
}(base_1.default));
exports.default = EncryptCommand;
//# sourceMappingURL=encrypt.js.map