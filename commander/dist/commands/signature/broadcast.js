'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../../base'));
var api_1 = require('../../utils/api');
var error_1 = require('../../utils/error');
var utils_1 = require('../../utils/input/utils');
var getSignatureInput = function() {
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
						throw new error_1.ValidationError('No signature was provided.');
					}
					return [2, data];
				case 2:
					e_1 = _a.sent();
					throw new error_1.ValidationError('No signature was provided.');
				case 3:
					return [2];
			}
		});
	});
};
var BroadcastCommand = (function(_super) {
	tslib_1.__extends(BroadcastCommand, _super);
	function BroadcastCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	BroadcastCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args,
				signature,
				signatureInput,
				_a,
				signatureObject,
				client,
				response;
			return tslib_1.__generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						args = this.parse(BroadcastCommand).args;
						signature = args.signature;
						_a = signature;
						if (_a) return [3, 2];
						return [4, getSignatureInput()];
					case 1:
						_a = _b.sent();
						_b.label = 2;
					case 2:
						signatureInput = _a;
						try {
							signatureObject = JSON.parse(signatureInput);
						} catch (error) {
							throw new error_1.ValidationError(
								'Could not parse signature JSON. Did you use the `--json` option?',
							);
						}
						client = api_1.getAPIClient(this.userConfig.api);
						return [4, client.signatures.broadcast(signatureObject)];
					case 3:
						response = _b.sent();
						this.print(response.data);
						return [2];
				}
			});
		});
	};
	BroadcastCommand.args = [
		{
			name: 'signature',
			description: 'Signature to broadcast.',
		},
	];
	BroadcastCommand.description =
		'\n\tBroadcasts a signature for a transaction from a multisignature account.\n\tAccepts a stringified JSON signature as an argument, or a signature can be piped from a previous command.\n\tIf piping make sure to quote out the entire command chain to avoid piping-related conflicts in your shell.\n\t';
	BroadcastCommand.examples = [
		'signature:broadcast \'{"transactionId":"abcd1234","publicKey":"abcd1234","signature":"abcd1234"}\'',
		'echo \'{"transactionId":"abcd1234","publicKey":"abcd1234","signature":"abcd1234"}\' | lisk signature:broadcast',
	];
	BroadcastCommand.lags = tslib_1.__assign({}, base_1.default.flags);
	return BroadcastCommand;
})(base_1.default);
exports.default = BroadcastCommand;
//# sourceMappingURL=broadcast.js.map
