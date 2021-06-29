"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionStats = void 0;
const getAverage = (transactions) => {
    let transactionCount = 0;
    let total = 0;
    for (const transactionStats of Object.values(transactions)) {
        transactionCount += 1;
        total += transactionStats.count;
    }
    return transactionCount ? total / transactionCount : 0;
};
const getTransactionStats = async (channel, state) => ({
    transactions: state.transactions,
    connectedPeers: (await channel.invoke('app:getConnectedPeers')).length,
    averageReceivedTransactions: getAverage(state.transactions),
});
exports.getTransactionStats = getTransactionStats;
//# sourceMappingURL=transactions.js.map