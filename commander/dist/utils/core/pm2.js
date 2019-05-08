"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
var path = tslib_1.__importStar(require("path"));
var pm2_1 = require("pm2");
var connectPM2 = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.connect(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            })];
    });
}); };
var startPM2 = function (installPath, network, name, envConfig) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var apps;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, fs_extra_1.default.readJson(installPath + "/etc/pm2-lisk.json")];
            case 1:
                apps = (_a.sent()).apps;
                return [2, new Promise(function (resolve, reject) {
                        pm2_1.start({
                            name: name,
                            script: apps[0].script,
                            args: apps[0].args,
                            interpreter: installPath + "/bin/node",
                            cwd: installPath,
                            env: tslib_1.__assign({ LISK_NETWORK: network }, envConfig),
                            pid: path.join(installPath, '/pids/lisk.app.pid'),
                            output: path.join(installPath, '/logs/lisk.app.log'),
                            error: path.join(installPath, '/logs/lisk.app.err'),
                            log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
                            watch: false,
                            kill_timeout: 10000,
                            max_memory_restart: '1024M',
                            min_uptime: 20000,
                            max_restarts: 10,
                        }, function (err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve();
                            return;
                        });
                    })];
        }
    });
}); };
var restartPM2 = function (process) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.restart(process, function (err) {
                    if (err && err.message !== 'process name not found') {
                        reject(err.message);
                        return;
                    }
                    resolve();
                });
            })];
    });
}); };
var stopPM2 = function (process) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.stop(process, function (err) {
                    if (err && err.message !== 'process name not found') {
                        reject();
                        return;
                    }
                    resolve();
                });
            })];
    });
}); };
var describePM2 = function (process) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.describe(process, function (err, descs) {
                    if (err && err.message !== 'process name not found') {
                        reject(err);
                        return;
                    }
                    var pDesc = descs.find(function (desc) { return desc.pid === process || desc.name === process; });
                    if (!pDesc) {
                        reject(new Error("Process " + process + " not found"));
                    }
                    resolve(pDesc);
                });
            })];
    });
}); };
var listPM2 = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.list(function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            })];
    });
}); };
var deleteProcess = function (process) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                pm2_1.delete(process, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                    return;
                });
            })];
    });
}); };
exports.registerApplication = function (installPath, network, name, envConfig) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, startPM2(installPath, network, name, envConfig)];
            case 2:
                _a.sent();
                return [4, stopPM2(name)];
            case 3:
                _a.sent();
                pm2_1.disconnect();
                return [2];
        }
    });
}); };
exports.unRegisterApplication = function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, deleteProcess(name)];
            case 2:
                _a.sent();
                pm2_1.disconnect();
                return [2];
        }
    });
}); };
exports.restartApplication = function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, restartPM2(name)];
            case 2:
                _a.sent();
                pm2_1.disconnect();
                return [2];
        }
    });
}); };
exports.stopApplication = function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, stopPM2(name)];
            case 2:
                _a.sent();
                pm2_1.disconnect();
                return [2];
        }
    });
}); };
var extractProcessDetails = function (appDesc) {
    var pm2_env = appDesc.pm2_env, monit = appDesc.monit, name = appDesc.name, pid = appDesc.pid;
    var _a = pm2_env, status = _a.status, pm_uptime = _a.pm_uptime, installationPath = _a.pm_cwd, version = _a.version, network = _a.LISK_NETWORK, dbPort = _a.LISK_DB_PORT, redisPort = _a.LISK_REDIS_PORT, httpPort = _a.LISK_HTTP_PORT, wsPort = _a.LISK_WS_PORT;
    return tslib_1.__assign({ name: name,
        pid: pid,
        status: status,
        version: version,
        network: network,
        dbPort: dbPort,
        redisPort: redisPort,
        httpPort: httpPort,
        wsPort: wsPort,
        installationPath: installationPath, started_at: new Date(pm_uptime).toLocaleString() }, monit);
};
exports.listApplication = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var applications;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, listPM2()];
            case 2:
                applications = (_a.sent());
                pm2_1.disconnect();
                return [2, applications.map(extractProcessDetails)];
        }
    });
}); };
exports.describeApplication = function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var application;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, connectPM2()];
            case 1:
                _a.sent();
                return [4, describePM2(name)];
            case 2:
                application = (_a.sent());
                pm2_1.disconnect();
                return [2, extractProcessDetails(application)];
        }
    });
}); };
//# sourceMappingURL=pm2.js.map