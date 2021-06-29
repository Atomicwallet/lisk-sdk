"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoCommand = void 0;
const base_ipc_client_1 = require("../base_ipc_client");
class InfoCommand extends base_ipc_client_1.BaseIPCClientCommand {
    async run() {
        if (!this._client) {
            this.error('APIClient is not initialized.');
        }
        try {
            const nodeInfo = await this._client.node.getNodeInfo();
            this.printJSON(nodeInfo);
        }
        catch (errors) {
            const errorMessage = Array.isArray(errors)
                ? errors.map(err => err.message).join(',')
                : errors;
            this.error(errorMessage);
        }
    }
}
exports.InfoCommand = InfoCommand;
InfoCommand.description = 'Get node information from a running application.';
InfoCommand.examples = ['node:info', 'node:info --data-path ./lisk'];
InfoCommand.flags = {
    ...base_ipc_client_1.BaseIPCClientCommand.flags,
};
//# sourceMappingURL=info.js.map