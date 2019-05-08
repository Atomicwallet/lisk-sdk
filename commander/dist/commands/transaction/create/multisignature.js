"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_transactions_1 = require("@liskhq/lisk-transactions");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../../base"));
var flags_1 = require("../../../utils/flags");
var helpers_1 = require("../../../utils/helpers");
var input_1 = require("../../../utils/input");
var processInputs = function (lifetime, minimum, keysgroup) { return function (_a) {
    var passphrase = _a.passphrase, secondPassphrase = _a.secondPassphrase;
    return lisk_transactions_1.registerMultisignature({
        passphrase: passphrase,
        secondPassphrase: secondPassphrase,
        keysgroup: keysgroup,
        lifetime: lifetime,
        minimum: minimum,
    });
}; };
var MultisignatureCommand = (function (_super) {
    tslib_1.__extends(MultisignatureCommand, _super);
    function MultisignatureCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MultisignatureCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, _b, passphraseSource, secondPassphraseSource, noSignature, lifetime, minimum, keysgroupStr, keysgroup, transactionLifetime, transactionMinimumConfirmations, processFunction, noSignatureResult, inputs, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(MultisignatureCommand), args = _a.args, _b = _a.flags, passphraseSource = _b.passphrase, secondPassphraseSource = _b["second-passphrase"], noSignature = _b["no-signature"];
                        lifetime = args.lifetime, minimum = args.minimum, keysgroupStr = args.keysgroup;
                        keysgroup = keysgroupStr.split(',');
                        lisk_transactions_1.utils.validatePublicKeys(keysgroup);
                        helpers_1.validateLifetime(lifetime);
                        helpers_1.validateMinimum(minimum);
                        transactionLifetime = parseInt(lifetime, 10);
                        transactionMinimumConfirmations = parseInt(minimum, 10);
                        processFunction = processInputs(transactionLifetime, transactionMinimumConfirmations, keysgroup);
                        if (noSignature) {
                            noSignatureResult = processFunction({
                                passphrase: undefined,
                                secondPassphrase: undefined,
                            });
                            this.print(noSignatureResult);
                            return [2];
                        }
                        return [4, input_1.getInputsFromSources({
                                passphrase: {
                                    source: passphraseSource,
                                    repeatPrompt: true,
                                },
                                secondPassphrase: !secondPassphraseSource
                                    ? undefined
                                    : {
                                        source: secondPassphraseSource,
                                        repeatPrompt: true,
                                    },
                            })];
                    case 1:
                        inputs = _c.sent();
                        result = processFunction(inputs);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
    MultisignatureCommand.args = [
        {
            name: 'lifetime',
            required: true,
            description: 'Number of hours the transaction should remain in the transaction pool before becoming invalid.',
        },
        {
            name: 'minimum',
            required: true,
            description: 'Minimum number of signatures required for a transaction from the account to be valid.',
        },
        {
            name: 'keysgroup',
            required: true,
            description: 'Public keys to verify signatures against for the multisignature group.',
        },
    ];
    MultisignatureCommand.description = "\n\tCreates a transaction which will register the account as a multisignature account if broadcast to the network, using the following arguments:\n\t\t1. Number of hours the transaction should remain in the transaction pool before becoming invalid.\n\t\t2. Minimum number of signatures required for a transaction from the account to be valid.\n\t\t3. Public keys to verify signatures against for the multisignature group.\n\t";
    MultisignatureCommand.examples = [
        'transaction:create:multisignature 24 2 215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca,922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
    ];
    MultisignatureCommand.flags = tslib_1.__assign({}, base_1.default.flags, { passphrase: command_1.flags.string(flags_1.flags.passphrase), 'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase), 'no-signature': command_1.flags.boolean(flags_1.flags.noSignature) });
    return MultisignatureCommand;
}(base_1.default));
exports.default = MultisignatureCommand;
//# sourceMappingURL=multisignature.js.map