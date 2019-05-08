'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var transactions = tslib_1.__importStar(require('@liskhq/lisk-transactions'));
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var error_1 = require('../../utils/error');
var flags_1 = require('../../utils/flags');
var input_1 = require('../../utils/input');
var utils_1 = require('../../utils/input/utils');
var transactions_1 = require('../../utils/transactions');
var getTransactionInput = function() {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var data, e_1;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [4, utils_1.getStdIn({ dataIsRequired: true })];
				case 1:
					data = _a.sent().data;
					if (!data) {
						throw new error_1.ValidationError('No transaction was provided.');
					}
					return [2, data];
				case 2:
					e_1 = _a.sent();
					throw new error_1.ValidationError('No transaction was provided.');
				case 3:
					return [2];
			}
		});
	});
};
var SignCommand = (function(_super) {
	tslib_1.__extends(SignCommand, _super);
	function SignCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	SignCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				_b,
				passphraseSource,
				secondPassphraseSource,
				transaction,
				transactionInput,
				_c,
				transactionObject,
				valid,
				_d,
				passphrase,
				secondPassphrase,
				result;
			return tslib_1.__generator(this, function(_e) {
				switch (_e.label) {
					case 0:
						(_a = this.parse(SignCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(passphraseSource = _b.passphrase),
							(secondPassphraseSource = _b['second-passphrase']);
						transaction = args.transaction;
						_c = transaction;
						if (_c) return [3, 2];
						return [4, getTransactionInput()];
					case 1:
						_c = _e.sent();
						_e.label = 2;
					case 2:
						transactionInput = _c;
						transactionObject = transactions_1.parseTransactionString(
							transactionInput,
						);
						valid = transactions.utils.validateTransaction(transactionObject)
							.valid;
						if (!valid) {
							throw new Error('Provided transaction is invalid.');
						}
						return [
							4,
							input_1.getInputsFromSources({
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
							}),
						];
					case 3:
						(_d = _e.sent()),
							(passphrase = _d.passphrase),
							(secondPassphrase = _d.secondPassphrase);
						result = transactions.utils.prepareTransaction(
							transactionObject,
							passphrase,
							secondPassphrase,
						);
						this.print(result);
						return [2];
				}
			});
		});
	};
	SignCommand.args = [
		{
			name: 'transaction',
			description: 'Transaction to sign in JSON format.',
		},
	];
	SignCommand.description =
		'\n\tSign a transaction using your secret passphrase.\n\t';
	SignCommand.examples = [
		'transaction:sign \'{"amount":"100","recipientId":"13356260975429434553L","senderPublicKey":null,"timestamp":52871598,"type":0,"fee":"10000000","recipientPublicKey":null,"asset":{}}\'',
	];
	SignCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase),
	});
	return SignCommand;
})(base_1.default);
exports.default = SignCommand;
//# sourceMappingURL=sign.js.map
