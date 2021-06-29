"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIPCClientCommand = void 0;
const apiClient = require("@liskhq/lisk-api-client");
const command_1 = require("@oclif/command");
const application_1 = require("../../utils/application");
const flags_1 = require("../../utils/flags");
const path_1 = require("../../utils/path");
class BaseIPCClientCommand extends command_1.Command {
    async finally() {
        if (this._client) {
            await this._client.disconnect();
        }
    }
    async init() {
        const { flags } = this.parse(this.constructor);
        this.baseIPCClientFlags = flags;
        this._dataPath = this.baseIPCClientFlags['data-path']
            ? this.baseIPCClientFlags['data-path']
            : path_1.getDefaultPath(this.config.pjson.name);
        if (!application_1.isApplicationRunning(this._dataPath)) {
            throw new Error(`Application at data path ${this._dataPath} is not running.`);
        }
        this._client = await apiClient.createIPCClient(this._dataPath);
        this._schema = this._client.schemas;
    }
    printJSON(message) {
        if (this.baseIPCClientFlags.pretty) {
            this.log(JSON.stringify(message, undefined, '  '));
        }
        else {
            this.log(JSON.stringify(message));
        }
    }
}
exports.BaseIPCClientCommand = BaseIPCClientCommand;
BaseIPCClientCommand.flags = {
    'data-path': flags_1.flagsWithParser.dataPath,
    pretty: flags_1.flagsWithParser.pretty,
};
//# sourceMappingURL=base_ipc_client.js.map