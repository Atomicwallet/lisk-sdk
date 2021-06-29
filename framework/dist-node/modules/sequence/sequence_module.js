"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceModule = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const base_module_1 = require("../base_module");
const errors_1 = require("../../errors");
const errors_2 = require("./errors");
class SequenceModule extends base_module_1.BaseModule {
    constructor() {
        super(...arguments);
        this.name = 'sequence';
        this.id = 3;
        this.accountSchema = {
            type: 'object',
            properties: {
                nonce: {
                    fieldNumber: 1,
                    dataType: 'uint64',
                },
            },
            default: {
                nonce: BigInt(0),
            },
        };
    }
    async beforeTransactionApply({ transaction, stateStore, }) {
        const senderAddress = lisk_cryptography_1.getAddressFromPublicKey(transaction.senderPublicKey);
        const senderAccount = await stateStore.account.get(senderAddress);
        if (transaction.nonce < senderAccount.sequence.nonce) {
            throw new errors_2.InvalidNonceError(`Transaction with id:${transaction.id.toString('hex')} nonce is lower than account nonce`, transaction.nonce, senderAccount.sequence.nonce);
        }
    }
    async afterTransactionApply({ transaction, stateStore, }) {
        const senderAddress = lisk_cryptography_1.getAddressFromPublicKey(transaction.senderPublicKey);
        const senderAccount = await stateStore.account.get(senderAddress);
        if (transaction.nonce !== senderAccount.sequence.nonce) {
            throw new errors_1.NonceOutOfBoundsError(`Transaction with id:${transaction.id.toString('hex')} nonce is not equal to account nonce`, transaction.nonce, senderAccount.sequence.nonce);
        }
        senderAccount.sequence.nonce += BigInt(1);
        await stateStore.account.set(senderAddress, senderAccount);
    }
}
exports.SequenceModule = SequenceModule;
//# sourceMappingURL=sequence_module.js.map