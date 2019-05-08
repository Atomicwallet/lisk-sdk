'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var fsExtra = tslib_1.__importStar(require('fs-extra'));
var listr_1 = tslib_1.__importDefault(require('listr'));
var base_1 = tslib_1.__importDefault(require('../../base'));
var pm2_1 = require('../../utils/core/pm2');
var stop_1 = tslib_1.__importDefault(require('./stop'));
var UnInstallCommand = (function(_super) {
	tslib_1.__extends(UnInstallCommand, _super);
	function UnInstallCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	UnInstallCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, name, _a, installationPath, network, tasks, error_1;
			var _this = this;
			return tslib_1.__generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						args = this.parse(UnInstallCommand).args;
						name = args.name;
						return [4, pm2_1.describeApplication(name)];
					case 1:
						(_a = _b.sent()),
							(installationPath = _a.installationPath),
							(network = _a.network);
						_b.label = 2;
					case 2:
						_b.trys.push([2, 5, , 6]);
						return [4, stop_1.default.run([name])];
					case 3:
						_b.sent();
						tasks = new listr_1.default([
							{
								title:
									'Uninstall Lisk Core ' +
									network +
									' instance Installed as ' +
									name,
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										return tslib_1.__generator(this, function(_a) {
											fsExtra.removeSync(installationPath);
											return [2];
										});
									});
								},
							},
						]);
						return [4, tasks.run()];
					case 4:
						_b.sent();
						return [3, 6];
					case 5:
						error_1 = _b.sent();
						this.error(error_1);
						return [3, 6];
					case 6:
						return [2];
				}
			});
		});
	};
	UnInstallCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: true,
		},
	];
	UnInstallCommand.flags = {
		json: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.json, { hidden: true }),
		),
		pretty: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true }),
		),
	};
	UnInstallCommand.description = 'Uninstall an instance of Lisk Core.';
	UnInstallCommand.examples = ['core:uninstall mainnet-latest'];
	return UnInstallCommand;
})(base_1.default);
exports.default = UnInstallCommand;
//# sourceMappingURL=uninstall.js.map
