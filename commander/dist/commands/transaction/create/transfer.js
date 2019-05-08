'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../../base'));
var flags_1 = require('../../../utils/flags');
var input_1 = require('../../../utils/input');
var dataFlag = {
	char: 'd',
	description:
		'Optional UTF8 encoded data (maximum of 64 bytes) to include in the transaction asset.\n\tExamples:\n\t- --data=customInformation\n',
};
var processInputs = function(amount, address, data) {
	return function(_a) {
		var passphrase = _a.passphrase,
			secondPassphrase = _a.secondPassphrase;
		return lisk_transactions_1.transfer({
			recipientId: address,
			amount: amount,
			data: data,
			passphrase: passphrase,
			secondPassphrase: secondPassphrase,
		});
	};
};
var TransferCommand = (function(_super) {
	tslib_1.__extends(TransferCommand, _super);
	function TransferCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	TransferCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				_b,
				passphraseSource,
				secondPassphraseSource,
				noSignature,
				dataString,
				amount,
				address,
				normalizedAmount,
				processFunction,
				noSignatureResult,
				inputs,
				result;
			return tslib_1.__generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						(_a = this.parse(TransferCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(passphraseSource = _b.passphrase),
							(secondPassphraseSource = _b['second-passphrase']),
							(noSignature = _b['no-signature']),
							(dataString = _b.data);
						(amount = args.amount), (address = args.address);
						lisk_transactions_1.utils.validateAddress(address);
						normalizedAmount = lisk_transactions_1.utils.convertLSKToBeddows(
							amount,
						);
						processFunction = processInputs(
							normalizedAmount,
							address,
							dataString,
						);
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
	TransferCommand.args = [
		{
			name: 'amount',
			required: true,
			description: 'Amount of LSK to send.',
		},
		{
			name: 'address',
			required: true,
			description: 'Address of the recipient.',
		},
	];
	TransferCommand.description =
		'\n\tCreates a transaction which will transfer the specified amount to an address if broadcast to the network.\n\t\t';
	TransferCommand.examples = [
		'transaction:create:transfer 100 13356260975429434553L',
	];
	TransferCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase),
		'no-signature': command_1.flags.boolean(flags_1.flags.noSignature),
		data: command_1.flags.string(dataFlag),
	});
	return TransferCommand;
})(base_1.default);
exports.default = TransferCommand;
//# sourceMappingURL=transfer.js.map
