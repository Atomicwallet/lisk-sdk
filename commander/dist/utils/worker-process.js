"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var child_process_1 = tslib_1.__importDefault(require("child_process"));
var fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
var config_1 = require("./core/config");
exports.exec = function (command, options) {
    if (options === void 0) { options = {}; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, new Promise(function (resolve) {
                    child_process_1.default.exec(command, options, function (error, stdout, stderr) {
                        if (error || stderr) {
                            fs_extra_1.default.writeJSONSync(config_1.defaultLiskInstancePath + "/error.log", {
                                error: error,
                                stderr: stderr,
                            });
                        }
                        resolve({ stdout: stdout, stderr: error });
                    });
                })];
        });
    });
};
//# sourceMappingURL=worker-process.js.map