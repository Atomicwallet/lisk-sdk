'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var start_1 = tslib_1.__importDefault(require('./start'));
var stop_1 = tslib_1.__importDefault(require('./stop'));
var RestartCommand = (function(_super) {
	tslib_1.__extends(RestartCommand, _super);
	function RestartCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	RestartCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, name, error_1;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(RestartCommand).args;
						name = args.name;
						_a.label = 1;
					case 1:
						_a.trys.push([1, 4, , 5]);
						return [4, stop_1.default.run([name])];
					case 2:
						_a.sent();
						return [4, start_1.default.run([name])];
					case 3:
						_a.sent();
						return [3, 5];
					case 4:
						error_1 = _a.sent();
						this.error(error_1);
						return [3, 5];
					case 5:
						return [2];
				}
			});
		});
	};
	RestartCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: true,
		},
	];
	RestartCommand.flags = {
		json: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.json, { hidden: true }),
		),
		pretty: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true }),
		),
	};
	RestartCommand.description = 'Restart Lisk Core instance.';
	RestartCommand.examples = ['core:restart mainnet-latest'];
	return RestartCommand;
})(base_1.default);
exports.default = RestartCommand;
//# sourceMappingURL=restart.js.map
