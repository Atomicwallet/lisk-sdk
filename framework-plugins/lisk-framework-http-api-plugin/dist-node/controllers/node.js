"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_validator_1 = require("@liskhq/lisk-validator");
exports.getNodeInfo = (channel) => async (_req, res, next) => {
    try {
        const nodeStatusAndInfo = await channel.invoke('app:getNodeInfo');
        res.status(200).send({ data: nodeStatusAndInfo, meta: {} });
    }
    catch (err) {
        next(err);
    }
};
exports.getTransactions = (channel, codec) => async (req, res, next) => {
    const { limit, offset } = req.query;
    if (limit && !lisk_validator_1.isNumberString(limit)) {
        res.status(400).send({
            errors: [{ message: 'The limit query parameter should be a number.' }],
        });
        return;
    }
    const limitNumber = Number(limit) || 10;
    if (offset && !lisk_validator_1.isNumberString(offset)) {
        res.status(400).send({
            errors: [{ message: 'The offset query parameter should be a number.' }],
        });
        return;
    }
    const offsetNumber = Number(offset) || 0;
    let transactionsInPool;
    try {
        transactionsInPool = await channel.invoke('app:getTransactionsFromPool');
    }
    catch (err) {
        next(err);
        return;
    }
    const totalTransactionsInPool = transactionsInPool.length;
    transactionsInPool = transactionsInPool.slice(offsetNumber || 0, Math.min(limitNumber + offsetNumber, transactionsInPool.length));
    const decodedTransactions = [];
    for (const transaction of transactionsInPool) {
        decodedTransactions.push(codec.decodeTransaction(transaction));
    }
    res.status(200).json({
        data: decodedTransactions,
        meta: { limit: limitNumber, offset: offsetNumber, total: totalTransactionsInPool },
    });
};
//# sourceMappingURL=node.js.map