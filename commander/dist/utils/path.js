"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPidPath = exports.getForgerDBPath = exports.getBlockchainDBPath = exports.ensureConfigDir = exports.removeConfigDir = exports.getConfigDirs = exports.getNetworkConfigFilesPath = exports.splitPath = exports.getFullPath = exports.getDefaultPath = void 0;
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const defaultDir = '.lisk';
const getConfigPath = (dataPath) => path.join(dataPath, 'config');
const getDefaultPath = (name) => path.join(os.homedir(), defaultDir, name);
exports.getDefaultPath = getDefaultPath;
const getFullPath = (dataPath) => path.resolve(dataPath);
exports.getFullPath = getFullPath;
const splitPath = (dataPath) => {
    const rootPath = path.resolve(path.join(dataPath, '../'));
    const label = path.parse(dataPath).name;
    return {
        rootPath,
        label,
    };
};
exports.splitPath = splitPath;
const getNetworkConfigFilesPath = (dataPath, network, configDirIncluded = false) => {
    const basePath = configDirIncluded
        ? path.join(dataPath, network)
        : path.join(dataPath, 'config', network);
    return {
        genesisBlockFilePath: path.join(basePath, 'genesis_block.json'),
        configFilePath: path.join(basePath, 'config.json'),
    };
};
exports.getNetworkConfigFilesPath = getNetworkConfigFilesPath;
const getConfigDirs = (dataPath, configDirIncluded = false) => {
    const configPath = configDirIncluded ? dataPath : getConfigPath(dataPath);
    fs.ensureDirSync(configPath);
    const files = fs.readdirSync(configPath);
    return files.filter(file => fs.statSync(path.join(configPath, file)).isDirectory());
};
exports.getConfigDirs = getConfigDirs;
const removeConfigDir = (dataPath, network) => fs.removeSync(path.join(dataPath, 'config', network));
exports.removeConfigDir = removeConfigDir;
const ensureConfigDir = (dataPath, network) => fs.ensureDirSync(path.join(dataPath, 'config', network));
exports.ensureConfigDir = ensureConfigDir;
const getBlockchainDBPath = (dataPath) => path.join(dataPath, 'data', 'blockchain.db');
exports.getBlockchainDBPath = getBlockchainDBPath;
const getForgerDBPath = (dataPath) => path.join(dataPath, 'data', 'forger.db');
exports.getForgerDBPath = getForgerDBPath;
const getPidPath = (dataPath) => path.join(dataPath, 'tmp', 'pids', 'controller.pid');
exports.getPidPath = getPidPath;
//# sourceMappingURL=path.js.map