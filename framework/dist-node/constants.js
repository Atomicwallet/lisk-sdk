"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=constants.js.map