"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const constants_1 = require("./constants");
exports.sortUnlocking = (unlocks) => {
    unlocks.sort((a, b) => {
        if (!a.delegateAddress.equals(b.delegateAddress)) {
            return a.delegateAddress.compare(b.delegateAddress);
        }
        if (a.unvoteHeight !== b.unvoteHeight) {
            return b.unvoteHeight - a.unvoteHeight;
        }
        const diff = b.amount - a.amount;
        if (diff > BigInt(0)) {
            return 1;
        }
        if (diff < BigInt(0)) {
            return -1;
        }
        return 0;
    });
};
exports.getMinPunishedHeight = (sender, delegate) => {
    if (delegate.dpos.delegate.pomHeights.length === 0) {
        return 0;
    }
    const lastPomHeight = Math.max(...delegate.dpos.delegate.pomHeights);
    return sender.address.equals(delegate.address)
        ? lastPomHeight + constants_1.SELF_VOTE_PUNISH_TIME
        : lastPomHeight + constants_1.VOTER_PUNISH_TIME;
};
exports.getPunishmentPeriod = (sender, delegateAccount, lastBlockHeight) => {
    const currentHeight = lastBlockHeight + 1;
    const minPunishedHeight = exports.getMinPunishedHeight(sender, delegateAccount);
    const remainingBlocks = minPunishedHeight - currentHeight;
    return remainingBlocks < 0 ? 0 : remainingBlocks;
};
exports.getMinWaitingHeight = (senderAddress, delegateAddress, unlockObject) => unlockObject.unvoteHeight +
    (senderAddress.equals(delegateAddress) ? constants_1.WAIT_TIME_SELF_VOTE : constants_1.WAIT_TIME_VOTE);
exports.getWaitingPeriod = (senderAddress, delegateAddress, lastBlockHeight, unlockObject) => {
    const currentHeight = lastBlockHeight + 1;
    const minWaitingHeight = exports.getMinWaitingHeight(senderAddress, delegateAddress, unlockObject);
    const remainingBlocks = minWaitingHeight - currentHeight;
    return remainingBlocks < 0 ? 0 : remainingBlocks;
};
exports.isNullCharacterIncluded = (input) => new RegExp(/\\0|\\u0000|\\x00/).test(input);
exports.isUsername = (username) => {
    if (exports.isNullCharacterIncluded(username)) {
        return false;
    }
    if (username !== username.trim().toLowerCase()) {
        return false;
    }
    return /^[a-z0-9!@$&_.]+$/g.test(username);
};
exports.validateSignature = (publicKey, signature, bytes) => lisk_cryptography_1.verifyData(bytes, signature, publicKey);
exports.isCurrentlyPunished = (height, pomHeights) => {
    if (pomHeights.length === 0) {
        return false;
    }
    const lastPomHeight = Math.max(...pomHeights);
    if (height - lastPomHeight < constants_1.PUNISHMENT_PERIOD) {
        return true;
    }
    return false;
};
//# sourceMappingURL=utils.js.map