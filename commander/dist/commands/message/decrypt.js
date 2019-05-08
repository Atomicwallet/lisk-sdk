'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_cryptography_1 = require('@liskhq/lisk-cryptography');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var error_1 = require('../../utils/error');
var flags_1 = require('../../utils/flags');
var input_1 = require('../../utils/input');
var processInputs = function(nonce, senderPublicKey, message) {
	return function(_a) {
		var passphrase = _a.passphrase,
			data = _a.data;
		var targetMessage = message || data;
		if (!targetMessage) {
			throw new error_1.ValidationError('No message was provided.');
		}
		if (!passphrase) {
			throw new error_1.ValidationError('No passphrase was provided.');
		}
		return lisk_cryptography_1.decryptMessageWithPassphrase(
			targetMessage,
			nonce,
			passphrase,
			senderPublicKey,
		);
	};
};
var DecryptCommand = (function(_super) {
	tslib_1.__extends(DecryptCommand, _super);
	function DecryptCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	DecryptCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				_b,
				passphraseSource,
				messageSource,
				senderPublicKey,
				nonce,
				message,
				inputs,
				result;
			return tslib_1.__generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						(_a = this.parse(DecryptCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(passphraseSource = _b.passphrase),
							(messageSource = _b.message);
						(senderPublicKey = args.senderPublicKey),
							(nonce = args.nonce),
							(message = args.message);
						if (!message && !messageSource) {
							throw new error_1.ValidationError('No message was provided.');
						}
						return [
							4,
							input_1.getInputsFromSources({
								passphrase: {
									source: passphraseSource,
								},
								data: message
									? undefined
									: {
											source: messageSource,
									  },
							}),
						];
					case 1:
						inputs = _c.sent();
						result = processInputs(nonce, senderPublicKey, message)(inputs);
						this.print({ message: result });
						return [2];
				}
			});
		});
	};
	DecryptCommand.args = [
		{
			name: 'senderPublicKey',
			description: 'Public key of the sender of the message.',
			required: true,
		},
		{
			name: 'nonce',
			description: 'Nonce used during encryption.',
			required: true,
		},
		{
			name: 'message',
			description: 'Encrypted message.',
		},
	];
	DecryptCommand.description =
		'\n\tDecrypts a previously encrypted message from a given sender public key for a known nonce using your secret passphrase.\n\t';
	DecryptCommand.examples = [
		'message:decrypt bba7e2e6a4639c431b68e31115a71ffefcb4e025a4d1656405dfdcd8384719e0 4b800d90d54eda4d093b5e4e6bf9ed203bc90e1560bd628d dcaa605af45a4107a699755237b4c08e1ef75036743d7e4814dea7',
	];
	DecryptCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		message: command_1.flags.string(flags_1.flags.message),
	});
	return DecryptCommand;
})(base_1.default);
exports.default = DecryptCommand;
//# sourceMappingURL=decrypt.js.map
