'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var listr_1 = tslib_1.__importDefault(require('listr'));
var base_1 = tslib_1.__importDefault(require('../../../base'));
var database_1 = require('../../../utils/core/database');
var pm2_1 = require('../../../utils/core/pm2');
var DatabaseCommand = (function(_super) {
	tslib_1.__extends(DatabaseCommand, _super);
	function DatabaseCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	DatabaseCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, name, installationPath, tasks;
			var _this = this;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(DatabaseCommand).args;
						name = args.name;
						return [4, pm2_1.describeApplication(name)];
					case 1:
						installationPath = _a.sent().installationPath;
						tasks = new listr_1.default([
							{
								title: 'Stop the database server',
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										return tslib_1.__generator(this, function(_a) {
											return [
												2,
												database_1.stopDatabase(installationPath, name),
											];
										});
									});
								},
							},
						]);
						return [4, tasks.run()];
					case 2:
						_a.sent();
						return [2];
				}
			});
		});
	};
	DatabaseCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: true,
		},
	];
	DatabaseCommand.flags = {
		json: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.json, { hidden: true }),
		),
		pretty: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true }),
		),
	};
	DatabaseCommand.description = 'Stop the database server.';
	DatabaseCommand.examples = ['core:stop:database mainnet-latest'];
	return DatabaseCommand;
})(base_1.default);
exports.default = DatabaseCommand;
//# sourceMappingURL=database.js.map
