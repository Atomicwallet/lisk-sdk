"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAverage = (transactions) => {
    let transactionCount = 0;
    let total = 0;
    for (const transactionStats of Object.values(transactions)) {
        transactionCount += 1;
        total += transactionStats.count;
    }
    return transactionCount ? total / transactionCount : 0;
};
exports.getTransactionStats = async (channel, state) => ({
    transactions: state.transactions,
    connectedPeers: (await channel.invoke('app:getConnectedPeers')).length,
    averageReceivedTransactions: getAverage(state.transactions),
});
//# sourceMappingURL=transactions.js.map