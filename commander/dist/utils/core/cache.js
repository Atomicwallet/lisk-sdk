'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var worker_process_1 = require('../worker-process');
var config_1 = require('./config');
var pm2_1 = require('./pm2');
var CACHE_START_SUCCESS = '[+] Redis-Server started successfully.';
var CACHE_START_FAILURE = '[-] Failed to start Redis-Server.';
var CACHE_STOP_SUCCESS = '[+] Redis-Server stopped successfully.';
var CACHE_STOP_FAILURE = '[-] Failed to stop Redis-Server.';
var REDIS_CONFIG = 'etc/redis.conf';
var REDIS_BIN = './bin/redis-server';
var REDIS_CLI = './bin/redis-cli';
exports.isCacheRunning = function(installDir, name) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var redisPort, stderr;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					return [4, pm2_1.describeApplication(name)];
				case 1:
					redisPort = _a.sent().redisPort;
					return [
						4,
						worker_process_1.exec(REDIS_CLI + ' -p ' + redisPort + ' ping', {
							cwd: installDir,
						}),
					];
				case 2:
					stderr = _a.sent().stderr;
					return [2, !stderr];
			}
		});
	});
};
exports.startCache = function(installDir, name) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var redisPort, stderr;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					return [4, pm2_1.describeApplication(name)];
				case 1:
					redisPort = _a.sent().redisPort;
					return [
						4,
						worker_process_1.exec(
							REDIS_BIN + ' ' + REDIS_CONFIG + ' --port ' + redisPort,
							{ cwd: installDir },
						),
					];
				case 2:
					stderr = _a.sent().stderr;
					if (!stderr) {
						return [2, CACHE_START_SUCCESS];
					}
					throw new Error(CACHE_START_FAILURE + ': \n\n ' + stderr);
			}
		});
	});
};
var stopCommand = function(installDir, network, name) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var password, redisPort, error_1;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 3, , 4]);
					return [4, config_1.getLiskConfig(installDir, network)];
				case 1:
					password = _a.sent().config.components.cache.password;
					return [4, pm2_1.describeApplication(name)];
				case 2:
					redisPort = _a.sent().redisPort;
					if (password) {
						return [
							2,
							REDIS_CLI + ' -p ' + redisPort + ' -a ' + password + ' shutdown',
						];
					}
					return [2, REDIS_CLI + ' -p ' + redisPort + ' shutdown'];
				case 3:
					error_1 = _a.sent();
					throw new Error(error_1);
				case 4:
					return [2];
			}
		});
	});
};
exports.stopCache = function(installDir, network, name) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var cmd, stderr, error_2;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 3, , 4]);
					return [4, stopCommand(installDir, network, name)];
				case 1:
					cmd = _a.sent();
					return [4, worker_process_1.exec(cmd, { cwd: installDir })];
				case 2:
					stderr = _a.sent().stderr;
					if (!stderr) {
						return [2, CACHE_STOP_SUCCESS];
					}
					throw new Error(CACHE_STOP_FAILURE + ': \n\n ' + stderr);
				case 3:
					error_2 = _a.sent();
					throw new Error(error_2);
				case 4:
					return [2];
			}
		});
	});
};
exports.isCacheEnabled = function(installDir, network) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var enabled, error_3;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [4, config_1.getLiskConfig(installDir, network)];
				case 1:
					enabled = _a.sent().config.components.cache.enabled;
					return [2, enabled];
				case 2:
					error_3 = _a.sent();
					throw new Error(error_3);
				case 3:
					return [2];
			}
		});
	});
};
//# sourceMappingURL=cache.js.map
