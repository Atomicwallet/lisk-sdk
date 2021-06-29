"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultAccount = exports.defaultAccounts = exports.defaultFaucetAccount = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const utils_1 = require("../utils");
const config_1 = require("./config");
exports.defaultFaucetAccount = {
    address: Buffer.from('d04699e57c4a3846c988f3c15306796f8eae5c1c', 'hex'),
    publicKey: Buffer.from('0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a', 'hex'),
    passphrase: 'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready',
    balance: '10000000000000000',
    encryptedPassphrase: 'iterations=10&cipherText=6541c04d7a46eacd666c07fbf030fef32c5db324466e3422e59818317ac5d15cfffb80c5f1e2589eaa6da4f8d611a94cba92eee86722fc0a4015a37cff43a5a699601121fbfec11ea022&iv=141edfe6da3a9917a42004be&salt=f523bba8316c45246c6ffa848b806188&tag=4ffb5c753d4a1dc96364c4a54865521a&version=1',
    password: config_1.defaultPassword,
};
const defaultAccounts = () => config_1.defaultConfig.forging.delegates.map(account => ({ address: Buffer.from(account.address, 'hex') }));
exports.defaultAccounts = defaultAccounts;
const createDefaultAccount = (modules = [], data = {}) => {
    var _a;
    const { default: defaultAccountData } = lisk_chain_1.getAccountSchemaWithDefault(utils_1.getAccountSchemaFromModules(modules));
    const account = lisk_utils_1.objects.mergeDeep({}, defaultAccountData, data);
    account.address = (_a = account.address) !== null && _a !== void 0 ? _a : lisk_cryptography_1.getRandomBytes(20);
    return lisk_utils_1.objects.cloneDeep(account);
};
exports.createDefaultAccount = createDefaultAccount;
//# sourceMappingURL=accounts.js.map