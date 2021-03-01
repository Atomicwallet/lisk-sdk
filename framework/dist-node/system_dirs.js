"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
exports.systemDirs = (appLabel, rootPath) => {
    const rootPathWithoutTilde = rootPath.replace('~', os_1.homedir());
    return {
        dataPath: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel)),
        data: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel, 'data')),
        tmp: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel, 'tmp')),
        logs: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel, 'logs')),
        sockets: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel, 'tmp', 'sockets')),
        pids: path_1.resolve(path_1.join(rootPathWithoutTilde, appLabel, 'tmp', 'pids')),
    };
};
//# sourceMappingURL=system_dirs.js.map