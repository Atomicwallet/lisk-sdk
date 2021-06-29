"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModule = void 0;
class BaseModule {
    constructor(genesisConfig) {
        this.transactionAssets = [];
        this.reducers = {};
        this.actions = {};
        this.events = [];
        this.config = genesisConfig;
    }
    init(input) {
        this._channel = input.channel;
        this._dataAccess = input.dataAccess;
        this._logger = input.logger;
    }
}
exports.BaseModule = BaseModule;
//# sourceMappingURL=base_module.js.map