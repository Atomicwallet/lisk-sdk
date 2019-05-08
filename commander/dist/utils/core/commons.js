'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var fs_extra_1 = tslib_1.__importDefault(require('fs-extra'));
var os = tslib_1.__importStar(require('os'));
var semver_1 = tslib_1.__importDefault(require('semver'));
var constants_1 = require('../constants');
var worker_process_1 = require('../worker-process');
var config_1 = require('./config');
var pm2_1 = require('./pm2');
var release_1 = require('./release');
exports.liskInstall = function(installPath) {
	return installPath.replace('~', os.homedir);
};
exports.installDirectory = function(installPath, name) {
	return exports.liskInstall(installPath) + '/' + name;
};
exports.liskVersion = function(version) {
	return 'lisk-' + version + '-' + os.type() + '-x86_64';
};
exports.liskTar = function(version) {
	return exports.liskVersion(version) + '.tar.gz';
};
exports.liskTarSHA256 = function(version) {
	return exports.liskTar(version) + '.SHA256';
};
exports.liskLatestUrl = function(url, network) {
	return url + '/' + network + '/latest.txt';
};
exports.liskSnapshotUrl = function(url, network) {
	if (
		url &&
		url.search(constants_1.RELEASE_URL) >= 0 &&
		url.search('db.gz') >= 0
	) {
		return constants_1.RELEASE_URL + '/' + network + '/blockchain.db.gz';
	}
	return url;
};
exports.logsDir = function(installPath) {
	return exports.liskInstall(installPath) + '/logs';
};
exports.SH_LOG_FILE = 'logs/lisk.out';
exports.validateNotARootUser = function() {
	if (process.getuid && process.getuid() === 0) {
		throw new Error('Error: Lisk should not be run be as root. Exiting.');
	}
};
exports.isSupportedOS = function() {
	return os.type() in constants_1.OS;
};
exports.validateNetwork = function(network) {
	if (network.toUpperCase() in constants_1.NETWORK) {
		return;
	}
	throw new Error(
		'Network "' +
			network +
			'" is not supported, please try options ' +
			Object.values(constants_1.NETWORK).join(','),
	);
};
exports.createDirectory = function(dirPath) {
	var resolvedPath = exports.liskInstall(dirPath);
	if (!fs_extra_1.default.pathExistsSync(resolvedPath)) {
		fs_extra_1.default.ensureDirSync(resolvedPath);
	}
};
exports.validURL = function(url) {
	var isValid = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/);
	if (isValid.test(url)) {
		return;
	}
	throw new Error('Invalid URL: ' + url);
};
exports.getVersionToInstall = function(network, version) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var url, latestVersion;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					if (!!version) return [3, 2];
					url = constants_1.RELEASE_URL + '/' + network + '/latest.txt';
					return [4, release_1.getLatestVersion(url)];
				case 1:
					latestVersion = _a.sent();
					return [2, latestVersion];
				case 2:
					return [2, version];
			}
		});
	});
};
exports.backupLisk = function(installDir) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var stderr;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					fs_extra_1.default.emptyDirSync(config_1.defaultBackupPath);
					return [
						4,
						worker_process_1.exec(
							'mv -f ' + installDir + ' ' + config_1.defaultBackupPath,
						),
					];
				case 1:
					stderr = _a.sent().stderr;
					if (stderr) {
						throw new Error(stderr);
					}
					return [2];
			}
		});
	});
};
exports.upgradeLisk = function(installDir, name, network, currentVersion) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var LISK_BACKUP, LISK_OLD_PG, LISK_PG, MODE, stderr;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					LISK_BACKUP = config_1.defaultBackupPath + '/' + name;
					LISK_OLD_PG = LISK_BACKUP + '/pgsql/data';
					LISK_PG = installDir + '/pgsql/data';
					MODE = 448;
					fs_extra_1.default.mkdirSync(LISK_PG, MODE);
					fs_extra_1.default.copySync(LISK_OLD_PG, LISK_PG);
					return [
						4,
						worker_process_1.exec(
							installDir +
								'/bin/node ' +
								installDir +
								'/scripts/update_config.js --network ' +
								network +
								' --output ' +
								installDir +
								'/config.json ' +
								LISK_BACKUP +
								'/config.json ' +
								currentVersion,
						),
					];
				case 1:
					stderr = _a.sent().stderr;
					if (stderr) {
						throw new Error(stderr);
					}
					fs_extra_1.default.emptyDirSync(config_1.defaultBackupPath);
					return [2];
			}
		});
	});
};
exports.validateVersion = function(network, version) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var url, error_1;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					if (!semver_1.default.valid(version)) {
						throw new Error(
							'Upgrade version: ' +
								version +
								' has invalid format, Please refer version from release url: ' +
								constants_1.RELEASE_URL +
								'/' +
								network,
						);
					}
					url = constants_1.RELEASE_URL + '/' + network + '/' + version;
					_a.label = 1;
				case 1:
					_a.trys.push([1, 3, , 4]);
					return [4, release_1.getLatestVersion(url)];
				case 2:
					_a.sent();
					return [3, 4];
				case 3:
					error_1 = _a.sent();
					if (error_1.message === 'Request failed with status code 404') {
						throw new Error(
							'Upgrade version: ' +
								version +
								" doesn't exists in " +
								constants_1.RELEASE_URL +
								'/' +
								network,
						);
					}
					throw new Error(error_1.message);
				case 4:
					return [2];
			}
		});
	});
};
exports.getSemver = function(str) {
	var exp = new RegExp(
		/(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?\.?(?:0|[1-9]\d*)?/,
	);
	var result = exp.exec(str);
	return result[0];
};
exports.dateDiff = function(date1, date2) {
	var MINUTES_OR_SECONDS = 60;
	var HOURS = 24;
	var INT_RANGE = 1000;
	return (
		(new Date(date1).valueOf() - new Date(date2).valueOf()) /
		(HOURS * MINUTES_OR_SECONDS * MINUTES_OR_SECONDS * INT_RANGE)
	);
};
exports.getDownloadedFileInfo = function(url, cacheDir) {
	var pathWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '').split('/');
	var fileName = pathWithoutProtocol.pop();
	var fileDir = cacheDir + '/' + pathWithoutProtocol.join('/');
	var filePath = fileDir + '/' + fileName;
	return {
		fileName: fileName,
		fileDir: fileDir,
		filePath: filePath,
	};
};
var convertToNumber = function(val) {
	if (!val) {
		return 0;
	}
	if (typeof val === 'number') {
		return val;
	}
	return parseInt(val, 10);
};
var getEnvByKey = function(instances, key, defaultValue) {
	var maxValue = instances
		.map(function(app) {
			return app[key];
		})
		.reduce(function(acc, curr) {
			var ac = convertToNumber(acc);
			var cu = convertToNumber(curr);
			return Math.max(ac, cu);
		}, defaultValue);
	return convertToNumber(maxValue) || defaultValue;
};
exports.generateEnvConfig = function(network) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var INCREMENT, instances, filteredByNetwork;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					INCREMENT = 2;
					return [4, pm2_1.listApplication()];
				case 1:
					instances = _a.sent();
					filteredByNetwork = instances.filter(function(i) {
						return i.network === network;
					});
					return [
						2,
						{
							LISK_DB_PORT:
								getEnvByKey(instances, 'dbPort', constants_1.POSTGRES_PORT) + 1,
							LISK_REDIS_PORT:
								getEnvByKey(instances, 'redisPort', constants_1.REDIS_PORT) + 1,
							LISK_HTTP_PORT:
								getEnvByKey(
									filteredByNetwork,
									'httpPort',
									constants_1.HTTP_PORTS[network],
								) + INCREMENT,
							LISK_WS_PORT:
								getEnvByKey(
									filteredByNetwork,
									'wsPort',
									constants_1.WS_PORTS[network],
								) + INCREMENT,
						},
					];
			}
		});
	});
};
//# sourceMappingURL=commons.js.map
