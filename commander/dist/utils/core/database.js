"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var worker_process_1 = require("../worker-process");
var config_1 = require("./config");
var pm2_1 = require("./pm2");
var DATABASE_START_SUCCESS = '[+] Postgresql started successfully.';
var DATABASE_START_FAILURE = '[-] Failed to start Postgresql.';
var DATABASE_STOP_SUCCESS = '[+] Postgresql stopped successfully.';
var DATABASE_STOP_FAILURE = '[-] Postgresql failed to stop.';
var DATABASE_USER_SUCCESS = '[+] Postgresql user created successfully.';
var DATABASE_USER_FAILURE = '[-] Failed to create Postgresql user.';
var DATABASE_CREATE_SUCCESS = '[+] Postgresql database created successfully.';
var DATABASE_CREATE_FAILURE = '[-] Failed to create Postgresql database.';
var DATABASE_STATUS = '[+] Postgresql is not running.';
var RESTORE_SNAPSHOT_SUCCESS = '[+] Blockchain restored successfully.';
var RESTORE_SNAPSHOT_FAILURE = '[-] Failed to restore blockchain.';
var DB_DATA = 'pgsql/data';
var DB_LOG_FILE = 'logs/pgsql.log';
var PG_BIN = './pgsql/bin';
var PG_CTL = PG_BIN + "/pg_ctl";
var isDbInitialized = function (installDir) {
    return fs_1.default.existsSync(installDir + "/" + DB_DATA);
};
var isDbRunning = function (installDir, port) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var stderr;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, worker_process_1.exec(PG_CTL + " --pgdata " + DB_DATA + " --options '-F -p " + port + "' status", { cwd: installDir })];
            case 1:
                stderr = (_a.sent()).stderr;
                return [2, !stderr];
        }
    });
}); };
exports.initDB = function (installDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var stderr;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isDbInitialized(installDir)) {
                    return [2, 'Postgres database initialized'];
                }
                return [4, worker_process_1.exec(PG_CTL + " initdb --pgdata " + DB_DATA, { cwd: installDir })];
            case 1:
                stderr = (_a.sent()).stderr;
                if (!stderr) {
                    return [2, DATABASE_START_SUCCESS];
                }
                throw new Error(DATABASE_START_FAILURE + ": \n\n " + stderr);
        }
    });
}); };
exports.startDatabase = function (installDir, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var dbPort, isRunning, stderr;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, pm2_1.describeApplication(name)];
            case 1:
                dbPort = (_a.sent()).dbPort;
                return [4, isDbRunning(installDir, dbPort)];
            case 2:
                isRunning = _a.sent();
                if (isRunning) {
                    return [2, DATABASE_START_SUCCESS];
                }
                return [4, worker_process_1.exec(PG_CTL + " --wait --pgdata " + DB_DATA + " --log " + DB_LOG_FILE + " --options \"-F -p " + dbPort + "\" start", { cwd: installDir })];
            case 3:
                stderr = (_a.sent()).stderr;
                if (!stderr) {
                    return [2, DATABASE_START_SUCCESS];
                }
                throw new Error(DATABASE_START_FAILURE + ": \n\n " + stderr);
        }
    });
}); };
exports.createUser = function (installDir, network, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _a, user, password, dbPort, stderr, error_1;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4, config_1.getLiskConfig(installDir, network)];
            case 1:
                _a = (_b.sent()).config.components.storage, user = _a.user, password = _a.password;
                return [4, pm2_1.describeApplication(name)];
            case 2:
                dbPort = (_b.sent()).dbPort;
                return [4, worker_process_1.exec(PG_BIN + "/dropuser --if-exists " + user + " --port " + dbPort + ";\n\t\t\t" + PG_BIN + "/createuser --createdb " + user + " --port " + dbPort + ";\n\t\t\t" + PG_BIN + "/psql --quiet --dbname postgres --port " + dbPort + " --command \"ALTER USER " + user + " WITH PASSWORD '" + password + "';\";", { cwd: installDir })];
            case 3:
                stderr = (_b.sent()).stderr;
                if (!stderr) {
                    return [2, DATABASE_USER_SUCCESS];
                }
                throw new Error(DATABASE_USER_FAILURE + ": \n\n " + stderr);
            case 4:
                error_1 = _b.sent();
                throw new Error(error_1);
            case 5: return [2];
        }
    });
}); };
exports.createDatabase = function (installDir, network, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var database, dbPort, stderr, error_2;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4, config_1.getLiskConfig(installDir, network)];
            case 1:
                database = (_a.sent()).config.components.storage.database;
                return [4, pm2_1.describeApplication(name)];
            case 2:
                dbPort = (_a.sent()).dbPort;
                return [4, worker_process_1.exec(PG_BIN + "/dropdb --if-exists " + database + " --port " + dbPort + ";\n\t\t\t" + PG_BIN + "/createdb " + database + " --port " + dbPort + ";\n\t\t\t", { cwd: installDir })];
            case 3:
                stderr = (_a.sent()).stderr;
                if (!stderr) {
                    return [2, DATABASE_CREATE_SUCCESS];
                }
                throw new Error(DATABASE_CREATE_FAILURE + ": \n\n " + stderr);
            case 4:
                error_2 = _a.sent();
                throw new Error(error_2);
            case 5: return [2];
        }
    });
}); };
exports.stopDatabase = function (installDir, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var dbPort, isRunning, stderr;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, pm2_1.describeApplication(name)];
            case 1:
                dbPort = (_a.sent()).dbPort;
                return [4, isDbRunning(installDir, dbPort)];
            case 2:
                isRunning = _a.sent();
                if (!isRunning) {
                    return [2, DATABASE_STATUS];
                }
                return [4, worker_process_1.exec(PG_CTL + " --pgdata " + DB_DATA + " --log " + DB_LOG_FILE + " stop", { cwd: installDir })];
            case 3:
                stderr = (_a.sent()).stderr;
                if (!stderr) {
                    return [2, DATABASE_STOP_SUCCESS];
                }
                throw new Error(DATABASE_STOP_FAILURE + ": \n\n " + stderr);
        }
    });
}); };
exports.restoreSnapshot = function (installDir, network, snapshotFilePath, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _a, database, user, dbPort, stderr, error_3;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4, config_1.getLiskConfig(installDir, network)];
            case 1:
                _a = (_b.sent()).config.components.storage, database = _a.database, user = _a.user;
                return [4, pm2_1.describeApplication(name)];
            case 2:
                dbPort = (_b.sent()).dbPort;
                return [4, worker_process_1.exec("gunzip --force --stdout --quiet " + snapshotFilePath + " | " + PG_BIN + "/psql --username " + user + " --dbname " + database + " --port " + dbPort + ";", { cwd: installDir })];
            case 3:
                stderr = (_b.sent()).stderr;
                if (!stderr) {
                    return [2, RESTORE_SNAPSHOT_SUCCESS];
                }
                throw new Error(RESTORE_SNAPSHOT_FAILURE + ": \n\n " + stderr);
            case 4:
                error_3 = _b.sent();
                throw new Error(error_3);
            case 5: return [2];
        }
    });
}); };
//# sourceMappingURL=database.js.map