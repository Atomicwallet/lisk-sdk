'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_cryptography_1 = require('@liskhq/lisk-cryptography');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var error_1 = require('../../utils/error');
var flags_1 = require('../../utils/flags');
var input_1 = require('../../utils/input');
var processInput = function(_a) {
	var passphrase = _a.passphrase;
	if (!passphrase) {
		throw new error_1.ValidationError('Passphrase cannot be empty');
	}
	var _b = lisk_cryptography_1.getKeys(passphrase),
		privateKey = _b.privateKey,
		publicKey = _b.publicKey;
	var address = lisk_cryptography_1.getAddressFromPublicKey(publicKey);
	return {
		privateKey: privateKey,
		publicKey: publicKey,
		address: address,
	};
};
var ShowCommand = (function(_super) {
	tslib_1.__extends(ShowCommand, _super);
	function ShowCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	ShowCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var passphraseSource, input;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						passphraseSource = this.parse(ShowCommand).flags.passphrase;
						return [
							4,
							input_1.getInputsFromSources({
								passphrase: {
									source: passphraseSource,
									repeatPrompt: true,
								},
							}),
						];
					case 1:
						input = _a.sent();
						this.print(processInput(input));
						return [2];
				}
			});
		});
	};
	ShowCommand.description =
		'\n\t\tShows account information for a given passphrase.\n\t';
	ShowCommand.examples = ['account:show'];
	ShowCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
	});
	return ShowCommand;
})(base_1.default);
exports.default = ShowCommand;
//# sourceMappingURL=show.js.map
