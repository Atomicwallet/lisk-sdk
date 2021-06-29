"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteTransactionAsset = void 0;
const base_asset_1 = require("../../base_asset");
const errors_1 = require("../../../errors");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class VoteTransactionAsset extends base_asset_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'voteDelegate';
        this.id = 1;
        this.schema = {
            $id: 'lisk/dpos/vote',
            type: 'object',
            required: ['votes'],
            properties: {
                votes: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 20,
                    items: {
                        type: 'object',
                        required: ['delegateAddress', 'amount'],
                        properties: {
                            delegateAddress: {
                                dataType: 'bytes',
                                fieldNumber: 1,
                                minLength: 20,
                                maxLength: 20,
                            },
                            amount: {
                                dataType: 'sint64',
                                fieldNumber: 2,
                            },
                        },
                    },
                    fieldNumber: 1,
                },
            },
        };
    }
    validate({ asset }) {
        let upVoteCount = 0;
        let downVoteCount = 0;
        const addressSet = {};
        for (const vote of asset.votes) {
            addressSet[vote.delegateAddress.toString('hex')] = true;
            if (vote.amount === BigInt(0)) {
                throw new errors_1.ValidationError('Amount cannot be 0.', '');
            }
            if (vote.amount % constants_1.TEN_UNIT !== BigInt(0)) {
                throw new errors_1.ValidationError('Amount should be multiple of 10 * 10^8.', vote.amount.toString());
            }
            if (vote.amount > BigInt(0)) {
                upVoteCount += 1;
            }
            else if (vote.amount < BigInt(0)) {
                downVoteCount += 1;
            }
        }
        if (upVoteCount > constants_1.MAX_VOTE) {
            throw new errors_1.ValidationError('Upvote can only be casted upto 10.', upVoteCount.toString());
        }
        if (downVoteCount > constants_1.MAX_VOTE) {
            throw new errors_1.ValidationError('Downvote can only be casted upto 10.', downVoteCount.toString());
        }
        if (Object.keys(addressSet).length !== asset.votes.length) {
            throw new errors_1.ValidationError('Delegate address must be unique.', asset.votes.map(v => v.delegateAddress.toString('hex')).join());
        }
    }
    async apply({ asset, transaction, stateStore: store, reducerHandler, }) {
        const assetCopy = [...asset.votes];
        assetCopy.sort((a, b) => {
            const diff = a.amount - b.amount;
            if (diff > BigInt(0)) {
                return 1;
            }
            if (diff < BigInt(0)) {
                return -1;
            }
            return 0;
        });
        for (const vote of assetCopy) {
            const sender = await store.account.get(transaction.senderAddress);
            const votedDelegate = await store.account.get(vote.delegateAddress);
            if (votedDelegate.dpos.delegate.username === '') {
                throw new Error(`Voted delegate address ${votedDelegate.address.toString('hex')} is not registered.`);
            }
            if (vote.amount < BigInt(0)) {
                const originalUpvoteIndex = sender.dpos.sentVotes.findIndex(senderVote => senderVote.delegateAddress.equals(vote.delegateAddress));
                if (originalUpvoteIndex < 0) {
                    throw new Error('Cannot cast downvote to delegate who is not upvoted.');
                }
                sender.dpos.sentVotes[originalUpvoteIndex].amount += vote.amount;
                if (sender.dpos.sentVotes[originalUpvoteIndex].amount < BigInt(0)) {
                    throw new Error('The downvote amount cannot be greater than upvoted amount.');
                }
                if (sender.dpos.sentVotes[originalUpvoteIndex].amount === BigInt(0)) {
                    sender.dpos.sentVotes = sender.dpos.sentVotes.filter(senderVote => !senderVote.delegateAddress.equals(vote.delegateAddress));
                }
                sender.dpos.unlocking.push({
                    delegateAddress: vote.delegateAddress,
                    amount: BigInt(-1) * vote.amount,
                    unvoteHeight: store.chain.lastBlockHeaders[0].height + 1,
                });
                utils_1.sortUnlocking(sender.dpos.unlocking);
                if (sender.dpos.unlocking.length > constants_1.MAX_UNLOCKING) {
                    throw new Error(`Cannot downvote which exceeds account.dpos.unlocking to have more than ${constants_1.MAX_UNLOCKING.toString()}.`);
                }
            }
            else {
                const originalUpvoteIndex = sender.dpos.sentVotes.findIndex(senderVote => senderVote.delegateAddress.equals(vote.delegateAddress));
                const index = originalUpvoteIndex > -1 ? originalUpvoteIndex : sender.dpos.sentVotes.length;
                const upvote = originalUpvoteIndex > -1
                    ? sender.dpos.sentVotes[originalUpvoteIndex]
                    : {
                        delegateAddress: vote.delegateAddress,
                        amount: BigInt(0),
                    };
                upvote.amount += vote.amount;
                await reducerHandler.invoke('token:debit', {
                    address: transaction.senderAddress,
                    amount: vote.amount,
                });
                sender.dpos.sentVotes[index] = upvote;
                sender.dpos.sentVotes.sort((a, b) => a.delegateAddress.compare(b.delegateAddress));
                if (sender.dpos.sentVotes.length > constants_1.MAX_VOTE) {
                    throw new Error(`Account can only vote upto ${constants_1.MAX_VOTE.toString()}.`);
                }
            }
            await store.account.set(sender.address, sender);
            const delegate = await store.account.get(vote.delegateAddress);
            delegate.dpos.delegate.totalVotesReceived += vote.amount;
            await store.account.set(delegate.address, delegate);
        }
    }
}
exports.VoteTransactionAsset = VoteTransactionAsset;
//# sourceMappingURL=vote_transaction_asset.js.map