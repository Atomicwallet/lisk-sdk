"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDelegateProductivity = exports.createVoteWeightsSnapshot = exports.updateDelegateList = exports.pickStandByDelegate = exports.shuffleDelegateList = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const data_access_1 = require("./data_access");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const shuffleDelegateList = (previousRoundSeed1, addresses) => {
    const delegateList = [...addresses].map(delegate => ({
        address: delegate,
    }));
    for (const delegate of delegateList) {
        const seedSource = Buffer.concat([previousRoundSeed1, delegate.address]);
        delegate.roundHash = lisk_cryptography_1.hash(seedSource);
    }
    delegateList.sort((delegate1, delegate2) => {
        const diff = delegate1.roundHash.compare(delegate2.roundHash);
        if (diff !== 0) {
            return diff;
        }
        return delegate1.address.compare(delegate2.address);
    });
    return delegateList.map(delegate => delegate.address);
};
exports.shuffleDelegateList = shuffleDelegateList;
const pickStandByDelegate = (delegateWeights, randomSeed) => {
    const seedNumber = randomSeed.readBigUInt64BE();
    const totalVoteWeight = delegateWeights.reduce((prev, current) => prev + BigInt(current.voteWeight), BigInt(0));
    let threshold = seedNumber % totalVoteWeight;
    for (let i = 0; i < delegateWeights.length; i += 1) {
        const voteWeight = BigInt(delegateWeights[i].voteWeight);
        if (voteWeight > threshold) {
            return i;
        }
        threshold -= voteWeight;
    }
    return -1;
};
exports.pickStandByDelegate = pickStandByDelegate;
const updateDelegateList = async ({ round, randomSeeds, stateStore, activeDelegates, standbyDelegates, consensus, }) => {
    if (!randomSeeds.length) {
        throw new Error('Random seed must be provided');
    }
    const voteWeights = await data_access_1.getVoteWeights(stateStore);
    const voteWeight = voteWeights.find(vw => vw.round === round);
    if (!voteWeight) {
        throw new Error(`Corresponding vote weight for round ${round.toString()} not found`);
    }
    const hasStandbySlot = voteWeight.delegates.length > activeDelegates;
    const activeDelegateAddresses = voteWeight.delegates
        .slice(0, activeDelegates)
        .map(vw => vw.address);
    const standbyDelegateAddresses = [];
    const standbyDelegateVoteWeights = hasStandbySlot
        ? voteWeight.delegates.slice(activeDelegates)
        : [];
    if (standbyDelegateVoteWeights.length > 0 &&
        standbyDelegateVoteWeights.length <= standbyDelegates) {
        for (const delegate of standbyDelegateVoteWeights) {
            standbyDelegateAddresses.push(delegate.address);
        }
    }
    else if (standbyDelegateVoteWeights.length > standbyDelegates) {
        for (let i = 0; i < standbyDelegates; i += 1) {
            const standbyDelegateIndex = exports.pickStandByDelegate(standbyDelegateVoteWeights, randomSeeds[i % randomSeeds.length]);
            if (standbyDelegateIndex < 0) {
                throw new Error('Fail to pick standby delegate');
            }
            standbyDelegateAddresses.push(standbyDelegateVoteWeights[standbyDelegateIndex].address);
            standbyDelegateVoteWeights.splice(standbyDelegateIndex, 1);
        }
    }
    const delegates = activeDelegateAddresses.concat(standbyDelegateAddresses);
    const shuffledDelegates = exports.shuffleDelegateList(randomSeeds[0], delegates);
    const delegatesList = shuffledDelegates.map(address => ({
        address,
        isConsensusParticipant: !standbyDelegateAddresses.includes(address),
    }));
    await consensus.updateDelegates(delegatesList);
};
exports.updateDelegateList = updateDelegateList;
const createVoteWeightsSnapshot = async ({ height, stateStore, round, logger, voteWeightCapRate = constants_1.DEFAULT_VOTE_WEIGHT_CAP_RATE, activeDelegates = constants_1.DEFAULT_ACTIVE_DELEGATE, standbyDelegates = constants_1.DEFAULT_STANDBY_DELEGATE, standbyThreshold = constants_1.DEFAULT_STANDBY_THRESHOLD, }) => {
    var _a;
    logger.debug(`Creating vote weight snapshot for round: ${round.toString()}`);
    const delegateUserNames = await data_access_1.getRegisteredDelegates(stateStore);
    const delegates = await Promise.all(delegateUserNames.registeredDelegates.map(async (delegate) => stateStore.account.get(delegate.address)));
    for (const account of delegates) {
        if (utils_1.isCurrentlyPunished(height, account.dpos.delegate.pomHeights)) {
            account.dpos.delegate.totalVotesReceived = BigInt(0);
            continue;
        }
        const selfVote = account.dpos.sentVotes.find(vote => vote.delegateAddress.equals(account.address));
        const cappedValue = ((_a = selfVote === null || selfVote === void 0 ? void 0 : selfVote.amount) !== null && _a !== void 0 ? _a : BigInt(0)) * BigInt(voteWeightCapRate);
        if (account.dpos.delegate.totalVotesReceived > cappedValue) {
            account.dpos.delegate.totalVotesReceived = cappedValue;
        }
    }
    delegates.sort((a, b) => {
        const diff = b.dpos.delegate.totalVotesReceived - a.dpos.delegate.totalVotesReceived;
        if (diff > BigInt(0)) {
            return 1;
        }
        if (diff < BigInt(0)) {
            return -1;
        }
        return a.address.compare(b.address);
    });
    const activeDelegatesList = [];
    const standbyDelegatesList = [];
    for (const account of delegates) {
        if (account.dpos.delegate.isBanned) {
            continue;
        }
        if (activeDelegatesList.length < activeDelegates) {
            activeDelegatesList.push({
                address: account.address,
                voteWeight: account.dpos.delegate.totalVotesReceived,
            });
            continue;
        }
        if (account.dpos.delegate.totalVotesReceived >= standbyThreshold) {
            standbyDelegatesList.push({
                address: account.address,
                voteWeight: account.dpos.delegate.totalVotesReceived,
            });
            continue;
        }
        if (standbyDelegatesList.length < standbyDelegates) {
            standbyDelegatesList.push({
                address: account.address,
                voteWeight: account.dpos.delegate.totalVotesReceived,
            });
            continue;
        }
        break;
    }
    const delegateVoteWeights = activeDelegatesList.concat(standbyDelegatesList);
    const voteWeight = {
        round,
        delegates: delegateVoteWeights,
    };
    const voteWeights = await data_access_1.getVoteWeights(stateStore);
    const voteWeightsIndex = voteWeights.findIndex(vw => vw.round === round);
    if (voteWeightsIndex === -1) {
        voteWeights.push(voteWeight);
    }
    else {
        voteWeights[voteWeightsIndex] = voteWeight;
    }
    await data_access_1.setVoteWeights(stateStore, voteWeights);
};
exports.createVoteWeightsSnapshot = createVoteWeightsSnapshot;
const updateDelegateProductivity = async ({ height, blockTime, generatorPublicKey, blockTimestamp, stateStore, consensus, }) => {
    const lastBlock = stateStore.chain.lastBlockHeaders[0];
    const expectedForgingAddresses = (await consensus.getDelegates()).map(d => d.address);
    const missedBlocks = Math.ceil((blockTimestamp - lastBlock.timestamp) / blockTime) - 1;
    const forgerAddress = lisk_cryptography_1.getAddressFromPublicKey(generatorPublicKey);
    const forgerIndex = expectedForgingAddresses.findIndex(address => address.equals(forgerAddress));
    for (let i = 0; i < missedBlocks; i += 1) {
        const rawIndex = (forgerIndex - 1 - i) % expectedForgingAddresses.length;
        const index = rawIndex >= 0 ? rawIndex : rawIndex + expectedForgingAddresses.length;
        const missedForgerAddress = expectedForgingAddresses[index];
        const missedForger = await stateStore.account.get(missedForgerAddress);
        missedForger.dpos.delegate.consecutiveMissedBlocks += 1;
        if (missedForger.dpos.delegate.consecutiveMissedBlocks > constants_1.MAX_CONSECUTIVE_MISSED_BLOCKS &&
            height - missedForger.dpos.delegate.lastForgedHeight > constants_1.MAX_LAST_FORGED_HEIGHT_DIFF) {
            missedForger.dpos.delegate.isBanned = true;
        }
        await stateStore.account.set(missedForgerAddress, missedForger);
    }
    const forger = await stateStore.account.get(forgerAddress);
    forger.dpos.delegate.consecutiveMissedBlocks = 0;
    forger.dpos.delegate.lastForgedHeight = height;
    await stateStore.account.set(forgerAddress, forger);
};
exports.updateDelegateProductivity = updateDelegateProductivity;
//# sourceMappingURL=delegates.js.map