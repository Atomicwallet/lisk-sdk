"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var transactions = tslib_1.__importStar(require("@liskhq/lisk-transactions"));
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var utils_1 = require("../../utils/input/utils");
var transactions_1 = require("../../utils/transactions");
var secondPublicKeyDescription = "Specifies a source for providing a second public key to the command. The second public key must be provided via this option. Sources must be one of `file` or `stdin`. In the case of `file`, a corresponding identifier must also be provided.\n\n\tNote: if both transaction and second public key are passed via stdin, the transaction must be the first line.\n\n\tExamples:\n\t- --second-public-key file:/path/to/my/message.txt\n\t- --second-public-key 790049f919979d5ea42cca7b7aa0812cbae8f0db3ee39c1fe3cef18e25b67951\n";
var getTransactionInput = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var data, e_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, utils_1.getStdIn({ dataIsRequired: true })];
            case 1:
                data = (_a.sent()).data;
                if (!data) {
                    throw new error_1.ValidationError('No transaction was provided.');
                }
                return [2, data];
            case 2:
                e_1 = _a.sent();
                throw new error_1.ValidationError('No transaction was provided.');
            case 3: return [2];
        }
    });
}); };
var processSecondPublicKey = function (secondPublicKey) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
    return [2, secondPublicKey.includes(':') ? utils_1.getData(secondPublicKey) : secondPublicKey];
}); }); };
var VerifyCommand = (function (_super) {
    tslib_1.__extends(VerifyCommand, _super);
    function VerifyCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VerifyCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, secondPublicKeySource, transaction, transactionInput, _b, transactionObject, secondPublicKey, _c, verified;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this.parse(VerifyCommand), args = _a.args, secondPublicKeySource = _a.flags["second-public-key"];
                        transaction = args.transaction;
                        _b = transaction;
                        if (_b) return [3, 2];
                        return [4, getTransactionInput()];
                    case 1:
                        _b = (_d.sent());
                        _d.label = 2;
                    case 2:
                        transactionInput = _b;
                        transactionObject = transactions_1.parseTransactionString(transactionInput);
                        if (!secondPublicKeySource) return [3, 4];
                        return [4, processSecondPublicKey(secondPublicKeySource)];
                    case 3:
                        _c = _d.sent();
                        return [3, 5];
                    case 4:
                        _c = undefined;
                        _d.label = 5;
                    case 5:
                        secondPublicKey = _c;
                        verified = transactions.utils.verifyTransaction(transactionObject, secondPublicKey);
                        this.print({ verified: verified });
                        return [2];
                }
            });
        });
    };
    VerifyCommand.args = [
        {
            name: 'transaction',
            description: 'Transaction to verify in JSON format.',
        },
    ];
    VerifyCommand.description = "\n\tVerifies a transaction has a valid signature.\n\t";
    VerifyCommand.examples = [
        'transaction:verify \'{"type":0,"amount":"100",...}\'',
        'transaction:verify \'{"type":0,"amount":"100",...}\' --second-public-key=647aac1e2df8a5c870499d7ddc82236b1e10936977537a3844a6b05ea33f9ef6',
    ];
    VerifyCommand.flags = tslib_1.__assign({}, base_1.default.flags, { 'second-public-key': command_1.flags.string({
            name: 'Second public key',
            description: secondPublicKeyDescription,
        }) });
    return VerifyCommand;
}(base_1.default));
exports.default = VerifyCommand;
//# sourceMappingURL=verify.js.map