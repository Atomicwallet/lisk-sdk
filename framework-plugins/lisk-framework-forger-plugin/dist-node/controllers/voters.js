"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVoters = void 0;
const db_1 = require("../db");
const getVoters = async (channel, codec, db) => {
    const forgersList = await channel.invoke('app:getForgingStatus');
    const forgerAccounts = (await channel.invoke('app:getAccounts', {
        address: forgersList.map(forger => forger.address),
    })).map(encodedAccount => codec.decodeAccount(encodedAccount));
    const result = [];
    for (const account of forgerAccounts) {
        const forgerInfo = await db_1.getForgerInfo(db, Buffer.from(account.address, 'hex').toString('binary'));
        result.push({
            address: account.address,
            username: account.dpos.delegate.username,
            totalVotesReceived: account.dpos.delegate.totalVotesReceived,
            voters: forgerInfo.votesReceived.map(vote => ({
                address: vote.address.toString('hex'),
                amount: vote.amount.toString(),
            })),
        });
    }
    return result;
};
exports.getVoters = getVoters;
//# sourceMappingURL=voters.js.map