"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnlockTransactionAsset = void 0;
const base_asset_1 = require("../../base_asset");
const errors_1 = require("../../../errors");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class UnlockTransactionAsset extends base_asset_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'unlockToken';
        this.id = 2;
        this.schema = {
            $id: 'lisk/dpos/unlock',
            type: 'object',
            required: ['unlockObjects'],
            properties: {
                unlockObjects: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 20,
                    items: {
                        type: 'object',
                        required: ['delegateAddress', 'amount', 'unvoteHeight'],
                        properties: {
                            delegateAddress: {
                                dataType: 'bytes',
                                fieldNumber: 1,
                                minLength: 20,
                                maxLength: 20,
                            },
                            amount: {
                                dataType: 'uint64',
                                fieldNumber: 2,
                            },
                            unvoteHeight: {
                                dataType: 'uint32',
                                fieldNumber: 3,
                            },
                        },
                    },
                    fieldNumber: 1,
                },
            },
        };
    }
    validate({ asset }) {
        for (const unlock of asset.unlockObjects) {
            if (unlock.unvoteHeight <= 0) {
                throw new errors_1.ValidationError('Height cannot be less than or equal to zero', unlock.unvoteHeight.toString());
            }
            if (unlock.amount <= BigInt(0)) {
                throw new errors_1.ValidationError('Amount cannot be less than or equal to zero.', unlock.amount.toString());
            }
            if (unlock.amount % constants_1.AMOUNT_MULTIPLIER_FOR_VOTES !== BigInt(0)) {
                throw new errors_1.ValidationError('Amount should be multiple of 10 * 10^8.', unlock.amount.toString());
            }
        }
    }
    async apply({ asset, transaction, stateStore: store, reducerHandler, }) {
        for (const unlock of asset.unlockObjects) {
            const sender = await store.account.get(transaction.senderAddress);
            const delegate = await store.account.get(unlock.delegateAddress);
            if (delegate.dpos.delegate.username === '') {
                throw new Error('Voted account is not registered as delegate.');
            }
            const unlockIndex = sender.dpos.unlocking.findIndex(obj => obj.amount === unlock.amount &&
                obj.delegateAddress.equals(unlock.delegateAddress) &&
                obj.unvoteHeight === unlock.unvoteHeight);
            if (unlockIndex < 0) {
                throw new Error('Corresponding unlocking object not found.');
            }
            const waitingPeriod = utils_1.getWaitingPeriod(sender.address, delegate.address, store.chain.lastBlockHeaders[0].height, unlock);
            if (waitingPeriod > 0) {
                throw new Error('Unlocking is not permitted as it is still within the waiting period.');
            }
            const punishmentPeriod = utils_1.getPunishmentPeriod(sender, delegate, store.chain.lastBlockHeaders[0].height);
            if (punishmentPeriod > 0) {
                throw new Error('Unlocking is not permitted as the delegate is currently being punished.');
            }
            sender.dpos.unlocking.splice(unlockIndex, 1);
            await reducerHandler.invoke('token:credit', {
                address: transaction.senderAddress,
                amount: unlock.amount,
            });
            await store.account.set(sender.address, sender);
        }
    }
}
exports.UnlockTransactionAsset = UnlockTransactionAsset;
//# sourceMappingURL=unlock_transaction_asset.js.map