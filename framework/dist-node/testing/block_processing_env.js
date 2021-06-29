"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockProcessingEnv = void 0;
const lisk_bft_1 = require("@liskhq/lisk-bft");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const modules_1 = require("../modules");
const processor_1 = require("../node/processor");
const mocks_1 = require("./mocks");
const create_block_1 = require("./create_block");
const fixtures_1 = require("./fixtures");
const utils_1 = require("./utils");
const create_genesis_block_1 = require("./create_genesis_block");
const defaultModules = [modules_1.TokenModule, modules_1.SequenceModule, modules_1.KeysModule, modules_1.DPoSModule];
const getAppConfig = (genesisConfig) => {
    const mergedConfig = lisk_utils_1.objects.mergeDeep({}, {
        ...fixtures_1.defaultConfig,
        genesisConfig: {
            ...fixtures_1.defaultConfig.genesisConfig,
            ...(genesisConfig !== null && genesisConfig !== void 0 ? genesisConfig : {}),
        },
    });
    return mergedConfig;
};
const getProcessor = (db, appConfig, genesisBlock, networkIdentifier, params) => {
    var _a;
    const channel = mocks_1.channelMock;
    const modules = (_a = params.modules) !== null && _a !== void 0 ? _a : defaultModules;
    const chainModule = new lisk_chain_1.Chain({
        db,
        genesisBlock,
        networkIdentifier,
        maxPayloadLength: appConfig.genesisConfig.maxPayloadLength,
        rewardDistance: appConfig.genesisConfig.rewards.distance,
        rewardOffset: appConfig.genesisConfig.rewards.offset,
        rewardMilestones: appConfig.genesisConfig.rewards.milestones.map(s => BigInt(s)),
        blockTime: appConfig.genesisConfig.blockTime,
        minFeePerByte: appConfig.genesisConfig.minFeePerByte,
        baseFees: appConfig.genesisConfig.baseFees,
        accountSchemas: utils_1.getAccountSchemaFromModules(modules),
    });
    const bftModule = new lisk_bft_1.BFT({
        chain: chainModule,
        threshold: appConfig.genesisConfig.bftThreshold,
        genesisHeight: genesisBlock.header.height,
    });
    const processor = new processor_1.Processor({
        channel,
        logger: mocks_1.loggerMock,
        chainModule,
        bftModule,
    });
    for (const InstantiableModule of modules) {
        const module = utils_1.getModuleInstance(InstantiableModule, {
            genesisConfig: appConfig.genesisConfig,
        });
        processor.register(module);
    }
    return processor;
};
const getNextTimestamp = (processor, previousBlock) => {
    const previousSlotNumber = processor['_chain'].slots.getSlotNumber(previousBlock.timestamp);
    return processor['_chain'].slots.getSlotTime(previousSlotNumber + 1);
};
const getMaxHeightPreviouslyForged = async (processor, previousBlock, passphrase) => {
    var _a, _b;
    const NUM_OF_ROUNDS = 3;
    const NUM_OF_DELEGATES = fixtures_1.defaultConfig.genesisConfig.activeDelegates + fixtures_1.defaultConfig.genesisConfig.standbyDelegates;
    const toHeight = previousBlock.height;
    const fromHeight = Math.max(0, toHeight - NUM_OF_DELEGATES * NUM_OF_ROUNDS);
    const { publicKey } = lisk_cryptography_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const lastBlockHeaders = await processor['_chain'].dataAccess.getBlockHeadersByHeightBetween(fromHeight, toHeight);
    const maxHeightPreviouslyForged = (_b = (_a = lastBlockHeaders.find(h => h.generatorPublicKey.equals(publicKey))) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0;
    return maxHeightPreviouslyForged;
};
const getHashOnion = async (processor, previousBlock, passphrase) => {
    const fromHeight = 0;
    const toHeight = previousBlock.height;
    const { publicKey, address } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase);
    const lastBlockHeaders = await processor['_chain'].dataAccess.getBlockHeadersByHeightBetween(fromHeight, toHeight);
    const hashCount = lastBlockHeaders.filter(h => h.generatorPublicKey.equals(publicKey)).length;
    return fixtures_1.getHashOnionFromDefaultConfig(address, hashCount);
};
const createProcessableBlock = async (processor, networkIdentifier, payload, timestamp) => {
    const previousBlockHeader = processor['_chain'].lastBlock.header;
    const nextTimestamp = timestamp !== null && timestamp !== void 0 ? timestamp : getNextTimestamp(processor, previousBlockHeader);
    const validator = await processor['_chain'].getValidator(nextTimestamp);
    const passphrase = fixtures_1.getPassphraseFromDefaultConfig(validator.address);
    const seedReveal = await getHashOnion(processor, previousBlockHeader, passphrase);
    const maxHeightPrevoted = await processor['_bft'].getMaxHeightPrevoted();
    const reward = processor['_chain'].calculateDefaultReward(previousBlockHeader.height + 1);
    const maxHeightPreviouslyForged = await getMaxHeightPreviouslyForged(processor, previousBlockHeader, passphrase);
    return create_block_1.createBlock({
        passphrase,
        networkIdentifier,
        timestamp: nextTimestamp,
        previousBlockID: previousBlockHeader.id,
        header: {
            height: previousBlockHeader.height + 1,
            reward,
            asset: {
                maxHeightPreviouslyForged,
                maxHeightPrevoted,
                seedReveal,
            },
        },
        payload,
    });
};
const getDefaultAccountsWithModules = () => {
    const faucetAccount = {
        address: fixtures_1.defaultFaucetAccount.address,
        token: { balance: BigInt(fixtures_1.defaultFaucetAccount.balance) },
        sequence: { nonce: BigInt('0') },
    };
    const accounts = fixtures_1.defaultAccounts().map((a, i) => fixtures_1.createDefaultAccount(defaultModules, {
        address: a.address,
        dpos: {
            delegate: {
                username: `delegate_${i}`,
            },
        },
    }));
    return [...accounts, faucetAccount];
};
const getBlockProcessingEnv = async (params) => {
    var _a, _b, _c, _d, _e;
    const appConfig = getAppConfig((_a = params.options) === null || _a === void 0 ? void 0 : _a.genesisConfig);
    const modules = (_b = params.modules) !== null && _b !== void 0 ? _b : defaultModules;
    const accounts = (_c = params.accounts) !== null && _c !== void 0 ? _c : getDefaultAccountsWithModules();
    const { genesisBlock } = create_genesis_block_1.createGenesisBlock({ modules, accounts });
    const networkIdentifier = lisk_cryptography_1.getNetworkIdentifier(genesisBlock.header.id, appConfig.genesisConfig.communityIdentifier);
    utils_1.removeDB((_d = params.options) === null || _d === void 0 ? void 0 : _d.databasePath);
    const db = utils_1.createDB('blockchain', (_e = params.options) === null || _e === void 0 ? void 0 : _e.databasePath);
    const processor = getProcessor(db, appConfig, genesisBlock, networkIdentifier, params);
    await processor.init(genesisBlock);
    return {
        createBlock: async (payload = [], timestamp) => createProcessableBlock(processor, networkIdentifier, payload, timestamp),
        getChain: () => processor['_chain'],
        getProcessor: () => processor,
        getBlockchainDB: () => db,
        process: async (block) => processor.process(block),
        processUntilHeight: async (height) => {
            for (let index = 0; index < height; index += 1) {
                const nextBlock = await createProcessableBlock(processor, networkIdentifier, []);
                await processor.process(nextBlock);
            }
        },
        getLastBlock: () => processor['_chain'].lastBlock,
        getValidators: async () => processor['_chain'].getValidators(),
        getNextValidatorPassphrase: async (previousBlockHeader) => {
            const nextTimestamp = getNextTimestamp(processor, previousBlockHeader);
            const validator = await processor['_chain'].getValidator(nextTimestamp);
            const passphrase = fixtures_1.getPassphraseFromDefaultConfig(validator.address);
            return passphrase;
        },
        getNetworkId: () => networkIdentifier,
        getDataAccess: () => processor['_chain'].dataAccess,
        cleanup: async ({ databasePath }) => {
            await processor.stop();
            await db.close();
            utils_1.removeDB(databasePath);
        },
    };
};
exports.getBlockProcessingEnv = getBlockProcessingEnv;
//# sourceMappingURL=block_processing_env.js.map