"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidateAssetContext = exports.createApplyAssetContext = exports.createTransactionApplyContext = exports.createAfterBlockApplyContext = exports.createBeforeBlockApplyContext = exports.createAfterGenesisBlockApplyContext = void 0;
const mocks_1 = require("./mocks");
const create_genesis_block_1 = require("./create_genesis_block");
const createAfterGenesisBlockApplyContext = (params) => {
    var _a, _b, _c, _d;
    const modules = (_a = params.modules) !== null && _a !== void 0 ? _a : [];
    const genesisBlock = (_b = params.genesisBlock) !== null && _b !== void 0 ? _b : create_genesis_block_1.createGenesisBlock({ modules }).genesisBlock;
    const stateStore = (_c = params.stateStore) !== null && _c !== void 0 ? _c : new mocks_1.StateStoreMock();
    const reducerHandler = (_d = params.reducerHandler) !== null && _d !== void 0 ? _d : mocks_1.reducerHandlerMock;
    return { genesisBlock, stateStore, reducerHandler };
};
exports.createAfterGenesisBlockApplyContext = createAfterGenesisBlockApplyContext;
const createBeforeBlockApplyContext = (params) => {
    var _a, _b;
    const stateStore = (_a = params.stateStore) !== null && _a !== void 0 ? _a : new mocks_1.StateStoreMock();
    const reducerHandler = (_b = params.reducerHandler) !== null && _b !== void 0 ? _b : mocks_1.reducerHandlerMock;
    return { block: params.block, stateStore, reducerHandler };
};
exports.createBeforeBlockApplyContext = createBeforeBlockApplyContext;
const createAfterBlockApplyContext = (params) => {
    var _a, _b, _c;
    const consensus = (_a = params.consensus) !== null && _a !== void 0 ? _a : mocks_1.consensusMock;
    const stateStore = (_b = params.stateStore) !== null && _b !== void 0 ? _b : new mocks_1.StateStoreMock();
    const reducerHandler = (_c = params.reducerHandler) !== null && _c !== void 0 ? _c : mocks_1.reducerHandlerMock;
    return { block: params.block, stateStore, reducerHandler, consensus };
};
exports.createAfterBlockApplyContext = createAfterBlockApplyContext;
const createTransactionApplyContext = (params) => {
    var _a, _b;
    const stateStore = (_a = params.stateStore) !== null && _a !== void 0 ? _a : new mocks_1.StateStoreMock();
    const reducerHandler = (_b = params.reducerHandler) !== null && _b !== void 0 ? _b : mocks_1.reducerHandlerMock;
    return { transaction: params.transaction, stateStore, reducerHandler };
};
exports.createTransactionApplyContext = createTransactionApplyContext;
const createApplyAssetContext = (params) => {
    var _a, _b;
    const stateStore = (_a = params.stateStore) !== null && _a !== void 0 ? _a : new mocks_1.StateStoreMock();
    const reducerHandler = (_b = params.reducerHandler) !== null && _b !== void 0 ? _b : mocks_1.reducerHandlerMock;
    return { transaction: params.transaction, stateStore, reducerHandler, asset: params.asset };
};
exports.createApplyAssetContext = createApplyAssetContext;
const createValidateAssetContext = (params) => ({ transaction: params.transaction, asset: params.asset });
exports.createValidateAssetContext = createValidateAssetContext;
//# sourceMappingURL=create_contexts.js.map