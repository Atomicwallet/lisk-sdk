"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var mnemonic_1 = require("../../utils/mnemonic");
var createAccount = function () {
    var passphrase = mnemonic_1.createMnemonicPassphrase();
    var _a = lisk_cryptography_1.getKeys(passphrase), privateKey = _a.privateKey, publicKey = _a.publicKey;
    var address = lisk_cryptography_1.getAddressFromPublicKey(publicKey);
    return {
        passphrase: passphrase,
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
    };
};
var CreateCommand = (function (_super) {
    tslib_1.__extends(CreateCommand, _super);
    function CreateCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreateCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var numberStr, numberOfAccounts, accounts;
            return tslib_1.__generator(this, function (_a) {
                numberStr = this.parse(CreateCommand).flags.number;
                numberOfAccounts = parseInt(numberStr, 10);
                if (numberStr !== numberOfAccounts.toString() ||
                    !Number.isInteger(numberOfAccounts) ||
                    numberOfAccounts <= 0) {
                    throw new Error('Number flag must be an integer and greater than 0');
                }
                accounts = new Array(numberOfAccounts).fill(0).map(createAccount);
                this.print(accounts);
                return [2];
            });
        });
    };
    CreateCommand.description = "\n\t\tReturns a randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.\n\t";
    CreateCommand.examples = ['account:create', 'account:create --number=3'];
    CreateCommand.flags = tslib_1.__assign({}, base_1.default.flags, { number: command_1.flags.string({
            char: 'n',
            description: 'Number of accounts to create.',
            default: '1',
        }) });
    return CreateCommand;
}(base_1.default));
exports.default = CreateCommand;
//# sourceMappingURL=create.js.map