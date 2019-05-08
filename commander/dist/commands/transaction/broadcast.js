'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../../base'));
var api_1 = require('../../utils/api');
var error_1 = require('../../utils/error');
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
var BroadcastCommand = (function(_super) {
	tslib_1.__extends(BroadcastCommand, _super);
	function BroadcastCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	BroadcastCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var transaction,
				transactionInput,
				_a,
				transactionObject,
				client,
				response;
			return tslib_1.__generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						transaction = this.parse(BroadcastCommand).args.transaction;
						_a = transaction;
						if (_a) return [3, 2];
						return [4, getTransactionInput()];
					case 1:
						_a = _b.sent();
						_b.label = 2;
					case 2:
						transactionInput = _a;
						transactionObject = transactions_1.parseTransactionString(
							transactionInput,
						);
						client = api_1.getAPIClient(this.userConfig.api);
						return [4, client.transactions.broadcast(transactionObject)];
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
			name: 'transaction',
			description: 'Transaction to broadcast in JSON format.',
		},
	];
	BroadcastCommand.description =
		'\n\tBroadcasts a transaction to the network via the node specified in the current config.\n\tAccepts a stringified JSON transaction as an argument, or a transaction can be piped from a previous command.\n\tIf piping make sure to quote out the entire command chain to avoid piping-related conflicts in your shell.\n\t';
	BroadcastCommand.examples = [
		'broadcast transaction \'{"type":0,"amount":"100",...}\'',
		'echo \'{"type":0,"amount":"100",...}\' | lisk transaction:broadcast',
	];
	BroadcastCommand.flags = tslib_1.__assign({}, base_1.default.flags);
	return BroadcastCommand;
})(base_1.default);
exports.default = BroadcastCommand;
//# sourceMappingURL=broadcast.js.map
