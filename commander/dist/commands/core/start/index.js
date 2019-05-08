"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var listr_1 = tslib_1.__importDefault(require("listr"));
var base_1 = tslib_1.__importDefault(require("../../../base"));
var pm2_1 = require("../../../utils/core/pm2");
var cache_1 = tslib_1.__importDefault(require("./cache"));
var database_1 = tslib_1.__importDefault(require("./database"));
var StartCommand = (function (_super) {
    tslib_1.__extends(StartCommand, _super);
    function StartCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StartCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args, name, tasks;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = this.parse(StartCommand).args;
                        name = args.name;
                        return [4, cache_1.default.run([name])];
                    case 1:
                        _a.sent();
                        return [4, database_1.default.run([name])];
                    case 2:
                        _a.sent();
                        tasks = new listr_1.default([
                            {
                                title: 'Start Lisk Core instance',
                                task: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    return tslib_1.__generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, pm2_1.restartApplication(name)];
                                            case 1:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                }); },
                            },
                        ]);
                        return [4, tasks.run()];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    StartCommand.args = [
        {
            name: 'name',
            description: 'Lisk Core installation directory name.',
            required: true,
        },
    ];
    StartCommand.flags = {
        json: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.json, { hidden: true })),
        pretty: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true })),
    };
    StartCommand.description = 'Start Lisk Core instance.';
    StartCommand.examples = ['core:start mainnet-latest'];
    return StartCommand;
}(base_1.default));
exports.default = StartCommand;
//# sourceMappingURL=index.js.map