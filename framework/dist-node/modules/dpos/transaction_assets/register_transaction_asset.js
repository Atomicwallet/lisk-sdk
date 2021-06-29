"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterTransactionAsset = void 0;
const base_asset_1 = require("../../base_asset");
const errors_1 = require("../../../errors");
const utils_1 = require("../utils");
const data_access_1 = require("../data_access");
class RegisterTransactionAsset extends base_asset_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'registerDelegate';
        this.id = 0;
        this.schema = {
            $id: 'lisk/dpos/register',
            type: 'object',
            required: ['username'],
            properties: {
                username: {
                    dataType: 'string',
                    fieldNumber: 1,
                    minLength: 1,
                    maxLength: 20,
                },
            },
        };
    }
    validate({ asset }) {
        if (!utils_1.isUsername(asset.username)) {
            throw new errors_1.ValidationError('The username is in unsupported format', asset.username);
        }
    }
    async apply({ asset, transaction, stateStore, }) {
        const sender = await stateStore.account.get(transaction.senderAddress);
        if (sender.dpos.delegate.username !== '') {
            throw new Error('Account is already a delegate.');
        }
        const usernames = await data_access_1.getRegisteredDelegates(stateStore);
        const usernameExists = usernames.registeredDelegates.find(delegate => delegate.username === asset.username);
        if (!usernameExists) {
            usernames.registeredDelegates.push({
                username: asset.username,
                address: transaction.senderAddress,
            });
            await data_access_1.setRegisteredDelegates(stateStore, usernames);
        }
        if (usernameExists) {
            throw new Error(`Username ${asset.username} is already registered.`);
        }
        sender.dpos.delegate.username = asset.username;
        sender.dpos.delegate.lastForgedHeight = stateStore.chain.lastBlockHeaders[0].height + 1;
        await stateStore.account.set(sender.address, sender);
    }
}
exports.RegisterTransactionAsset = RegisterTransactionAsset;
//# sourceMappingURL=register_transaction_asset.js.map