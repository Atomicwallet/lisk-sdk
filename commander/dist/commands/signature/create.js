"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var transactions = tslib_1.__importStar(require("@liskhq/lisk-transactions"));
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var error_1 = require("../../utils/error");
var flags_1 = require("../../utils/flags");
var input_1 = require("../../utils/input");
var utils_1 = require("../../utils/input/utils");
var transactions_1 = require("../../utils/transactions");
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
var CreateCommand = (function (_super) {
    tslib_1.__extends(CreateCommand, _super);
    function CreateCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreateCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, passphraseSource, transaction, transactionInput, _b, transactionObject, valid, passphrase, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(CreateCommand), args = _a.args, passphraseSource = _a.flags.passphrase;
                        transaction = args.transaction;
                        _b = transaction;
                        if (_b) return [3, 2];
                        return [4, getTransactionInput()];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        transactionInput = _b;
                        transactionObject = transactions_1.parseTransactionString(transactionInput);
                        valid = transactions.utils.validateTransaction(transactionObject).valid;
                        if (!valid) {
                            throw new Error('Provided transaction is invalid.');
                        }
                        return [4, input_1.getInputsFromSources({
                                passphrase: {
                                    source: passphraseSource,
                                    repeatPrompt: true,
                                },
                            })];
                    case 3:
                        passphrase = (_c.sent()).passphrase;
                        if (!passphrase) {
                            throw new error_1.ValidationError('No passphrase was provided.');
                        }
                        result = transactions.createSignatureObject(transactionObject, passphrase);
                        this.print(result);
                        return [2];
                }
            });
        });
    };
    CreateCommand.args = [
        {
            name: 'transaction',
            description: 'Transaction in JSON format.',
        },
    ];
    CreateCommand.description = "\n\tCreate a signature object for a transaction from a multisignature account.\n\tAccepts a stringified JSON transaction as an argument.\n\t";
    CreateCommand.examples = [
        'signature:create \'{"amount":"10","recipientId":"8050281191221330746L","senderPublicKey":"3358a1562f9babd523a768e700bb12ad58f230f84031055802dc0ea58cef1e1b","timestamp":59353522,"type":0,"asset":{},"signature":"b84b95087c381ad25b5701096e2d9366ffd04037dcc941cd0747bfb0cf93111834a6c662f149018be4587e6fc4c9f5ba47aa5bbbd3dd836988f153aa8258e604"}\'',
    ];
    CreateCommand.flags = tslib_1.__assign({}, base_1.default.flags, { passphrase: command_1.flags.string(flags_1.flags.passphrase) });
    return CreateCommand;
}(base_1.default));
exports.default = CreateCommand;
//# sourceMappingURL=create.js.map