'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var transactions = tslib_1.__importStar(require('@liskhq/lisk-transactions'));
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var api_1 = require('../../utils/api');
var error_1 = require('../../utils/error');
var flags_1 = require('../../utils/flags');
var input_1 = require('../../utils/input');
var STATUS_ENABLE = 'enable';
var STATUS_DISABLE = 'disable';
var processInput = function(client, status, publicKey, password) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		return tslib_1.__generator(this, function(_a) {
			if (!password) {
				throw new error_1.ValidationError('No password was provided.');
			}
			return [
				2,
				client.node
					.updateForgingStatus({
						password: password,
						publicKey: publicKey,
						forging: status === STATUS_ENABLE,
					})
					.then(function(response) {
						return response.data;
					}),
			];
		});
	});
};
var ForgingCommand = (function(_super) {
	tslib_1.__extends(ForgingCommand, _super);
	function ForgingCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	ForgingCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a, args, passwordSource, status, publicKey, client, password, result;
			return tslib_1.__generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						(_a = this.parse(ForgingCommand)),
							(args = _a.args),
							(passwordSource = _a.flags.password);
						(status = args.status), (publicKey = args.publicKey);
						transactions.utils.validatePublicKey(publicKey);
						client = api_1.getAPIClient(this.userConfig.api);
						return [
							4,
							input_1.getInputsFromSources({
								password: {
									source: passwordSource,
								},
							}),
						];
					case 1:
						password = _b.sent().password;
						return [4, processInput(client, status, publicKey, password)];
					case 2:
						result = _b.sent();
						this.print(result);
						return [2];
				}
			});
		});
	};
	ForgingCommand.args = [
		{
			name: 'status',
			options: [STATUS_ENABLE, STATUS_DISABLE],
			description: 'Desired forging status.',
			required: true,
		},
		{
			name: 'publicKey',
			description: 'Public key of the delegate whose status should be updated.',
			required: true,
		},
	];
	ForgingCommand.description =
		'Update the forging status of a Lisk Core instance.';
	ForgingCommand.examples = [
		'node:forging enable 647aac1e2df8a5c870499d7ddc82236b1e10936977537a3844a6b05ea33f9ef6',
		'node:forging disable 647aac1e2df8a5c870499d7ddc82236b1e10936977537a3844a6b05ea33f9ef6',
	];
	ForgingCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		password: command_1.flags.string(flags_1.flags.password),
	});
	return ForgingCommand;
})(base_1.default);
exports.default = ForgingCommand;
//# sourceMappingURL=forging.js.map
