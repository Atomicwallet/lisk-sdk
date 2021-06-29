"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommand = void 0;
const base_ipc_client_1 = require("../base_ipc_client");
class GetCommand extends base_ipc_client_1.BaseIPCClientCommand {
    async run() {
        const { args } = this.parse(GetCommand);
        const { address } = args;
        if (!this._client) {
            this.error('APIClient is not initialized.');
        }
        try {
            const account = await this._client.account.get(Buffer.from(address, 'hex'));
            this.printJSON(this._client.account.toJSON(account));
        }
        catch (errors) {
            const errorMessage = Array.isArray(errors)
                ? errors.map(err => err.message).join(',')
                : errors;
            if (/^Specified key accounts:address:(.*)does not exist/.test(errors.message)) {
                this.error(`Account with address '${address}' was not found.`);
            }
            else {
                this.error(errorMessage);
            }
        }
    }
}
exports.GetCommand = GetCommand;
GetCommand.description = 'Get account information for a given address.';
GetCommand.args = [
    {
        name: 'address',
        required: true,
        description: 'Address of an account in a hex format.',
    },
];
GetCommand.examples = ['account:get ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815'];
GetCommand.flags = {
    ...base_ipc_client_1.BaseIPCClientCommand.flags,
};
//# sourceMappingURL=get.js.map