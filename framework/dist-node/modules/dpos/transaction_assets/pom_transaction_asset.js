"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PomTransactionAsset = exports.blockHeaderSchema = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_bft_1 = require("@liskhq/lisk-bft");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const base_asset_1 = require("../../base_asset");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const signingBlockHeaderSchema = {
    $id: 'lisk/dpos/signingBlockHeader',
    type: 'object',
    properties: {
        version: { dataType: 'uint32', fieldNumber: 1 },
        timestamp: { dataType: 'uint32', fieldNumber: 2 },
        height: { dataType: 'uint32', fieldNumber: 3 },
        previousBlockID: { dataType: 'bytes', fieldNumber: 4 },
        transactionRoot: { dataType: 'bytes', fieldNumber: 5 },
        generatorPublicKey: { dataType: 'bytes', fieldNumber: 6 },
        reward: { dataType: 'uint64', fieldNumber: 7 },
        asset: {
            type: 'object',
            fieldNumber: 8,
            properties: {
                maxHeightPreviouslyForged: {
                    dataType: 'uint32',
                    fieldNumber: 1,
                },
                maxHeightPrevoted: {
                    dataType: 'uint32',
                    fieldNumber: 2,
                },
                seedReveal: {
                    dataType: 'bytes',
                    fieldNumber: 3,
                },
            },
            required: ['maxHeightPreviouslyForged', 'maxHeightPrevoted', 'seedReveal'],
        },
    },
    required: [
        'version',
        'timestamp',
        'height',
        'previousBlockID',
        'transactionRoot',
        'generatorPublicKey',
        'reward',
        'asset',
    ],
};
exports.blockHeaderSchema = {
    ...signingBlockHeaderSchema,
    $id: 'lisk/block-header',
    properties: {
        ...signingBlockHeaderSchema.properties,
        signature: { dataType: 'bytes', fieldNumber: 9 },
    },
};
const getBlockHeaderBytes = (header) => lisk_codec_1.codec.encode(signingBlockHeaderSchema, header);
class PomTransactionAsset extends base_asset_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'reportDelegateMisbehavior';
        this.id = 3;
        this.schema = {
            $id: 'lisk/dpos/pom',
            type: 'object',
            required: ['header1', 'header2'],
            properties: {
                header1: {
                    ...exports.blockHeaderSchema,
                    $id: 'block-header1',
                    fieldNumber: 1,
                },
                header2: {
                    ...exports.blockHeaderSchema,
                    $id: 'block-header2',
                    fieldNumber: 2,
                },
            },
        };
    }
    validate({ asset }) {
        const header1ID = lisk_cryptography_1.hash(getBlockHeaderBytes(asset.header1));
        const header1 = {
            ...asset.header1,
            id: header1ID,
        };
        const header2ID = lisk_cryptography_1.hash(getBlockHeaderBytes(asset.header2));
        const header2 = {
            ...asset.header2,
            id: header2ID,
        };
        if (!lisk_bft_1.areHeadersContradicting(header1, header2)) {
            throw new Error('BlockHeaders are not contradicting as per BFT violation rules.');
        }
    }
    async apply({ asset, transaction, stateStore: store, reducerHandler, }) {
        const currentHeight = store.chain.lastBlockHeaders[0].height + 1;
        const { networkIdentifier } = store.chain;
        if (Math.abs(asset.header1.height - currentHeight) >= constants_1.MAX_PUNISHABLE_BLOCK_HEIGHT_DIFFERENCE) {
            throw new Error(`Difference between header1.height and current height must be less than ${constants_1.MAX_PUNISHABLE_BLOCK_HEIGHT_DIFFERENCE.toString()}.`);
        }
        if (Math.abs(asset.header2.height - currentHeight) >= constants_1.MAX_PUNISHABLE_BLOCK_HEIGHT_DIFFERENCE) {
            throw new Error(`Difference between header2.height and current height must be less than ${constants_1.MAX_PUNISHABLE_BLOCK_HEIGHT_DIFFERENCE.toString()}.`);
        }
        const delegateAddress = lisk_cryptography_1.getAddressFromPublicKey(asset.header1.generatorPublicKey);
        const delegateAccount = await store.account.get(delegateAddress);
        if (delegateAccount.dpos.delegate.username === '') {
            throw new Error('Account is not a delegate.');
        }
        if (delegateAccount.dpos.delegate.isBanned) {
            throw new Error('Cannot apply proof-of-misbehavior. Delegate is already banned.');
        }
        if (utils_1.getPunishmentPeriod(delegateAccount, delegateAccount, store.chain.lastBlockHeaders[0].height) > 0) {
            throw new Error('Cannot apply proof-of-misbehavior. Delegate is already punished.');
        }
        if (!utils_1.validateSignature(lisk_chain_1.TAG_BLOCK_HEADER, networkIdentifier, asset.header1.generatorPublicKey, asset.header1.signature, getBlockHeaderBytes(asset.header1))) {
            throw new Error('Invalid block signature for header 1.');
        }
        if (!utils_1.validateSignature(lisk_chain_1.TAG_BLOCK_HEADER, networkIdentifier, asset.header2.generatorPublicKey, asset.header2.signature, getBlockHeaderBytes(asset.header2))) {
            throw new Error('Invalid block signature for header 2.');
        }
        const delegateAccountBalance = await reducerHandler.invoke('token:getBalance', {
            address: delegateAccount.address,
        });
        const minRemainingBalance = await reducerHandler.invoke('token:getMinRemainingBalance');
        const delegateSubtractableBalance = delegateAccountBalance - minRemainingBalance > BigInt(0)
            ? delegateAccountBalance - minRemainingBalance
            : BigInt(0);
        const reward = store.chain.lastBlockReward > delegateSubtractableBalance
            ? delegateSubtractableBalance
            : store.chain.lastBlockReward;
        if (reward > BigInt(0)) {
            await reducerHandler.invoke('token:credit', {
                address: transaction.senderAddress,
                amount: reward,
            });
        }
        const updatedDelegateAccount = await store.account.get(delegateAddress);
        updatedDelegateAccount.dpos.delegate.pomHeights.push(currentHeight);
        if (updatedDelegateAccount.dpos.delegate.pomHeights.length >= constants_1.MAX_POM_HEIGHTS) {
            updatedDelegateAccount.dpos.delegate.isBanned = true;
        }
        await store.account.set(updatedDelegateAccount.address, updatedDelegateAccount);
        if (reward > BigInt(0)) {
            await reducerHandler.invoke('token:debit', {
                address: updatedDelegateAccount.address,
                amount: reward,
            });
        }
    }
}
exports.PomTransactionAsset = PomTransactionAsset;
//# sourceMappingURL=pom_transaction_asset.js.map