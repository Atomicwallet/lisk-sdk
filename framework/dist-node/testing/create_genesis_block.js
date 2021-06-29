"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGenesisBlock = void 0;
const lisk_genesis_1 = require("@liskhq/lisk-genesis");
const utils_1 = require("./utils");
const accounts_1 = require("./fixtures/accounts");
const createGenesisBlock = (params) => {
    var _a, _b, _c, _d, _e, _f;
    const accounts = (_a = params.accounts) !== null && _a !== void 0 ? _a : accounts_1.defaultAccounts();
    const initDelegates = (_b = params.initDelegates) !== null && _b !== void 0 ? _b : accounts_1.defaultAccounts().map(delegate => delegate.address);
    const accountAssetSchemas = utils_1.getAccountSchemaFromModules(params.modules, params.genesisConfig);
    const initRounds = (_c = params.initRounds) !== null && _c !== void 0 ? _c : 3;
    const height = (_d = params.height) !== null && _d !== void 0 ? _d : 0;
    const today = new Date();
    const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);
    const defaultTimestamp = Math.floor(yesterday.getTime() / 1000);
    const timestamp = (_e = params.timestamp) !== null && _e !== void 0 ? _e : defaultTimestamp;
    const previousBlockID = (_f = params.previousBlockID) !== null && _f !== void 0 ? _f : Buffer.alloc(0);
    const genesisBlock = lisk_genesis_1.createGenesisBlock({
        accounts,
        initDelegates,
        accountAssetSchemas,
        initRounds,
        height,
        timestamp,
        previousBlockID,
    });
    const genesisBlockJSON = lisk_genesis_1.getGenesisBlockJSON({
        genesisBlock: genesisBlock,
        accountAssetSchemas,
    });
    return {
        genesisBlock,
        genesisBlockJSON,
    };
};
exports.createGenesisBlock = createGenesisBlock;
//# sourceMappingURL=create_genesis_block.js.map