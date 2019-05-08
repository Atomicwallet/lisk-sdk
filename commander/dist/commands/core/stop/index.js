'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var listr_1 = tslib_1.__importDefault(require('listr'));
var base_1 = tslib_1.__importDefault(require('../../../base'));
var pm2_1 = require('../../../utils/core/pm2');
var cache_1 = tslib_1.__importDefault(require('./cache'));
var database_1 = tslib_1.__importDefault(require('./database'));
var StopCommand = (function(_super) {
	tslib_1.__extends(StopCommand, _super);
	function StopCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	StopCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, name, tasks;
			var _this = this;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(StopCommand).args;
						name = args.name;
						return [4, cache_1.default.run([name])];
					case 1:
						_a.sent();
						return [4, database_1.default.run([name])];
					case 2:
						_a.sent();
						tasks = new listr_1.default([
							{
								title: 'Stop Lisk Core instance',
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [4, pm2_1.stopApplication(name)];
												case 1:
													_a.sent();
													return [2];
											}
										});
									});
								},
							},
						]);
						return [4, tasks.run()];
					case 3:
						_a.sent();
						return [2];
				}
			});
		});
	};
	StopCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: true,
		},
	];
	StopCommand.flags = {
		json: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.json, { hidden: true }),
		),
		pretty: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true }),
		),
	};
	StopCommand.description = 'Stop Lisk Core instance.';
	StopCommand.examples = ['core:stop mainnet-latest'];
	return StopCommand;
})(base_1.default);
exports.default = StopCommand;
//# sourceMappingURL=index.js.map
