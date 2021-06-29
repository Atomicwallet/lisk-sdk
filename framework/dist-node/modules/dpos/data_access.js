"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVoteWeightsUntilRound = exports.setVoteWeights = exports.getVoteWeights = exports.setRegisteredDelegates = exports.getRegisteredDelegates = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const constants_1 = require("./constants");
const schema_1 = require("./schema");
const getRegisteredDelegates = async (store) => {
    const usernamesBuffer = await store.chain.get(constants_1.CHAIN_STATE_DELEGATE_USERNAMES);
    if (!usernamesBuffer) {
        return { registeredDelegates: [] };
    }
    const parsedUsernames = lisk_codec_1.codec.decode(schema_1.delegatesUserNamesSchema, usernamesBuffer);
    return parsedUsernames;
};
exports.getRegisteredDelegates = getRegisteredDelegates;
const setRegisteredDelegates = async (store, usernames) => {
    usernames.registeredDelegates.sort((a, b) => a.address.compare(b.address));
    await store.chain.set(constants_1.CHAIN_STATE_DELEGATE_USERNAMES, lisk_codec_1.codec.encode(schema_1.delegatesUserNamesSchema, usernames));
};
exports.setRegisteredDelegates = setRegisteredDelegates;
const getVoteWeights = async (stateStore) => {
    const voteWeights = await stateStore.chain.get(constants_1.CHAIN_STATE_DELEGATE_VOTE_WEIGHTS);
    if (!voteWeights) {
        return [];
    }
    const voteWeightsDecoded = lisk_codec_1.codec.decode(schema_1.voteWeightsSchema, voteWeights);
    return voteWeightsDecoded.voteWeights;
};
exports.getVoteWeights = getVoteWeights;
const setVoteWeights = async (stateStore, voteWeights) => {
    await stateStore.chain.set(constants_1.CHAIN_STATE_DELEGATE_VOTE_WEIGHTS, lisk_codec_1.codec.encode(schema_1.voteWeightsSchema, { voteWeights }));
};
exports.setVoteWeights = setVoteWeights;
const deleteVoteWeightsUntilRound = async (round, stateStore) => {
    const voteWeights = await exports.getVoteWeights(stateStore);
    const newVoteWeights = voteWeights.filter(vw => vw.round >= round);
    await exports.setVoteWeights(stateStore, newVoteWeights);
};
exports.deleteVoteWeightsUntilRound = deleteVoteWeightsUntilRound;
//# sourceMappingURL=data_access.js.map