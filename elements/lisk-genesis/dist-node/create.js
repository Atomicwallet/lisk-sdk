"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenesisBlockJSON = exports.createGenesisBlock = exports.getGenesisBlockSchema = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("./constants");
const getGenesisBlockSchema = (accountSchema) => lisk_utils_1.objects.mergeDeep({}, lisk_chain_1.blockSchema, {
    properties: {
        header: lisk_utils_1.objects.mergeDeep({}, lisk_chain_1.blockHeaderSchema, {
            $id: '/block/genesis/header/id',
            properties: {
                id: {
                    dataType: 'bytes',
                },
                asset: lisk_chain_1.getGenesisBlockHeaderAssetSchema(lisk_chain_1.getAccountSchemaWithDefault(accountSchema)),
            },
        }),
    },
});
exports.getGenesisBlockSchema = getGenesisBlockSchema;
const getBlockId = (header, accountSchema) => {
    const genesisBlockAssetBuffer = lisk_codec_1.codec.encode(lisk_chain_1.getGenesisBlockHeaderAssetSchema(accountSchema), header.asset);
    const genesisBlockHeaderBuffer = lisk_codec_1.codec.encode(lisk_chain_1.blockHeaderSchema, {
        ...header,
        asset: genesisBlockAssetBuffer,
    });
    return lisk_cryptography_1.hash(genesisBlockHeaderBuffer);
};
const createAccount = (account, defaultAccount) => lisk_utils_1.objects.mergeDeep({}, lisk_utils_1.objects.cloneDeep(defaultAccount), account);
const createGenesisBlock = (params) => {
    var _a, _b, _c, _d;
    const initRounds = (_a = params.initRounds) !== null && _a !== void 0 ? _a : 3;
    const height = (_b = params.height) !== null && _b !== void 0 ? _b : 0;
    const timestamp = (_c = params.timestamp) !== null && _c !== void 0 ? _c : Math.floor(Date.now() / 1000);
    const previousBlockID = (_d = params.previousBlockID) !== null && _d !== void 0 ? _d : Buffer.from(constants_1.EMPTY_BUFFER);
    const { default: defaultAccount, ...accountSchema } = lisk_chain_1.getAccountSchemaWithDefault(params.accountAssetSchemas);
    const version = constants_1.GENESIS_BLOCK_VERSION;
    const generatorPublicKey = constants_1.GENESIS_BLOCK_GENERATOR_PUBLIC_KEY;
    const reward = constants_1.GENESIS_BLOCK_REWARD;
    const signature = constants_1.GENESIS_BLOCK_SIGNATURE;
    const transactionRoot = constants_1.GENESIS_BLOCK_TRANSACTION_ROOT;
    const accounts = params.accounts
        .map(account => createAccount(account, defaultAccount))
        .sort((a, b) => {
        if (a.address.length < b.address.length) {
            return -1;
        }
        if (a.address.length > b.address.length) {
            return 1;
        }
        return a.address.compare(b.address);
    });
    const initDelegates = [...params.initDelegates].sort((a, b) => a.compare(b));
    const header = {
        generatorPublicKey,
        height,
        previousBlockID,
        reward,
        signature,
        timestamp,
        transactionRoot,
        version,
        asset: {
            initRounds,
            initDelegates,
            accounts,
        },
    };
    const genesisBlock = {
        header: {
            ...header,
            id: getBlockId(header, accountSchema),
        },
        payload: [],
    };
    return genesisBlock;
};
exports.createGenesisBlock = createGenesisBlock;
const getGenesisBlockJSON = (params) => lisk_codec_1.codec.toJSON(exports.getGenesisBlockSchema(params.accountAssetSchemas), params.genesisBlock);
exports.getGenesisBlockJSON = getGenesisBlockJSON;
//# sourceMappingURL=create.js.map