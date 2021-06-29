"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommand = void 0;
const base_ipc_client_1 = require("../base_ipc_client");
class GetCommand extends base_ipc_client_1.BaseIPCClientCommand {
    async run() {
        const { args } = this.parse(GetCommand);
        const { id: transactionId } = args;
        if (!this._client) {
            this.error('APIClient is not initialized.');
        }
        try {
            const transaction = await this._client.transaction.get(Buffer.from(transactionId, 'hex'));
            this.printJSON(this._client.transaction.toJSON(transaction));
        }
        catch (errors) {
            const errorMessage = Array.isArray(errors)
                ? errors.map(err => err.message).join(',')
                : errors;
            if (/^Specified key transactions:id:(.*)does not exist/.test(errors.message)) {
                this.error(`Transaction with id '${transactionId}' was not found.`);
            }
            else {
                this.error(errorMessage);
            }
        }
    }
}
exports.GetCommand = GetCommand;
GetCommand.description = 'Get transaction from local node by ID.';
GetCommand.args = [
    {
        name: 'id',
        required: true,
        description: 'Transaction ID in hex format.',
    },
];
GetCommand.examples = [
    'transaction:get eab06c6a22e88bca7150e0347a7d976acd070cb9284423e6eabecd657acc1263',
];
GetCommand.flags = {
    ...base_ipc_client_1.BaseIPCClientCommand.flags,
};
//# sourceMappingURL=get.js.map