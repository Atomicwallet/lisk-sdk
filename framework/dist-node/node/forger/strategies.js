"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighFeeForgingStrategy = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
class HighFeeForgingStrategy {
    constructor({ chainModule, processorModule, transactionPoolModule, maxPayloadLength, }) {
        this._chainModule = chainModule;
        this._processorModule = processorModule;
        this._transactionPoolModule = transactionPoolModule;
        this._constants = { maxPayloadLength };
    }
    async getTransactionsForBlock() {
        var _a;
        const readyTransactions = [];
        const stateStore = await this._chainModule.newStateStore();
        const transactionsBySender = this._transactionPoolModule.getProcessableTransactions();
        let blockPayloadSize = 0;
        const feePriorityHeap = new lisk_utils_1.dataStructures.MaxHeap();
        for (const transactions of transactionsBySender.values()) {
            const lowestNonceTrx = transactions[0];
            feePriorityHeap.push(lowestNonceTrx.feePriority, lowestNonceTrx);
        }
        while (transactionsBySender.size > 0) {
            const lowestNonceHighestFeeTrx = (_a = feePriorityHeap.pop()) === null || _a === void 0 ? void 0 : _a.value;
            if (!lowestNonceHighestFeeTrx) {
                throw new Error('lowest nonce tx must exist');
            }
            const senderId = lisk_cryptography_1.getAddressFromPublicKey(lowestNonceHighestFeeTrx.senderPublicKey);
            stateStore.createSnapshot();
            try {
                await this._processorModule.verifyTransactions([lowestNonceHighestFeeTrx], stateStore);
            }
            catch (error) {
                stateStore.restoreSnapshot();
                transactionsBySender.delete(senderId);
                continue;
            }
            const trsByteSize = lowestNonceHighestFeeTrx.getBytes().length;
            if (blockPayloadSize + trsByteSize > this._constants.maxPayloadLength) {
                break;
            }
            readyTransactions.push(lowestNonceHighestFeeTrx);
            blockPayloadSize += trsByteSize;
            const [, ...choppedArray] = transactionsBySender.get(senderId);
            transactionsBySender.set(senderId, choppedArray);
            const remainingTransactions = transactionsBySender.get(senderId);
            if (!remainingTransactions || remainingTransactions.length === 0) {
                transactionsBySender.delete(senderId);
                continue;
            }
            const nextLowestNonceTransactions = transactionsBySender.get(senderId);
            feePriorityHeap.push(nextLowestNonceTransactions[0].feePriority, nextLowestNonceTransactions[0]);
        }
        return readyTransactions;
    }
}
exports.HighFeeForgingStrategy = HighFeeForgingStrategy;
//# sourceMappingURL=strategies.js.map