'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../../base'));
var flags_1 = require('../../../utils/flags');
var input_1 = require('../../../utils/input');
var processInputs = function(username) {
	return function(_a) {
		var passphrase = _a.passphrase,
			secondPassphrase = _a.secondPassphrase;
		return lisk_transactions_1.registerDelegate({
			passphrase: passphrase,
			secondPassphrase: secondPassphrase,
			username: username,
		});
	};
};
var DelegateCommand = (function(_super) {
	tslib_1.__extends(DelegateCommand, _super);
	function DelegateCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	DelegateCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				_b,
				passphraseSource,
				secondPassphraseSource,
				noSignature,
				username,
				processFunction,
				noSignatureResult,
				inputs,
				result;
			return tslib_1.__generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						(_a = this.parse(DelegateCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(passphraseSource = _b.passphrase),
							(secondPassphraseSource = _b['second-passphrase']),
							(noSignature = _b['no-signature']);
						username = args.username;
						processFunction = processInputs(username);
						if (noSignature) {
							noSignatureResult = processFunction({
								passphrase: undefined,
								secondPassphrase: undefined,
							});
							this.print(noSignatureResult);
							return [2];
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
					case 1:
						inputs = _c.sent();
						result = processFunction(inputs);
						this.print(result);
						return [2];
				}
			});
		});
	};
	DelegateCommand.args = [
		{
			name: 'username',
			required: true,
			description: 'Username to register as a delegate.',
		},
	];
	DelegateCommand.description =
		'\n\tCreates a transaction which will register the account as a delegate candidate if broadcast to the network.\n\t';
	DelegateCommand.examples = ['transaction:create:delegate lightcurve'];
	DelegateCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase),
		'no-signature': command_1.flags.boolean(flags_1.flags.noSignature),
	});
	return DelegateCommand;
})(base_1.default);
exports.default = DelegateCommand;
//# sourceMappingURL=delegate.js.map
