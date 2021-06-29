"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForgingInfo = void 0;
const db_1 = require("../db");
const getForgingInfo = async (channel, codec, db) => {
    const forgingDelegates = await channel.invoke('app:getForgingStatus');
    const encodedAccounts = await channel.invoke('app:getAccounts', {
        address: forgingDelegates.map(forger => forger.address),
    });
    const forgerAccounts = encodedAccounts.map(encodedAccount => codec.decodeAccount(encodedAccount));
    const data = [];
    for (const forgerAccount of forgerAccounts) {
        const forgerAddressBinary = Buffer.from(forgerAccount.address, 'hex').toString('binary');
        const forgerInfo = await db_1.getForgerInfo(db, forgerAddressBinary);
        const forger = forgingDelegates.find(aForger => aForger.address === forgerAccount.address);
        if (forger) {
            data.push({
                ...forger,
                username: forgerAccount.dpos.delegate.username,
                totalReceivedFees: forgerInfo.totalReceivedFees.toString(),
                totalReceivedRewards: forgerInfo.totalReceivedRewards.toString(),
                totalProducedBlocks: forgerInfo.totalProducedBlocks,
                totalVotesReceived: forgerAccount.dpos.delegate.totalVotesReceived,
                consecutiveMissedBlocks: forgerAccount.dpos.delegate.consecutiveMissedBlocks,
            });
        }
    }
    return data;
};
exports.getForgingInfo = getForgingInfo;
//# sourceMappingURL=forging_info.js.map