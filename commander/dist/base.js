'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var os_1 = tslib_1.__importDefault(require('os'));
var config_1 = require('./utils/config');
var config_2 = require('./utils/core/config');
var helpers_1 = require('./utils/helpers');
var print_1 = require('./utils/print');
process.env.PM2_HOME = config_2.defaultLiskPm2Path;
exports.defaultConfigFolder = '.lisk';
var jsonDescription =
	'Prints output in JSON format. You can change the default behaviour in your config.json file.';
var prettyDescription =
	'Prints JSON in pretty format rather than condensed. Has no effect if the output is set to table. You can change the default behaviour in your config.json file.';
var BaseCommand = (function(_super) {
	tslib_1.__extends(BaseCommand, _super);
	function BaseCommand() {
		var _this = (_super !== null && _super.apply(this, arguments)) || this;
		_this.printFlags = {};
		_this.userConfig = {
			api: {
				network: 'main',
				nodes: [],
			},
			json: true,
			pretty: true,
		};
		return _this;
	}
	BaseCommand.prototype.finally = function(error) {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			return tslib_1.__generator(this, function(_a) {
				if (error) {
					this.error(error instanceof Error ? error.message : error);
				}
				return [2];
			});
		});
	};
	BaseCommand.prototype.init = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var flags;
			return tslib_1.__generator(this, function(_a) {
				flags = this.parse(this.constructor).flags;
				this.printFlags = flags;
				process.stdout.on('error', helpers_1.handleEPIPE);
				process.env.XDG_CONFIG_HOME =
					process.env.LISK_COMMANDER_CONFIG_DIR ||
					os_1.default.homedir() + '/' + exports.defaultConfigFolder;
				this.userConfig = config_1.getConfig(process.env.XDG_CONFIG_HOME);
				return [2];
			});
		});
	};
	BaseCommand.prototype.print = function(result, readAgain) {
		if (readAgain === void 0) {
			readAgain = false;
		}
		if (readAgain) {
			this.userConfig = config_1.getConfig(process.env.XDG_CONFIG_HOME);
		}
		print_1
			.print(
				tslib_1.__assign(
					{ json: this.userConfig.json, pretty: this.userConfig.pretty },
					this.printFlags,
				),
			)
			.call(this, result);
	};
	BaseCommand.flags = {
		json: command_1.flags.boolean({
			char: 'j',
			description: jsonDescription,
			allowNo: true,
		}),
		pretty: command_1.flags.boolean({
			description: prettyDescription,
			allowNo: true,
		}),
	};
	return BaseCommand;
})(command_1.Command);
exports.default = BaseCommand;
//# sourceMappingURL=base.js.map
