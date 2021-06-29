"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGenesisBlock = void 0;
const lisk_genesis_1 = require("@liskhq/lisk-genesis");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const cryptography = require("@liskhq/lisk-cryptography");
const mnemonic_1 = require("./mnemonic");
const createAccount = () => {
    const passphrase = mnemonic_1.createMnemonicPassphrase();
    const address = cryptography.getAddressFromPassphrase(passphrase).toString('hex');
    return {
        passphrase,
        address,
    };
};
const prepareNormalAccounts = (data, tokenBalance) => data.map(acc => ({
    address: Buffer.from(acc.address, 'hex'),
    token: { balance: BigInt(tokenBalance) },
}));
const prepareValidatorAccounts = (data, tokenBalance) => data.map(acc => ({
    address: Buffer.from(acc.address, 'hex'),
    token: { balance: BigInt(tokenBalance) },
    dpos: {
        delegate: {
            username: acc.username,
        },
    },
}));
const generateGenesisBlock = ({ defaultAccount, numOfAccounts = 10, numOfValidators = 103, schema, tokenDistribution = 10000000, }) => {
    const accountSchemas = schema.account.properties;
    const defaultAccountAssetSchema = Object.fromEntries(Object.entries(defaultAccount).map(([k, v]) => [k, { default: v }]));
    const accountSchemasWithDefaults = lisk_utils_1.objects.mergeDeep({}, accountSchemas, defaultAccountAssetSchema);
    const accountList = new Array(numOfAccounts).fill(0).map(_x => createAccount());
    const delegateList = new Array(numOfValidators).fill(0).map((_x, index) => ({
        ...{ username: `delegate_${index}` },
        ...createAccount(),
    }));
    const validAccounts = prepareNormalAccounts(accountList, tokenDistribution);
    const validDelegateAccounts = prepareValidatorAccounts(delegateList, tokenDistribution);
    const updatedGenesisBlock = lisk_genesis_1.createGenesisBlock({
        initDelegates: validDelegateAccounts.map(a => a.address),
        accounts: [...validAccounts, ...validDelegateAccounts],
        accountAssetSchemas: accountSchemasWithDefaults,
    });
    const genesisBlock = lisk_genesis_1.getGenesisBlockJSON({
        genesisBlock: updatedGenesisBlock,
        accountAssetSchemas: accountSchemasWithDefaults,
    });
    return {
        genesisBlock,
        delegateList,
        accountList,
    };
};
exports.generateGenesisBlock = generateGenesisBlock;
//# sourceMappingURL=genesis_creation.js.map