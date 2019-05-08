"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var listr_1 = tslib_1.__importDefault(require("listr"));
var base_1 = tslib_1.__importDefault(require("../../../base"));
var cache_1 = require("../../../utils/core/cache");
var pm2_1 = require("../../../utils/core/pm2");
var CacheCommand = (function (_super) {
    tslib_1.__extends(CacheCommand, _super);
    function CacheCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CacheCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args, name, _a, installationPath, network, tasks;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        args = this.parse(CacheCommand).args;
                        name = args.name;
                        return [4, pm2_1.describeApplication(name)];
                    case 1:
                        _a = _b.sent(), installationPath = _a.installationPath, network = _a.network;
                        tasks = new listr_1.default([
                            {
                                title: 'Start the cache server',
                                skip: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, cache_1.isCacheEnabled(installationPath, network)];
                                        case 1: return [2, !(_a.sent())];
                                    }
                                }); }); },
                                task: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var isRunning;
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, cache_1.isCacheRunning(installationPath, name)];
                                            case 1:
                                                isRunning = _a.sent();
                                                if (!!isRunning) return [3, 3];
                                                return [4, cache_1.startCache(installationPath, name)];
                                            case 2:
                                                _a.sent();
                                                _a.label = 3;
                                            case 3: return [2];
                                        }
                                    });
                                }); },
                            },
                        ]);
                        return [4, tasks.run()];
                    case 2:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    CacheCommand.args = [
        {
            name: 'name',
            description: 'Lisk Core installation directory name.',
            required: true,
        },
    ];
    CacheCommand.flags = {
        json: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.json, { hidden: true })),
        pretty: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true })),
    };
    CacheCommand.description = 'Start the cache server.';
    CacheCommand.examples = ['core:start:cache mainnet-latest'];
    return CacheCommand;
}(base_1.default));
exports.default = CacheCommand;
//# sourceMappingURL=cache.js.map