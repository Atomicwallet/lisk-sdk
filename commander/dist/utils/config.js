'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var fs_1 = tslib_1.__importDefault(require('fs'));
var lockfile_1 = tslib_1.__importDefault(require('lockfile'));
var path_1 = tslib_1.__importDefault(require('path'));
var defaultConfig = tslib_1.__importStar(require('../default_config.json'));
var constants_1 = require('./constants');
var error_1 = require('./error');
var fs_2 = require('./fs');
var configFileName = 'config.json';
var lockfileName = 'config.lock';
var fileWriteErrorMessage = function(filePath) {
	return (
		'Could not write to `' +
		filePath +
		'`. Your configuration will not be persisted.'
	);
};
var attemptCallWithError = function(fn, errorMessage) {
	try {
		return fn();
	} catch (_) {
		throw new Error(errorMessage);
	}
};
var attemptToCreateDir = function(dirPath) {
	var fn = fs_1.default.mkdirSync.bind(undefined, dirPath);
	attemptCallWithError(fn, fileWriteErrorMessage(dirPath));
};
var attemptToCreateFile = function(filePath) {
	var fn = fs_2.writeJSONSync.bind(undefined, filePath, defaultConfig);
	attemptCallWithError(fn, fileWriteErrorMessage(filePath));
};
var checkLockfile = function(filePath) {
	var locked = lockfile_1.default.checkSync(filePath);
	var errorMessage =
		'Config lockfile at ' +
		filePath +
		' found. Are you running Lisk Commander in another process?';
	if (locked) {
		throw new Error(errorMessage);
	}
};
var attemptToReadJSONFile = function(filePath) {
	var fn = fs_2.readJSONSync.bind(undefined, filePath);
	var errorMessage =
		'Config file cannot be read or is not valid JSON. Please check ' +
		filePath +
		' or delete the file so we can create a new one from defaults.';
	return attemptCallWithError(fn, errorMessage);
};
var attemptToValidateConfig = function(config, filePath) {
	var rootKeys = constants_1.CONFIG_VARIABLES.map(function(key) {
		return key.split('.')[0];
	});
	var fn = function() {
		rootKeys.forEach(function(key) {
			if (!Object.keys(config).includes(key)) {
				throw new error_1.ValidationError(
					'Key ' + key + ' not found in config file.',
				);
			}
		});
	};
	var errorMessage =
		'Config file seems to be corrupted: missing required keys. Please check ' +
		filePath +
		' or delete the file so we can create a new one from defaults.';
	attemptCallWithError(fn, errorMessage);
};
exports.setConfig = function(configDirPath, newConfig) {
	var lockFilePath = path_1.default.join(configDirPath, lockfileName);
	var configFilePath = path_1.default.join(configDirPath, configFileName);
	checkLockfile(lockFilePath);
	lockfile_1.default.lockSync(lockFilePath);
	try {
		fs_2.writeJSONSync(configFilePath, newConfig);
		return true;
	} catch (e) {
		return false;
	} finally {
		lockfile_1.default.unlockSync(lockFilePath);
	}
};
exports.getConfig = function(configDirPath) {
	if (!fs_1.default.existsSync(configDirPath)) {
		attemptToCreateDir(configDirPath);
	}
	var configFilePath = path_1.default.join(configDirPath, configFileName);
	if (!fs_1.default.existsSync(configFilePath)) {
		attemptToCreateFile(configFilePath);
		return defaultConfig;
	}
	var config = attemptToReadJSONFile(configFilePath);
	attemptToValidateConfig(config, configFilePath);
	return config;
};
//# sourceMappingURL=config.js.map
