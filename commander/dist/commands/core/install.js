"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var fsExtra = tslib_1.__importStar(require("fs-extra"));
var listr_1 = tslib_1.__importDefault(require("listr"));
var os = tslib_1.__importStar(require("os"));
var base_1 = tslib_1.__importDefault(require("../../base"));
var constants_1 = require("../../utils/constants");
var commons_1 = require("../../utils/core/commons");
var database_1 = require("../../utils/core/database");
var pm2_1 = require("../../utils/core/pm2");
var release_1 = require("../../utils/core/release");
var download_1 = require("../../utils/download");
var flags_1 = require("../../utils/flags");
var start_1 = tslib_1.__importDefault(require("./start"));
var validatePrerequisite = function (installPath) {
    if (!commons_1.isSupportedOS()) {
        throw new Error("Lisk Core installation is not supported on " + os.type() + ".");
    }
    if (fsExtra.pathExistsSync(installPath)) {
        throw new Error("Lisk Core installation already exists in path " + installPath + ".");
    }
};
var validateFlags = function (_a) {
    var network = _a.network, releaseUrl = _a["release-url"], snapshotUrl = _a["snapshot-url"];
    commons_1.validateNetwork(network);
    if (releaseUrl) {
        commons_1.validURL(releaseUrl);
    }
    if (snapshotUrl) {
        commons_1.validURL(snapshotUrl);
    }
};
var installOptions = function (_a, name) {
    var installationPath = _a["installation-path"], network = _a.network, releaseUrl = _a["release-url"], liskVersion = _a["lisk-version"];
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var installPath, installDir, installVersion, _b, version, liskTarUrl, liskTarSHA256Url;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    installPath = commons_1.liskInstall(installationPath);
                    installDir = installPath + "/" + name + "/";
                    return [4, commons_1.getVersionToInstall(network, liskVersion)];
                case 1:
                    installVersion = _c.sent();
                    return [4, release_1.getReleaseInfo(releaseUrl, network, installVersion)];
                case 2:
                    _b = _c.sent(), version = _b.version, liskTarUrl = _b.liskTarUrl, liskTarSHA256Url = _b.liskTarSHA256Url;
                    return [2, {
                            installDir: installDir,
                            version: version,
                            liskTarUrl: liskTarUrl,
                            liskTarSHA256Url: liskTarSHA256Url,
                        }];
            }
        });
    });
};
var InstallCommand = (function (_super) {
    tslib_1.__extends(InstallCommand, _super);
    function InstallCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InstallCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, flags, _b, liskVersion, noSnapshot, noStart, network, snapshotUrl, name, cacheDir, snapshotURL, tasks, instance, error_1, error_2, installDir, dirPath;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(InstallCommand), args = _a.args, flags = _a.flags;
                        _b = flags, liskVersion = _b["lisk-version"], noSnapshot = _b["no-snapshot"], noStart = _b["no-start"], network = _b.network, snapshotUrl = _b["snapshot-url"];
                        name = args.name;
                        cacheDir = this.config.cacheDir;
                        fsExtra.ensureDirSync(cacheDir);
                        snapshotURL = commons_1.liskSnapshotUrl(snapshotUrl, network);
                        tasks = new listr_1.default([
                            {
                                title: "Install Lisk Core " + network + " instance as " + name,
                                task: function () {
                                    return new listr_1.default([
                                        {
                                            title: 'Prepare Install Options',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var options;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4, installOptions(flags, name)];
                                                        case 1:
                                                            options = _a.sent();
                                                            ctx.options = options;
                                                            return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                        {
                                            title: 'Validate root user, flags, prerequisites',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            commons_1.validateNotARootUser();
                                                            validateFlags(flags);
                                                            validatePrerequisite(ctx.options.installDir);
                                                            if (!liskVersion) return [3, 2];
                                                            return [4, commons_1.validateVersion(network, liskVersion)];
                                                        case 1:
                                                            _a.sent();
                                                            ctx.options.version = liskVersion;
                                                            _a.label = 2;
                                                        case 2: return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                        {
                                            title: 'Download Lisk Core Release and Blockchain Snapshot',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var liskTarUrl;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            liskTarUrl = ctx.options.liskTarUrl;
                                                            if (!!noSnapshot) return [3, 2];
                                                            return [4, download_1.download(snapshotURL, cacheDir)];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2: return [4, download_1.downloadAndValidate(liskTarUrl, cacheDir)];
                                                        case 3:
                                                            _a.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                        {
                                            title: 'Extract Lisk Core',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var _a, installDir, liskTarUrl, _b, fileName, fileDir;
                                                return tslib_1.__generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _a = ctx.options, installDir = _a.installDir, liskTarUrl = _a.liskTarUrl;
                                                            _b = commons_1.getDownloadedFileInfo(liskTarUrl, cacheDir), fileName = _b.fileName, fileDir = _b.fileDir;
                                                            commons_1.createDirectory(installDir);
                                                            return [4, download_1.extract(fileDir, fileName, installDir)];
                                                        case 1:
                                                            _c.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                        {
                                            title: 'Register Lisk Core',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var installDir, envConfig;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            installDir = ctx.options.installDir;
                                                            return [4, commons_1.generateEnvConfig(network)];
                                                        case 1:
                                                            envConfig = _a.sent();
                                                            return [4, pm2_1.registerApplication(installDir, network, name, envConfig)];
                                                        case 2:
                                                            _a.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                        {
                                            title: 'Create Database and restore Lisk Blockchain Snapshot',
                                            task: function (ctx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                var installDir, filePath;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            installDir = ctx.options.installDir;
                                                            return [4, database_1.initDB(installDir)];
                                                        case 1:
                                                            _a.sent();
                                                            return [4, database_1.startDatabase(installDir, name)];
                                                        case 2:
                                                            _a.sent();
                                                            return [4, database_1.createUser(installDir, network, name)];
                                                        case 3:
                                                            _a.sent();
                                                            return [4, database_1.createDatabase(installDir, network, name)];
                                                        case 4:
                                                            _a.sent();
                                                            if (!!noSnapshot) return [3, 6];
                                                            filePath = commons_1.getDownloadedFileInfo(snapshotURL, cacheDir).filePath;
                                                            return [4, database_1.restoreSnapshot(installDir, network, filePath, name)];
                                                        case 5:
                                                            _a.sent();
                                                            _a.label = 6;
                                                        case 6: return [4, database_1.stopDatabase(installDir, name)];
                                                        case 7:
                                                            _a.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); },
                                        },
                                    ]);
                                },
                            },
                        ]);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 8]);
                        return [4, pm2_1.describeApplication(name)];
                    case 2:
                        instance = _c.sent();
                        this.log("\n Lisk Core instance " + name + " already installed: ");
                        this.print(instance);
                        return [3, 8];
                    case 3:
                        error_1 = _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4, tasks.run()];
                    case 5:
                        _c.sent();
                        if (!noStart) {
                            return [2, start_1.default.run([name])];
                        }
                        return [3, 7];
                    case 6:
                        error_2 = _c.sent();
                        installDir = error_2.context.options.installDir;
                        dirPath = installDir.substr(0, installDir.length - 1);
                        fsExtra.emptyDirSync(installDir);
                        fsExtra.rmdirSync(dirPath);
                        this.error(JSON.stringify(error_2));
                        return [3, 7];
                    case 7: return [3, 8];
                    case 8: return [2];
                }
            });
        });
    };
    InstallCommand.args = [
        {
            name: 'name',
            description: 'Lisk Core installation directory name.',
            required: true,
        },
    ];
    InstallCommand.description = 'Install an instance of Lisk Core.';
    InstallCommand.examples = [
        'core:install lisk-mainnet',
        'core:install --no-start lisk-mainnet',
        'core:install --no-snapshot lisk-mainnet',
        'core:install --lisk-version=2.0.0 lisk-mainnet',
        'core:install --network=testnet --release-url=https://downloads.lisk.io/lisk/mainnet/1.6.0/lisk-1.6.0-Linux-x86_64.tar.gz lisk-mainnet',
        'core:install --network=mainnet --snapshot-url=https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz custom-mainnet',
    ];
    InstallCommand.flags = {
        json: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.json, { hidden: true })),
        pretty: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true })),
        'installation-path': command_1.flags.string(tslib_1.__assign({}, flags_1.flags.installationPath, { default: '~/.lisk/instances', hidden: true })),
        'lisk-version': command_1.flags.string(tslib_1.__assign({}, flags_1.flags.liskVersion)),
        'no-snapshot': command_1.flags.boolean(tslib_1.__assign({}, flags_1.flags.noSnapshot, { default: false, allowNo: false })),
        'no-start': command_1.flags.boolean(tslib_1.__assign({}, flags_1.flags.noStart, { default: false, allowNo: false })),
        network: command_1.flags.string(tslib_1.__assign({}, flags_1.flags.network, { default: constants_1.NETWORK.MAINNET, options: [
                constants_1.NETWORK.MAINNET,
                constants_1.NETWORK.TESTNET,
                constants_1.NETWORK.BETANET,
                constants_1.NETWORK.ALPHANET,
                constants_1.NETWORK.DEVNET,
            ] })),
        'release-url': command_1.flags.string(tslib_1.__assign({}, flags_1.flags.releaseUrl)),
        'snapshot-url': command_1.flags.string(tslib_1.__assign({}, flags_1.flags.snapshotUrl, { default: constants_1.SNAPSHOT_URL })),
    };
    return InstallCommand;
}(base_1.default));
exports.default = InstallCommand;
//# sourceMappingURL=install.js.map