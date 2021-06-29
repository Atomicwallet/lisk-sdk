"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCurrentlyPunished = exports.validateSignature = exports.isUsername = exports.isNullCharacterIncluded = exports.getWaitingPeriod = exports.getMinWaitingHeight = exports.getPunishmentPeriod = exports.getMinPunishedHeight = exports.sortUnlocking = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const constants_1 = require("./constants");
const sortUnlocking = (unlocks) => {
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
exports.sortUnlocking = sortUnlocking;
const getMinPunishedHeight = (sender, delegate) => {
    if (delegate.dpos.delegate.pomHeights.length === 0) {
        return 0;
    }
    const lastPomHeight = Math.max(...delegate.dpos.delegate.pomHeights);
    return sender.address.equals(delegate.address)
        ? lastPomHeight + constants_1.SELF_VOTE_PUNISH_TIME
        : lastPomHeight + constants_1.VOTER_PUNISH_TIME;
};
exports.getMinPunishedHeight = getMinPunishedHeight;
const getPunishmentPeriod = (sender, delegateAccount, lastBlockHeight) => {
    const currentHeight = lastBlockHeight + 1;
    const minPunishedHeight = exports.getMinPunishedHeight(sender, delegateAccount);
    const remainingBlocks = minPunishedHeight - currentHeight;
    return remainingBlocks < 0 ? 0 : remainingBlocks;
};
exports.getPunishmentPeriod = getPunishmentPeriod;
const getMinWaitingHeight = (senderAddress, delegateAddress, unlockObject) => unlockObject.unvoteHeight +
    (senderAddress.equals(delegateAddress) ? constants_1.WAIT_TIME_SELF_VOTE : constants_1.WAIT_TIME_VOTE);
exports.getMinWaitingHeight = getMinWaitingHeight;
const getWaitingPeriod = (senderAddress, delegateAddress, lastBlockHeight, unlockObject) => {
    const currentHeight = lastBlockHeight + 1;
    const minWaitingHeight = exports.getMinWaitingHeight(senderAddress, delegateAddress, unlockObject);
    const remainingBlocks = minWaitingHeight - currentHeight;
    return remainingBlocks < 0 ? 0 : remainingBlocks;
};
exports.getWaitingPeriod = getWaitingPeriod;
const isNullCharacterIncluded = (input) => new RegExp(/\\0|\\u0000|\\x00/).test(input);
exports.isNullCharacterIncluded = isNullCharacterIncluded;
const isUsername = (username) => {
    if (exports.isNullCharacterIncluded(username)) {
        return false;
    }
    if (username !== username.trim().toLowerCase()) {
        return false;
    }
    return /^[a-z0-9!@$&_.]+$/g.test(username);
};
exports.isUsername = isUsername;
const validateSignature = (tag, networkIdentifier, publicKey, signature, bytes) => lisk_cryptography_1.verifyData(tag, networkIdentifier, bytes, signature, publicKey);
exports.validateSignature = validateSignature;
const isCurrentlyPunished = (height, pomHeights) => {
    if (pomHeights.length === 0) {
        return false;
    }
    const lastPomHeight = Math.max(...pomHeights);
    if (height - lastPomHeight < constants_1.PUNISHMENT_PERIOD) {
        return true;
    }
    return false;
};
exports.isCurrentlyPunished = isCurrentlyPunished;
//# sourceMappingURL=utils.js.map