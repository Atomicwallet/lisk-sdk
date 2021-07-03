"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
const lisk_cryptography_1 = require("../../lisk-cryptography");
const base_transaction_1 = require("./base_transaction");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const validation_1 = require("./utils/validation");
const PREFIX_UPVOTE = '+';
const PREFIX_UNVOTE = '-';
const MAX_VOTE_PER_ACCOUNT = 101;
const MIN_VOTE_PER_TX = 1;
const MAX_VOTE_PER_TX = 33;
const TRANSACTION_VOTE_TYPE = 3;
exports.voteAssetFormatSchema = {
    type: 'object',
    required: ['votes'],
    properties: {
        votes: {
            type: 'array',
            minItems: MIN_VOTE_PER_TX,
            maxItems: MAX_VOTE_PER_TX,
            items: {
                type: 'string',
                format: 'signedPublicKey',
            },
            uniqueSignedPublicKeys: true,
        },
    },
};
class VoteTransaction extends base_transaction_1.BaseTransaction {
    constructor(rawTransaction) {
        super(rawTransaction);
        const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
            ? rawTransaction
            : {});
        this.asset = (tx.asset || {});
        this.containsUniqueData = true;
    }
    assetToBytes() {
        return Buffer.from(this.asset.votes.join(''), 'utf8');
    }
    assetToJSON() {
        return this.asset;
    }
    async prepare(store) {
        const publicKeyObjectArray = this.asset.votes.map(pkWithAction => {
            const publicKey = pkWithAction.slice(1);
            return {
                publicKey,
            };
        });
        const filterArray = [
            {
                address: this.senderId,
            },
            ...publicKeyObjectArray,
        ];
        await store.account.cache(filterArray);
    }
    verifyAgainstTransactions(transactions) {
        const sameTypeTransactions = transactions
            .filter(tx => tx.senderPublicKey === this.senderPublicKey && tx.type === this.type)
            .map(tx => new VoteTransaction(tx));
        const publicKeys = this.asset.votes.map(vote => vote.substring(1));
        return sameTypeTransactions.reduce((previous, tx) => {
            const conflictingVotes = tx.asset.votes
                .map(vote => vote.substring(1))
                .filter(publicKey => publicKeys.includes(publicKey));
            if (conflictingVotes.length > 0) {
                return [
                    ...previous,
                    new errors_1.TransactionError(`Transaction includes conflicting votes: ${conflictingVotes.toString()}`, this.id, '.asset.votes'),
                ];
            }
            return previous;
        }, []);
    }
    validateAsset() {
        validation_1.validator.validate(exports.voteAssetFormatSchema, this.asset);
        const errors = errors_1.convertToAssetError(this.id, validation_1.validator.errors);
        if (!this.amount.eq(new BN(0))) {
            errors.push(new errors_1.TransactionError('Amount must be zero for vote transaction', this.id, '.amount', this.amount.toString(), '0'));
        }
        if (this.type !== TRANSACTION_VOTE_TYPE) {
            errors.push(new errors_1.TransactionError('Invalid type', this.id, '.type', this.type, TRANSACTION_VOTE_TYPE));
        }
        try {
            validation_1.validateAddress(this.recipientId);
        }
        catch (err) {
            errors.push(new errors_1.TransactionError('RecipientId must be set for vote transaction', this.id, '.recipientId', this.recipientId));
        }
        if (this.recipientPublicKey &&
            this.recipientId !== lisk_cryptography_1.getAddressFromPublicKey(this.recipientPublicKey)) {
            errors.push(new errors_1.TransactionError('recipientId does not match recipientPublicKey.', this.id, '.recipientId'));
        }
        if (!this.fee.eq(new BN(constants_1.VOTE_FEE))) {
            errors.push(new errors_1.TransactionError(`Fee must be equal to ${constants_1.VOTE_FEE}`, this.id, '.fee', this.fee.toString(), constants_1.VOTE_FEE));
        }
        return errors;
    }
    applyAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        const balanceError = utils_1.verifyAmountBalance(this.id, sender, this.amount, this.fee);
        if (balanceError) {
            errors.push(balanceError);
        }
        const updatedSenderBalance = new BN(sender.balance).sub(new BN(this.amount));
        this.asset.votes.forEach(actionVotes => {
            const vote = actionVotes.substring(1);
            const voteAccount = store.account.find(account => account.publicKey === vote);
            if (!voteAccount ||
                (voteAccount &&
                    (voteAccount.username === undefined ||
                        voteAccount.username === '' ||
                        voteAccount.username === null))) {
                errors.push(new errors_1.TransactionError(`${vote} is not a delegate.`, this.id, '.asset.votes'));
            }
        });
        const senderVotes = sender.votedDelegatesPublicKeys || [];
        this.asset.votes.forEach(vote => {
            const action = vote.charAt(0);
            const publicKey = vote.substring(1);
            if (action === PREFIX_UPVOTE && senderVotes.includes(publicKey)) {
                errors.push(new errors_1.TransactionError(`${publicKey} is already voted.`, this.id, '.asset.votes'));
            }
            else if (action === PREFIX_UNVOTE && !senderVotes.includes(publicKey)) {
                errors.push(new errors_1.TransactionError(`${publicKey} is not voted.`, this.id, '.asset.votes'));
            }
        });
        const upvotes = this.asset.votes
            .filter(vote => vote.charAt(0) === PREFIX_UPVOTE)
            .map(vote => vote.substring(1));
        const unvotes = this.asset.votes
            .filter(vote => vote.charAt(0) === PREFIX_UNVOTE)
            .map(vote => vote.substring(1));
        const originalVotes = sender.votedDelegatesPublicKeys || [];
        const votedDelegatesPublicKeys = [
            ...originalVotes,
            ...upvotes,
        ].filter(vote => !unvotes.includes(vote));
        if (votedDelegatesPublicKeys.length > MAX_VOTE_PER_ACCOUNT) {
            errors.push(new errors_1.TransactionError(`Vote cannot exceed ${MAX_VOTE_PER_ACCOUNT} but has ${votedDelegatesPublicKeys.length}.`, this.id, '.asset.votes', votedDelegatesPublicKeys.length.toString(), MAX_VOTE_PER_ACCOUNT));
        }
        const updatedSender = Object.assign({}, sender, { balance: updatedSenderBalance.toString(), votedDelegatesPublicKeys });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    }
    undoAsset(store) {
        const errors = [];
        const sender = store.account.get(this.senderId);
        const updatedSenderBalance = new BN(sender.balance).add(new BN(this.amount));
        if (updatedSenderBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
            errors.push(new errors_1.TransactionError('Invalid amount', this.id, '.amount', this.amount.toString()));
        }
        const upvotes = this.asset.votes
            .filter(vote => vote.charAt(0) === PREFIX_UPVOTE)
            .map(vote => vote.substring(1));
        const unvotes = this.asset.votes
            .filter(vote => vote.charAt(0) === PREFIX_UNVOTE)
            .map(vote => vote.substring(1));
        const originalVotes = sender.votedDelegatesPublicKeys || [];
        const votedDelegatesPublicKeys = [
            ...originalVotes,
            ...unvotes,
        ].filter(vote => !upvotes.includes(vote));
        if (votedDelegatesPublicKeys.length > MAX_VOTE_PER_ACCOUNT) {
            errors.push(new errors_1.TransactionError(`Vote cannot exceed ${MAX_VOTE_PER_ACCOUNT} but has ${votedDelegatesPublicKeys.length}.`, this.id, '.asset.votes', votedDelegatesPublicKeys.length.toString(), MAX_VOTE_PER_ACCOUNT));
        }
        const updatedSender = Object.assign({}, sender, { balance: updatedSenderBalance.toString(), votedDelegatesPublicKeys });
        store.account.set(updatedSender.address, updatedSender);
        return errors;
    }
    assetFromSync(raw) {
        if (!raw.v_votes) {
            return undefined;
        }
        const votes = raw.v_votes.split(',');
        return { votes };
    }
}
exports.VoteTransaction = VoteTransaction;
//# sourceMappingURL=3_vote_transaction.js.map