"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferAsset = void 0;
const constants_1 = require("./constants");
const base_asset_1 = require("../base_asset");
class TransferAsset extends base_asset_1.BaseAsset {
    constructor(minRemainingBalance) {
        super();
        this.name = 'transfer';
        this.id = 0;
        this.schema = {
            $id: 'lisk/transfer-asset',
            title: 'Transfer transaction asset',
            type: 'object',
            required: ['amount', 'recipientAddress', 'data'],
            properties: {
                amount: {
                    dataType: 'uint64',
                    fieldNumber: 1,
                },
                recipientAddress: {
                    dataType: 'bytes',
                    fieldNumber: 2,
                    minLength: 20,
                    maxLength: 20,
                },
                data: {
                    dataType: 'string',
                    fieldNumber: 3,
                    minLength: 0,
                    maxLength: 64,
                },
            },
        };
        this._minRemainingBalance = minRemainingBalance;
    }
    async apply({ asset, transaction, stateStore }) {
        const sender = await stateStore.account.get(transaction.senderAddress);
        if (!sender) {
            throw new Error(`Account does not exist for senderAddress: ${transaction.senderAddress.toString('hex')}`);
        }
        sender.token.balance -= asset.amount;
        await stateStore.account.set(sender.address, sender);
        const recipient = await stateStore.account.getOrDefault(asset.recipientAddress);
        recipient.token.balance += asset.amount;
        if (recipient.token.balance > BigInt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            throw new Error(`Invalid transfer amount: ${asset.amount.toString()}. Maximum allowed balance for recipient is: ${constants_1.MAX_TRANSACTION_AMOUNT}`);
        }
        if (recipient.token.balance < this._minRemainingBalance) {
            throw new Error(`Recipient account ${recipient.address.toString('hex')} does not meet the minimum remaining balance requirement: ${this._minRemainingBalance}.`);
        }
        await stateStore.account.set(recipient.address, recipient);
    }
}
exports.TransferAsset = TransferAsset;
//# sourceMappingURL=transfer_asset.js.map