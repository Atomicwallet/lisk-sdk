"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAccessMock = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
class DataAccessMock {
    constructor(opts) {
        var _a, _b, _c;
        this._blockHeaders = (_a = opts === null || opts === void 0 ? void 0 : opts.blockHeaders) !== null && _a !== void 0 ? _a : [];
        this._chainState = (_b = opts === null || opts === void 0 ? void 0 : opts.chainState) !== null && _b !== void 0 ? _b : {};
        this._accounts = new lisk_utils_1.dataStructures.BufferMap();
        for (const account of (_c = opts === null || opts === void 0 ? void 0 : opts.accounts) !== null && _c !== void 0 ? _c : []) {
            this._accounts.set(account.address, account);
        }
    }
    async getChainState(key) {
        return Promise.resolve(this._chainState[key]);
    }
    async getAccountByAddress(address) {
        if (!this._accounts.has(address)) {
            throw new Error(`Account with address ${address.toString('hex')} does not exists`);
        }
        return Promise.resolve(this._accounts.get(address));
    }
    async getLastBlockHeader() {
        return Promise.resolve(this._blockHeaders[this._blockHeaders.length - 1]);
    }
}
exports.DataAccessMock = DataAccessMock;
//# sourceMappingURL=data_access_mock.js.map