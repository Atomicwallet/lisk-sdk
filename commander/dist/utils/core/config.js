"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var os = tslib_1.__importStar(require("os"));
var path = tslib_1.__importStar(require("path"));
var worker_process_1 = require("../worker-process");
exports.defaultLiskPath = path.join(os.homedir(), '.lisk');
exports.defaultLiskPm2Path = exports.defaultLiskPath + "/pm2";
exports.defaultLiskInstancePath = exports.defaultLiskPath + "/instances";
exports.defaultBackupPath = exports.defaultLiskInstancePath + "/backup";
var NODE_BIN = './bin/node';
exports.getLiskConfig = function (installDir, network) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var cmd, kb, size, maxBuffer, _a, stdout, stderr;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cmd = NODE_BIN + " scripts/generate_config.js -n " + network + " | head -n 10000";
                kb = 1024;
                size = 400;
                maxBuffer = kb * size;
                return [4, worker_process_1.exec(cmd, { cwd: installDir, maxBuffer: maxBuffer })];
            case 1:
                _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                if (stderr) {
                    throw new Error(stderr);
                }
                return [2, JSON.parse(stdout)];
        }
    });
}); };
//# sourceMappingURL=config.js.map