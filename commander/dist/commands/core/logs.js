"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var childProcess = tslib_1.__importStar(require("child_process"));
var base_1 = tslib_1.__importDefault(require("../../base"));
var pm2_1 = require("../../utils/core/pm2");
var LogsCommand = (function (_super) {
    tslib_1.__extends(LogsCommand, _super);
    function LogsCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogsCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args, name, _a, installationPath, network, fileName, tail, stderr, stdout;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        args = this.parse(LogsCommand).args;
                        name = args.name;
                        return [4, pm2_1.describeApplication(name)];
                    case 1:
                        _a = _b.sent(), installationPath = _a.installationPath, network = _a.network;
                        fileName = installationPath + "/logs/" + network + "/lisk.log";
                        tail = childProcess.spawn('tail', ['-f', fileName]);
                        stderr = tail.stderr, stdout = tail.stdout;
                        stdout.on('data', function (data) {
                            _this.log(data.toString('utf-8').replace(/\n/, ''));
                        });
                        stderr.on('data', function (data) {
                            _this.log(data.message);
                        });
                        tail.on('close', function () {
                            tail.removeAllListeners();
                        });
                        tail.on('error', function (err) {
                            _this.log("Failed to process logs for " + name + " with error: " + err.message);
                            tail.removeAllListeners();
                        });
                        return [2];
                }
            });
        });
    };
    LogsCommand.args = [
        {
            name: 'name',
            description: 'Lisk Core installation directory name.',
            required: true,
        },
    ];
    LogsCommand.flags = {
        json: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.json, { hidden: true })),
        pretty: command_1.flags.boolean(tslib_1.__assign({}, base_1.default.flags.pretty, { hidden: true })),
    };
    LogsCommand.description = 'Stream logs of a Lisk Core instance.';
    LogsCommand.examples = ['core:logs mainnet-latest'];
    return LogsCommand;
}(base_1.default));
exports.default = LogsCommand;
//# sourceMappingURL=logs.js.map