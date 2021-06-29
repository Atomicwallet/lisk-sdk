"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStore = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const account_store_1 = require("./account_store");
const chain_state_store_1 = require("./chain_state_store");
const consensus_state_store_1 = require("./consensus_state_store");
const constants_1 = require("../data_access/constants");
const schema_1 = require("../schema");
const saveDiff = (height, stateDiffs, batch) => {
    const diffToEncode = {
        updated: [],
        created: [],
        deleted: [],
    };
    for (const diff of stateDiffs) {
        diffToEncode.updated = diffToEncode.updated.concat(diff.updated);
        diffToEncode.created = diffToEncode.created.concat(diff.created);
        diffToEncode.deleted = diffToEncode.deleted.concat(diff.deleted);
    }
    const encodedDiff = lisk_codec_1.codec.encode(schema_1.stateDiffSchema, diffToEncode);
    batch.put(`${constants_1.DB_KEY_DIFF_STATE}:${height}`, encodedDiff);
};
class StateStore {
    constructor(dataAccess, additionalInformation) {
        this.account = new account_store_1.AccountStore(dataAccess, {
            defaultAccount: additionalInformation.defaultAccount,
        });
        this.consensus = new consensus_state_store_1.ConsensusStateStore(dataAccess);
        this.chain = new chain_state_store_1.ChainStateStore(dataAccess, {
            lastBlockHeaders: additionalInformation.lastBlockHeaders,
            networkIdentifier: additionalInformation.networkIdentifier,
            lastBlockReward: additionalInformation.lastBlockReward,
        });
    }
    createSnapshot() {
        this.account.createSnapshot();
        this.consensus.createSnapshot();
        this.chain.createSnapshot();
    }
    restoreSnapshot() {
        this.account.restoreSnapshot();
        this.consensus.restoreSnapshot();
        this.chain.restoreSnapshot();
    }
    finalize(height, batch) {
        const accountStateDiff = this.account.finalize(batch);
        const chainStateDiff = this.chain.finalize(batch);
        const consensusStateDiff = this.consensus.finalize(batch);
        saveDiff(height, [accountStateDiff, chainStateDiff, consensusStateDiff], batch);
    }
}
exports.StateStore = StateStore;
//# sourceMappingURL=state_store.js.map