'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_cryptography_1 = require('@liskhq/lisk-cryptography');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var error_1 = require('../../utils/error');
var flags_1 = require('../../utils/flags');
var input_1 = require('../../utils/input');
var passphraseOptionDescription =
	'Specifies a source for providing an encrypted passphrase to the command. If a string is provided directly as an argument, this option will be ignored. The encrypted passphrase must be provided via an argument or via this option. Sources must be one of `file` or `stdin`. In the case of `file`, a corresponding identifier must also be provided.\n\n\tNote: if both an encrypted passphrase and the password are passed via stdin, the password must be the first line.\n\n\tExamples:\n\t\t- --passphrase file:/path/to/my/encrypted_passphrase.txt (takes the first line only)\n\t\t- --passphrase stdin (takes the first line only)\n';
var processInputs = function(encryptedPassphrase) {
	return function(_a) {
		var password = _a.password,
			data = _a.data;
		var encryptedPassphraseTarget =
			encryptedPassphrase || input_1.getFirstLineFromString(data);
		if (!encryptedPassphraseTarget) {
			throw new error_1.ValidationError('No encrypted passphrase was provided');
		}
		if (!password) {
			throw new error_1.ValidationError('No password was provided');
		}
		var encryptedPassphraseObject = lisk_cryptography_1.parseEncryptedPassphrase(
			encryptedPassphraseTarget,
		);
		var passphrase = lisk_cryptography_1.decryptPassphraseWithPassword(
			encryptedPassphraseObject,
			password,
		);
		return { passphrase: passphrase };
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
				passwordSource,
				encryptedPassphrase,
				inputs,
				result;
			return tslib_1.__generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						(_a = this.parse(DecryptCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(passphraseSource = _b.passphrase),
							(passwordSource = _b.password);
						encryptedPassphrase = args.encryptedPassphrase;
						if (!encryptedPassphrase && !passphraseSource) {
							throw new error_1.ValidationError(
								'No encrypted passphrase was provided.',
							);
						}
						return [
							4,
							input_1.getInputsFromSources({
								password: {
									source: passwordSource,
								},
								data: encryptedPassphrase
									? undefined
									: {
											source: passphraseSource,
									  },
							}),
						];
					case 1:
						inputs = _c.sent();
						result = processInputs(encryptedPassphrase)(inputs);
						this.print(result);
						return [2];
				}
			});
		});
	};
	DecryptCommand.args = [
		{
			name: 'encryptedPassphrase',
			description: 'Encrypted passphrase to decrypt.',
		},
	];
	DecryptCommand.description =
		'\n\tDecrypts your secret passphrase using the password which was provided at the time of encryption.\n\t';
	DecryptCommand.examples = [
		'passphrase:decrypt "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c01112134317a63bcf3d41ea74e83b&version=1"',
	];
	DecryptCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		password: command_1.flags.string(flags_1.flags.password),
		passphrase: command_1.flags.string({
			description: passphraseOptionDescription,
		}),
	});
	return DecryptCommand;
})(base_1.default);
exports.default = DecryptCommand;
//# sourceMappingURL=decrypt.js.map
