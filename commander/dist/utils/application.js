"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("./path");
exports.getPid = (dataPath) => parseInt(fs_extra_1.readFileSync(path_1.getPidPath(dataPath), { encoding: 'utf8' }), 10);
exports.isApplicationRunning = (dataPath) => {
    const pidPath = path_1.getPidPath(dataPath);
    if (!fs_extra_1.pathExistsSync(pidPath)) {
        return false;
    }
    const pid = exports.getPid(dataPath);
    try {
        process.kill(pid, 0);
    }
    catch (e) {
        if (e.code) {
            return e.code === 'EPERM';
        }
        return false;
    }
    return true;
};
//# sourceMappingURL=application.js.map