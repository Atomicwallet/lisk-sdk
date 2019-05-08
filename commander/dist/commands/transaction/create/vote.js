'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../../base'));
var error_1 = require('../../../utils/error');
var flags_1 = require('../../../utils/flags');
var input_1 = require('../../../utils/input');
var utils_1 = require('../../../utils/input/utils');
var processInputs = function(votes, unvotes) {
	return function(_a) {
		var passphrase = _a.passphrase,
			secondPassphrase = _a.secondPassphrase;
		return lisk_transactions_1.castVotes({
			passphrase: passphrase,
			votes: votes,
			unvotes: unvotes,
			secondPassphrase: secondPassphrase,
		});
	};
};
var processVotesInput = function(votes) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		return tslib_1.__generator(this, function(_a) {
			return [2, votes.includes(':') ? utils_1.getData(votes) : votes];
		});
	});
};
var processVotes = function(votes) {
	return votes
		.replace(/\n/g, ',')
		.split(',')
		.filter(Boolean)
		.map(function(vote) {
			return vote.trim();
		});
};
var validatePublicKeys = function(inputs) {
	lisk_transactions_1.utils.validatePublicKeys(inputs);
	return inputs;
};
var VoteCommand = (function(_super) {
	tslib_1.__extends(VoteCommand, _super);
	function VoteCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	VoteCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				passphraseSource,
				secondPassphraseSource,
				noSignature,
				votes,
				unvotes,
				processedVotesInput,
				_b,
				processedUnvotesInput,
				_c,
				validatedVotes,
				validatedUnvotes,
				processFunction,
				noSignatureResult,
				inputs,
				result;
			return tslib_1.__generator(this, function(_d) {
				switch (_d.label) {
					case 0:
						(_a = this.parse(VoteCommand).flags),
							(passphraseSource = _a.passphrase),
							(secondPassphraseSource = _a['second-passphrase']),
							(noSignature = _a['no-signature']),
							(votes = _a.votes),
							(unvotes = _a.unvotes);
						if (!votes && !unvotes) {
							throw new error_1.ValidationError(
								'At least one of votes and/or unvotes options must be provided.',
							);
						}
						if (votes === unvotes) {
							throw new error_1.ValidationError(
								'Votes and unvotes sources must not be the same.',
							);
						}
						if (!votes) return [3, 2];
						return [4, processVotesInput(votes.toString())];
					case 1:
						_b = _d.sent();
						return [3, 3];
					case 2:
						_b = undefined;
						_d.label = 3;
					case 3:
						processedVotesInput = _b;
						if (!unvotes) return [3, 5];
						return [4, processVotesInput(unvotes.toString())];
					case 4:
						_c = _d.sent();
						return [3, 6];
					case 5:
						_c = undefined;
						_d.label = 6;
					case 6:
						processedUnvotesInput = _c;
						validatedVotes = processedVotesInput
							? validatePublicKeys(processVotes(processedVotesInput))
							: [];
						validatedUnvotes = processedUnvotesInput
							? validatePublicKeys(processVotes(processedUnvotesInput))
							: [];
						processFunction = processInputs(validatedVotes, validatedUnvotes);
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
					case 7:
						inputs = _d.sent();
						result = processFunction(inputs);
						this.print(result);
						return [2];
				}
			});
		});
	};
	VoteCommand.description =
		'\n\tCreates a transaction which will cast votes (or unvotes) for delegate candidates using their public keys if broadcast to the network.\n\t';
	VoteCommand.examples = [
		'transaction:create:vote --votes 215b667a32a5cd51a94c9c2046c11fffb08c65748febec099451e3b164452bca,922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa --unvotes e01b6b8a9b808ec3f67a638a2d3fa0fe1a9439b91dbdde92e2839c3327bd4589,ac09bc40c889f688f9158cca1fcfcdf6320f501242e0f7088d52a5077084ccba',
	];
	VoteCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase),
		'no-signature': command_1.flags.boolean(flags_1.flags.noSignature),
		votes: command_1.flags.string(flags_1.flags.votes),
		unvotes: command_1.flags.string(flags_1.flags.unvotes),
	});
	return VoteCommand;
})(base_1.default);
exports.default = VoteCommand;
//# sourceMappingURL=vote.js.map
