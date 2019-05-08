"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_transactions_1 = require("@liskhq/lisk-transactions");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../../base"));
var error_1 = require("../../../utils/error");
var flags_1 = require("../../../utils/flags");
var input_1 = require("../../../utils/input");
exports.processInputs = function () { return function (_a) {
    var passphrase = _a.passphrase, secondPassphrase = _a.secondPassphrase;
    if (!secondPassphrase) {
        throw new error_1.ValidationError('No second passphrase was provided.');
    }
    return lisk_transactions_1.registerSecondPassphrase({
        passphrase: passphrase,
        secondPassphrase: secondPassphrase,
    });
}; };
var SecondPassphraseCommand = (function (_super) {
    tslib_1.__extends(SecondPassphraseCommand, _super);
    function SecondPassphraseCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SecondPassphraseCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, passphraseSource, secondPassphraseSource, noSignature, processFunction, inputs, _b, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(SecondPassphraseCommand).flags, passphraseSource = _a.passphrase, secondPassphraseSource = _a["second-passphrase"], noSignature = _a["no-signature"];
                        processFunction = exports.processInputs();
                        if (!noSignature) return [3, 2];
                        return [4, input_1.getInputsFromSources({
                                passphrase: undefined,
                                secondPassphrase: {
                                    source: secondPassphraseSource,
                                    repeatPrompt: true,
                                },
                            })];
                    case 1:
                        _b = _c.sent();
                        return [3, 4];
                    case 2: return [4, input_1.getInputsFromSources({
                            passphrase: {
                                source: passphraseSource,
                                repeatPrompt: true,
                            },
                            secondPassphrase: {
                                source: secondPassphraseSource,
                                repeatPrompt: true,
                            },
                        })];
                    case 3:
                        _b = _c.sent();
                        _c.label = 4;
                    case 4:
                        inputs = _b;
                        result = processFunction(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
    SecondPassphraseCommand.description = "\n\tCreates a transaction which will register a second passphrase for the account if broadcast to the network.\n\t";
    SecondPassphraseCommand.examples = ['transaction:create:second-passphrase'];
    SecondPassphraseCommand.flags = tslib_1.__assign({}, base_1.default.flags, { passphrase: command_1.flags.string(flags_1.flags.passphrase), 'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase), 'no-signature': command_1.flags.boolean(flags_1.flags.noSignature) });
    return SecondPassphraseCommand;
}(base_1.default));
exports.default = SecondPassphraseCommand;
//# sourceMappingURL=second-passphrase.js.map