"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _3_vote_transaction_1 = require("./3_vote_transaction");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const validateInputs = ({ votes = [], unvotes = [] }) => {
    if (!Array.isArray(votes)) {
        throw new Error('Please provide a valid votes value. Expected an array if present.');
    }
    if (!Array.isArray(unvotes)) {
        throw new Error('Please provide a valid unvotes value. Expected an array if present.');
    }
    utils_1.validatePublicKeys([...votes, ...unvotes]);
};
exports.castVotes = (inputs) => {
    validateInputs(inputs);
    const { passphrase, secondPassphrase, votes = [], unvotes = [] } = inputs;
    const plusPrependedVotes = utils_1.prependPlusToPublicKeys(votes);
    const minusPrependedUnvotes = utils_1.prependMinusToPublicKeys(unvotes);
    const allVotes = [
        ...plusPrependedVotes,
        ...minusPrependedUnvotes,
    ];
    const transaction = Object.assign({}, utils_1.createBaseTransaction(inputs), { type: 3, fee: constants_1.VOTE_FEE.toString(), asset: {
            votes: allVotes,
        } });
    if (!passphrase) {
        return transaction;
    }
    const transactionWithSenderInfo = Object.assign({}, transaction, { senderId: transaction.senderId, senderPublicKey: transaction.senderPublicKey, recipientId: transaction.senderId, recipientPublicKey: transaction.senderPublicKey });
    const voteTransaction = new _3_vote_transaction_1.VoteTransaction(transactionWithSenderInfo);
    voteTransaction.sign(passphrase, secondPassphrase);
    return voteTransaction.toJSON();
};
//# sourceMappingURL=3_cast_votes.js.map