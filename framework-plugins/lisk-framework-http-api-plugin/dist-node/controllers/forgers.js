"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForgers = void 0;
const getForgers = (channel, codec) => async (_req, res, next) => {
    let forgersFrameworkInfo;
    try {
        forgersFrameworkInfo = await channel.invoke('app:getForgers');
    }
    catch (err) {
        next(err);
        return;
    }
    try {
        const forgerAccounts = await channel.invoke('app:getAccounts', {
            address: forgersFrameworkInfo.map(info => info.address),
        });
        const data = [];
        for (let i = 0; i < forgerAccounts.length; i += 1) {
            const account = codec.decodeAccount(forgerAccounts[i]);
            data.push({
                username: account.dpos.delegate.username,
                totalVotesReceived: account.dpos.delegate.totalVotesReceived,
                ...forgersFrameworkInfo[i],
            });
        }
        res.status(200).json({ data, meta: { count: forgerAccounts.length } });
    }
    catch (err) {
        next(err);
    }
};
exports.getForgers = getForgers;
//# sourceMappingURL=forgers.js.map