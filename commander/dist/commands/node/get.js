"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var api_1 = require("../../utils/api");
var GetCommand = (function (_super) {
    tslib_1.__extends(GetCommand, _super);
    function GetCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GetCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var showForgingStatus, client, baseInfo, fullInfo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        showForgingStatus = this.parse(GetCommand).flags["forging-status"];
                        client = api_1.getAPIClient(this.userConfig.api);
                        return [4, Promise.all([
                                client.node.getConstants(),
                                client.node.getStatus(),
                            ]).then(function (_a) {
                                var _b = tslib_1.__read(_a, 2), constantsResponse = _b[0], statusResponse = _b[1];
                                return (tslib_1.__assign({}, constantsResponse.data, statusResponse.data));
                            })];
                    case 1:
                        baseInfo = _a.sent();
                        if (!showForgingStatus) {
                            this.print(baseInfo);
                            return [2];
                        }
                        return [4, client.node
                                .getForgingStatus()
                                .then(function (forgingResponse) { return (tslib_1.__assign({}, baseInfo, { forgingStatus: forgingResponse.data || [] })); })
                                .catch(function (error) { return (tslib_1.__assign({}, baseInfo, { forgingStatus: error.message })); })];
                    case 2:
                        fullInfo = _a.sent();
                        this.print(fullInfo);
                        return [2];
                }
            });
        });
    };
    GetCommand.description = "Get the network status from a Lisk Core instance.";
    GetCommand.examples = ['node:get', 'node:get --forging-status'];
    GetCommand.flags = tslib_1.__assign({}, base_1.default.flags, { 'forging-status': command_1.flags.boolean({
            description: 'Additionally provides information about forging status.',
        }) });
    return GetCommand;
}(base_1.default));
exports.default = GetCommand;
//# sourceMappingURL=get.js.map