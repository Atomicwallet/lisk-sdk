"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_POST_NODE_INFO = exports.EVENT_POST_TRANSACTION_ANNOUNCEMENT = exports.EVENT_POST_BLOCK = exports.APP_EVENT_BLOCK_DELETE = exports.APP_EVENT_BLOCK_NEW = exports.APP_EVENT_CHAIN_VALIDATORS_CHANGE = exports.APP_EVENT_CHAIN_FORK = exports.APP_EVENT_TRANSACTION_NEW = exports.APP_EVENT_NETWORK_READY = exports.APP_EVENT_NETWORK_EVENT = exports.APP_EVENT_SHUTDOWN = exports.APP_EVENT_READY = exports.APP_IDENTIFIER = exports.actionWithModuleNameReg = exports.moduleNameReg = exports.eventWithModuleNameReg = exports.INTERNAL_EVENTS = void 0;
exports.INTERNAL_EVENTS = Object.freeze([
    'registeredToBus',
    'loading:started',
    'loading:finished',
    'unloading:started',
    'unloading:finished',
    'unloading:error',
]);
exports.eventWithModuleNameReg = /^([^\d][\w]+)((?::[^\d][\w]+)+)$/;
exports.moduleNameReg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
exports.actionWithModuleNameReg = /^[a-zA-Z][a-zA-Z0-9_]*:[a-zA-Z][a-zA-Z0-9]*$/;
exports.APP_IDENTIFIER = 'app';
exports.APP_EVENT_READY = 'app:ready';
exports.APP_EVENT_SHUTDOWN = 'app:shutdown';
exports.APP_EVENT_NETWORK_EVENT = 'app:network:event';
exports.APP_EVENT_NETWORK_READY = 'app:network:ready';
exports.APP_EVENT_TRANSACTION_NEW = 'app:transaction:new';
exports.APP_EVENT_CHAIN_FORK = 'app:chain:fork';
exports.APP_EVENT_CHAIN_VALIDATORS_CHANGE = 'app:chain:validators:change';
exports.APP_EVENT_BLOCK_NEW = 'app:block:new';
exports.APP_EVENT_BLOCK_DELETE = 'app:block:delete';
exports.EVENT_POST_BLOCK = 'postBlock';
exports.EVENT_POST_TRANSACTION_ANNOUNCEMENT = 'postTransactionsAnnouncement';
exports.EVENT_POST_NODE_INFO = 'postNodeInfo';
//# sourceMappingURL=constants.js.map