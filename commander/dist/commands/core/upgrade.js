'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var fsExtra = tslib_1.__importStar(require('fs-extra'));
var listr_1 = tslib_1.__importDefault(require('listr'));
var semver_1 = tslib_1.__importDefault(require('semver'));
var base_1 = tslib_1.__importDefault(require('../../base'));
var cache_1 = require('../../utils/core/cache');
var commons_1 = require('../../utils/core/commons');
var database_1 = require('../../utils/core/database');
var pm2_1 = require('../../utils/core/pm2');
var release_1 = require('../../utils/core/release');
var download_1 = require('../../utils/download');
var flags_1 = require('../../utils/flags');
var UpgradeCommand = (function(_super) {
	tslib_1.__extends(UpgradeCommand, _super);
	function UpgradeCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	UpgradeCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				flags,
				name,
				_b,
				liskVersion,
				releaseUrl,
				_c,
				installationPath,
				network,
				currentVersion,
				upgradeVersion,
				cacheDir,
				tasks;
			var _this = this;
			return tslib_1.__generator(this, function(_d) {
				switch (_d.label) {
					case 0:
						(_a = this.parse(UpgradeCommand)),
							(args = _a.args),
							(flags = _a.flags);
						name = args.name;
						(_b = flags),
							(liskVersion = _b['lisk-version']),
							(releaseUrl = _b['release-url']);
						return [4, pm2_1.describeApplication(name)];
					case 1:
						(_c = _d.sent()),
							(installationPath = _c.installationPath),
							(network = _c.network),
							(currentVersion = _c.version);
						return [4, commons_1.getVersionToInstall(network, liskVersion)];
					case 2:
						upgradeVersion = _d.sent();
						cacheDir = this.config.cacheDir;
						fsExtra.ensureDirSync(cacheDir);
						tasks = new listr_1.default([
							{
								title: 'Validate Version Input',
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [
														4,
														commons_1.validateVersion(network, upgradeVersion),
													];
												case 1:
													_a.sent();
													if (
														semver_1.default.lte(upgradeVersion, currentVersion)
													) {
														throw new Error(
															'Upgrade version:' +
																upgradeVersion +
																' should be greater than current version: ' +
																currentVersion,
														);
													}
													return [2];
											}
										});
									});
								},
							},
							{
								title: 'Download Lisk Core: ' + upgradeVersion + ' for upgrade',
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										var liskTarUrl;
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [
														4,
														release_1.getReleaseInfo(
															releaseUrl,
															network,
															upgradeVersion,
														),
													];
												case 1:
													liskTarUrl = _a.sent().liskTarUrl;
													return [
														4,
														download_1.downloadAndValidate(
															liskTarUrl,
															cacheDir,
														),
													];
												case 2:
													_a.sent();
													return [2];
											}
										});
									});
								},
							},
							{
								title: 'Stop, Backup and Install Lisk Core',
								task: function() {
									return new listr_1.default([
										{
											title: 'Stop Lisk Core',
											task: function() {
												return tslib_1.__awaiter(
													_this,
													void 0,
													void 0,
													function() {
														var isRunning;
														return tslib_1.__generator(this, function(_a) {
															switch (_a.label) {
																case 0:
																	return [
																		4,
																		cache_1.isCacheRunning(
																			installationPath,
																			name,
																		),
																	];
																case 1:
																	isRunning = _a.sent();
																	if (!isRunning) return [3, 3];
																	return [
																		4,
																		cache_1.stopCache(
																			installationPath,
																			network,
																			name,
																		),
																	];
																case 2:
																	_a.sent();
																	_a.label = 3;
																case 3:
																	return [
																		4,
																		database_1.stopDatabase(
																			installationPath,
																			name,
																		),
																	];
																case 4:
																	_a.sent();
																	return [4, pm2_1.stopApplication(name)];
																case 5:
																	_a.sent();
																	return [2];
															}
														});
													},
												);
											},
										},
										{
											title:
												'Backup Lisk Core: ' +
												currentVersion +
												' installed as ' +
												name,
											task: function() {
												return tslib_1.__awaiter(
													_this,
													void 0,
													void 0,
													function() {
														return tslib_1.__generator(this, function(_a) {
															switch (_a.label) {
																case 0:
																	return [
																		4,
																		commons_1.backupLisk(installationPath),
																	];
																case 1:
																	_a.sent();
																	return [2];
															}
														});
													},
												);
											},
										},
										{
											title: 'Install Lisk Core: ' + upgradeVersion,
											task: function() {
												return tslib_1.__awaiter(
													_this,
													void 0,
													void 0,
													function() {
														var liskTarUrl, _a, fileDir, fileName;
														return tslib_1.__generator(this, function(_b) {
															switch (_b.label) {
																case 0:
																	fsExtra.ensureDirSync(installationPath);
																	return [
																		4,
																		release_1.getReleaseInfo(
																			releaseUrl,
																			network,
																			upgradeVersion,
																		),
																	];
																case 1:
																	liskTarUrl = _b.sent().liskTarUrl;
																	(_a = commons_1.getDownloadedFileInfo(
																		liskTarUrl,
																		cacheDir,
																	)),
																		(fileDir = _a.fileDir),
																		(fileName = _a.fileName);
																	return [
																		4,
																		download_1.extract(
																			fileDir,
																			fileName,
																			installationPath,
																		),
																	];
																case 2:
																	_b.sent();
																	return [2];
															}
														});
													},
												);
											},
										},
									]);
								},
							},
							{
								title:
									'Upgrade Lisk Core ' +
									name +
									' instance from: ' +
									currentVersion +
									' to: ' +
									upgradeVersion,
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [
														4,
														commons_1.upgradeLisk(
															installationPath,
															name,
															network,
															currentVersion,
														),
													];
												case 1:
													_a.sent();
													return [2];
											}
										});
									});
								},
							},
							{
								title: 'Unregister and register Lisk Core',
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										var envConfig;
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [4, commons_1.generateEnvConfig(network)];
												case 1:
													envConfig = _a.sent();
													return [4, pm2_1.unRegisterApplication(name)];
												case 2:
													_a.sent();
													return [
														4,
														pm2_1.registerApplication(
															installationPath,
															network,
															name,
															envConfig,
														),
													];
												case 3:
													_a.sent();
													return [2];
											}
										});
									});
								},
							},
							{
								title: 'Start Lisk Core: ' + upgradeVersion,
								task: function() {
									return tslib_1.__awaiter(_this, void 0, void 0, function() {
										var isRunning;
										return tslib_1.__generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [
														4,
														cache_1.isCacheRunning(installationPath, name),
													];
												case 1:
													isRunning = _a.sent();
													if (!!isRunning) return [3, 3];
													return [
														4,
														cache_1.startCache(installationPath, name),
													];
												case 2:
													_a.sent();
													_a.label = 3;
												case 3:
													return [
														4,
														database_1.startDatabase(installationPath, name),
													];
												case 4:
													_a.sent();
													return [4, pm2_1.restartApplication(name)];
												case 5:
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
						_d.sent();
						return [2];
				}
			});
		});
	};
	UpgradeCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: true,
		},
	];
	UpgradeCommand.description =
		'Upgrade an instance of Lisk Core to a specified or latest version.';
	UpgradeCommand.examples = [
		'core:upgrade lisk-mainnet',
		'core:upgrade --lisk-version=2.0.0 lisk-mainnet',
		'core:upgrade --release-url=https://lisk-releases.ams3.digitaloceanspaces.com/lisk-core/lisk-1.6.0-rc.4-Linux-x86_64.tar.gz lisk-mainnet',
	];
	UpgradeCommand.flags = {
		json: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.json, { hidden: true }),
		),
		pretty: command_1.flags.boolean(
			tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true }),
		),
		'lisk-version': command_1.flags.string(
			tslib_1.__assign({}, flags_1.flags.liskVersion),
		),
		'release-url': command_1.flags.string(
			tslib_1.__assign({}, flags_1.flags.releaseUrl),
		),
	};
	return UpgradeCommand;
})(base_1.default);
exports.default = UpgradeCommand;
//# sourceMappingURL=upgrade.js.map
