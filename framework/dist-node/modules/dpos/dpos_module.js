"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DPoSModule = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_validator_1 = require("@liskhq/lisk-validator");
const utils_1 = require("./utils");
const base_module_1 = require("../base_module");
const constants_1 = require("./constants");
const data_access_1 = require("./data_access");
const delegates_1 = require("./delegates");
const random_seed_1 = require("./random_seed");
const rounds_1 = require("./rounds");
const schema_1 = require("./schema");
const pom_transaction_asset_1 = require("./transaction_assets/pom_transaction_asset");
const register_transaction_asset_1 = require("./transaction_assets/register_transaction_asset");
const unlock_transaction_asset_1 = require("./transaction_assets/unlock_transaction_asset");
const vote_transaction_asset_1 = require("./transaction_assets/vote_transaction_asset");
const { bufferArrayContains } = lisk_utils_1.objects;
const dposModuleParamsDefault = {
    activeDelegates: 101,
    standbyDelegates: 2,
    delegateListRoundOffset: 2,
};
class DPoSModule extends base_module_1.BaseModule {
    constructor(config) {
        super(config);
        this.name = 'dpos';
        this.id = 5;
        this.accountSchema = schema_1.dposAccountSchema;
        this.transactionAssets = [
            new register_transaction_asset_1.RegisterTransactionAsset(),
            new vote_transaction_asset_1.VoteTransactionAsset(),
            new unlock_transaction_asset_1.UnlockTransactionAsset(),
            new pom_transaction_asset_1.PomTransactionAsset(),
        ];
        this._finalizedHeight = 0;
        const mergedDposConfig = lisk_utils_1.objects.mergeDeep(dposModuleParamsDefault, this.config);
        this.actions = {
            getAllDelegates: async () => {
                const validatorsBuffer = await this._dataAccess.getChainState(constants_1.CHAIN_STATE_DELEGATE_USERNAMES);
                if (!validatorsBuffer) {
                    return [];
                }
                const { registeredDelegates } = lisk_codec_1.codec.decode(schema_1.delegatesUserNamesSchema, validatorsBuffer);
                return registeredDelegates.map(delegate => ({
                    username: delegate.username,
                    address: delegate.address.toString('hex'),
                }));
            },
            getUnlockings: async (params) => {
                if (typeof params.address !== 'string') {
                    throw new Error('Address must be a string');
                }
                const address = Buffer.from(params.address, 'hex');
                const account = await this._dataAccess.getAccountByAddress(address);
                const result = [];
                for (const unlocking of account.dpos.unlocking) {
                    const delegate = await this._dataAccess.getAccountByAddress(unlocking.delegateAddress);
                    const minWaitingHeight = utils_1.getMinWaitingHeight(account.address, delegate.address, unlocking);
                    const minPunishedHeight = utils_1.getMinPunishedHeight(account, delegate);
                    result.push({
                        delegateAddress: unlocking.delegateAddress.toString('hex'),
                        amount: unlocking.amount.toString(),
                        unvoteHeight: unlocking.unvoteHeight,
                        minUnlockHeight: Math.max(minWaitingHeight, minPunishedHeight),
                    });
                }
                return result;
            },
        };
        const errors = lisk_validator_1.validator.validate(schema_1.dposModuleParamsSchema, mergedDposConfig);
        if (errors.length) {
            throw new lisk_validator_1.LiskValidationError([...errors]);
        }
        if (mergedDposConfig.activeDelegates < 1) {
            throw new Error('Active delegates must have minimum 1');
        }
        if (mergedDposConfig.activeDelegates < mergedDposConfig.standbyDelegates) {
            throw new Error('Active delegates must be greater or equal to standby delegates');
        }
        this._activeDelegates = mergedDposConfig.activeDelegates;
        this._standbyDelegates = mergedDposConfig.standbyDelegates;
        this._delegateListRoundOffset = mergedDposConfig.delegateListRoundOffset;
        this._blocksPerRound = this._activeDelegates + this._standbyDelegates;
        this._blockTime = config.blockTime;
        this._delegateActiveRoundLimit = 3;
        this.rounds = new rounds_1.Rounds({ blocksPerRound: this._blocksPerRound });
    }
    async afterBlockApply(context) {
        const finalizedHeight = context.consensus.getFinalizedHeight();
        const { height } = context.block.header;
        const isLastBlockOfRound = this._isLastBlockOfTheRound(height);
        if (finalizedHeight !== this._finalizedHeight) {
            this._finalizedHeight = finalizedHeight;
            const finalizedBlockRound = this.rounds.calcRound(finalizedHeight);
            const disposableDelegateListUntilRound = finalizedBlockRound - this._delegateListRoundOffset - this._delegateActiveRoundLimit;
            this._logger.debug(disposableDelegateListUntilRound, 'Deleting voteWeights until round');
            await data_access_1.deleteVoteWeightsUntilRound(disposableDelegateListUntilRound, context.stateStore);
        }
        await this._updateProductivity(context);
        if (!isLastBlockOfRound) {
            return;
        }
        await this._createVoteWeightSnapshot(context);
        await this._updateValidators(context);
    }
    async afterGenesisBlockApply(context) {
        const { accounts, initDelegates } = context.genesisBlock.header.asset;
        const delegateAddresses = [];
        const delegateUsernames = [];
        for (const account of accounts) {
            if (account.dpos.delegate.username !== '') {
                delegateUsernames.push({
                    address: account.address,
                    username: account.dpos.delegate.username,
                });
                delegateAddresses.push(account.address);
            }
        }
        if (initDelegates.length > this._blocksPerRound) {
            throw new Error('Genesis block init delegates list is larger than allowed delegates per round.');
        }
        if (!bufferArrayContains(delegateAddresses, [...initDelegates])) {
            throw new Error('Genesis block init delegates list contain addresses which are not delegates.');
        }
        await data_access_1.setRegisteredDelegates(context.stateStore, { registeredDelegates: delegateUsernames });
        const roundAfterGenesis = this.rounds.calcRound(context.genesisBlock.header.height) + 1;
        for (let i = roundAfterGenesis; i <= roundAfterGenesis + this._delegateListRoundOffset; i += 1) {
            await delegates_1.createVoteWeightsSnapshot({
                logger: this._logger,
                stateStore: context.stateStore,
                height: context.genesisBlock.header.height,
                round: i,
                activeDelegates: this._activeDelegates,
                standbyDelegates: this._standbyDelegates,
            });
        }
    }
    async _updateProductivity(context) {
        const { block: { header: blockHeader }, consensus, stateStore, } = context;
        const round = this.rounds.calcRound(blockHeader.height);
        this._logger.debug(round, 'Updating delegates productivity for round');
        await delegates_1.updateDelegateProductivity({
            height: blockHeader.height,
            blockTime: this._blockTime,
            blockTimestamp: blockHeader.timestamp,
            generatorPublicKey: blockHeader.generatorPublicKey,
            stateStore,
            consensus,
        });
    }
    async _createVoteWeightSnapshot(context) {
        const round = this.rounds.calcRound(context.block.header.height);
        this._logger.debug(round + this._delegateListRoundOffset, 'Creating delegate list for round');
        const snapshotHeight = context.block.header.height + 1;
        const snapshotRound = this.rounds.calcRound(snapshotHeight) + this._delegateListRoundOffset;
        await delegates_1.createVoteWeightsSnapshot({
            logger: this._logger,
            stateStore: context.stateStore,
            height: snapshotHeight,
            round: snapshotRound,
            activeDelegates: this._activeDelegates,
            standbyDelegates: this._standbyDelegates,
        });
    }
    async _updateValidators(context) {
        const round = this.rounds.calcRound(context.block.header.height);
        const nextRound = round + 1;
        this._logger.debug(nextRound, 'Updating delegate list for');
        const [randomSeed1, randomSeed2] = random_seed_1.generateRandomSeeds({
            round,
            rounds: this.rounds,
            headers: context.stateStore.chain.lastBlockHeaders,
            logger: this._logger,
        });
        await delegates_1.updateDelegateList({
            round: nextRound,
            randomSeeds: [randomSeed1, randomSeed2],
            stateStore: context.stateStore,
            consensus: context.consensus,
            activeDelegates: this._activeDelegates,
            standbyDelegates: this._standbyDelegates,
        });
    }
    _isLastBlockOfTheRound(height) {
        const round = this.rounds.calcRound(height);
        const nextRound = this.rounds.calcRound(height + 1);
        return round < nextRound;
    }
}
exports.DPoSModule = DPoSModule;
//# sourceMappingURL=dpos_module.js.map