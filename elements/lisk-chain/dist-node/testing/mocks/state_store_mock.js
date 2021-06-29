"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStoreMock = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const defaultNetworkIdentifier = Buffer.from('', 'hex');
class StateStoreMock {
    constructor({ accounts, chain, consensus, defaultAccount, lastBlockHeaders, lastBlockReward, networkIdentifier, } = {}) {
        var _a, _b;
        this.accountData = (_a = accounts === null || accounts === void 0 ? void 0 : accounts.map(a => ({ ...a }))) !== null && _a !== void 0 ? _a : [];
        this.chainData = chain !== null && chain !== void 0 ? chain : {};
        this.consensusData = consensus !== null && consensus !== void 0 ? consensus : {};
        this._defaultAccount = defaultAccount !== null && defaultAccount !== void 0 ? defaultAccount : {};
        this.account = {
            get: async (address) => {
                const account = this.accountData.find(acc => acc.address.equals(address));
                if (!account) {
                    throw new Error('Account not defined');
                }
                return lisk_utils_1.objects.cloneDeep(account);
            },
            getOrDefault: async (address) => {
                const account = this.accountData.find(acc => acc.address.equals(address));
                if (!account) {
                    return lisk_utils_1.objects.cloneDeep({ ...this._defaultAccount, address });
                }
                return lisk_utils_1.objects.cloneDeep(account);
            },
            getUpdated: () => this.accountData,
            set: async (address, account) => {
                const index = this.accountData.findIndex(acc => acc.address.equals(address));
                if (index > -1) {
                    this.accountData[index] = account;
                    return;
                }
                this.accountData.push(account);
            },
            del: async (address) => {
                const index = this.accountData.findIndex(acc => acc.address.equals(address));
                if (index < 0) {
                    throw new Error('Cannot delete not existing account');
                }
                this.accountData.splice(index, 1);
            },
        };
        this.chain = {
            networkIdentifier: networkIdentifier !== null && networkIdentifier !== void 0 ? networkIdentifier : defaultNetworkIdentifier,
            lastBlockHeaders: (_b = lastBlockHeaders) !== null && _b !== void 0 ? _b : [],
            lastBlockReward: lastBlockReward !== null && lastBlockReward !== void 0 ? lastBlockReward : BigInt(0),
            get: async (key) => Promise.resolve(lisk_utils_1.objects.cloneDeep(this.chainData[key])),
            set: async (key, value) => {
                this.chainData[key] = value;
            },
        };
        this.consensus = {
            get: async (key) => Promise.resolve(lisk_utils_1.objects.cloneDeep(this.consensusData[key])),
            set: async (key, value) => {
                this.consensusData[key] = value;
            },
        };
    }
}
exports.StateStoreMock = StateStoreMock;
//# sourceMappingURL=state_store_mock.js.map