"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.updateStatesOnNewTransaction = exports.updateStatesOnNewBlock = void 0;
const configDevEnvValues = {
    applicationUrl: 'ws://localhost:8080/ws',
    applicationName: 'Lisk',
};
const MAX_BLOCKS = 103 * 3;
const MAX_TRANSACTIONS = 150;
const sortByBlockHeight = (a, b) => b.header.height - a.header.height;
const updateStatesOnNewBlock = (client, newBlockStr, blocks, confirmedTransactions, unconfirmedTransactions) => {
    const newBlock = client.block.toJSON(client.block.decode(newBlockStr));
    let newBlocks = blocks;
    if (!blocks.find(b => b.header.height === newBlock.header.height)) {
        newBlocks = [newBlock, ...blocks].slice(0, MAX_BLOCKS);
    }
    newBlocks.sort(sortByBlockHeight);
    for (const trs of newBlock.payload) {
        confirmedTransactions.unshift(trs);
    }
    const confirmedTransactionsIds = confirmedTransactions.map(t => t.id);
    const newUnconfirmedTransactions = unconfirmedTransactions
        .filter(t => !confirmedTransactionsIds.includes(t.id))
        .slice(0, MAX_TRANSACTIONS);
    const newConfirmedTransactions = confirmedTransactions.slice(0, MAX_TRANSACTIONS);
    return {
        blocks: newBlocks,
        confirmedTransactions: newConfirmedTransactions,
        unconfirmedTransactions: newUnconfirmedTransactions,
    };
};
exports.updateStatesOnNewBlock = updateStatesOnNewBlock;
const updateStatesOnNewTransaction = (client, newTransactionStr, unconfirmedTransactions) => {
    const transaction = client.transaction.toJSON(client.transaction.decode(newTransactionStr));
    return [transaction, ...unconfirmedTransactions].slice(-1 * MAX_TRANSACTIONS);
};
exports.updateStatesOnNewTransaction = updateStatesOnNewTransaction;
const getConfig = async () => {
    if (process.env.NODE_ENV === 'development') {
        return configDevEnvValues;
    }
    const apiResponse = await fetch('/api/config');
    const result = await apiResponse.json();
    return result;
};
exports.getConfig = getConfig;
//# sourceMappingURL=index.js.map