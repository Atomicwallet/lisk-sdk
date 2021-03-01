"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const defaultDir = '.lisk';
const getConfigPath = (dataPath) => path.join(dataPath, 'config');
exports.getDefaultPath = (name) => path.join(os.homedir(), defaultDir, name);
exports.getFullPath = (dataPath) => path.resolve(dataPath);
exports.splitPath = (dataPath) => {
    const rootPath = path.resolve(path.join(dataPath, '../'));
    const label = path.parse(dataPath).name;
    return {
        rootPath,
        label,
    };
};
exports.getNetworkConfigFilesPath = (dataPath, network, configDirIncluded = false) => {
    const basePath = configDirIncluded
        ? path.join(dataPath, network)
        : path.join(dataPath, 'config', network);
    return {
        genesisBlockFilePath: path.join(basePath, 'genesis_block.json'),
        configFilePath: path.join(basePath, 'config.json'),
    };
};
exports.getConfigDirs = (dataPath, configDirIncluded = false) => {
    const configPath = configDirIncluded ? dataPath : getConfigPath(dataPath);
    fs.ensureDirSync(configPath);
    const files = fs.readdirSync(configPath);
    return files.filter(file => fs.statSync(path.join(configPath, file)).isDirectory());
};
exports.removeConfigDir = (dataPath, network) => fs.removeSync(path.join(dataPath, 'config', network));
exports.ensureConfigDir = (dataPath, network) => fs.ensureDirSync(path.join(dataPath, 'config', network));
exports.getBlockchainDBPath = (dataPath) => path.join(dataPath, 'data', 'blockchain.db');
exports.getForgerDBPath = (dataPath) => path.join(dataPath, 'data', 'forger.db');
exports.getPidPath = (dataPath) => path.join(dataPath, 'tmp', 'pids', 'controller.pid');
//# sourceMappingURL=path.js.map