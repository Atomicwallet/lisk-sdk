"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const base_ipc_client_1 = require("../base_ipc_client");
class StatusCommand extends base_ipc_client_1.BaseIPCClientCommand {
    async run() {
        if (!this._client) {
            this.error('APIClient is not initialized.');
        }
        const info = await this._client.invoke('app:getForgingStatus');
        this.printJSON(info);
    }
}
exports.StatusCommand = StatusCommand;
StatusCommand.description = 'Get forging information for the locally running node.';
StatusCommand.examples = ['forging:status', 'forging:status --data-path ./sample --pretty'];
StatusCommand.flags = {
    ...base_ipc_client_1.BaseIPCClientCommand.flags,
};
//# sourceMappingURL=status.js.map