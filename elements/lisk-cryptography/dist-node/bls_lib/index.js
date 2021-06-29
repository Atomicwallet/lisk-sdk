"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blsPopVerify = exports.blsPopProve = exports.blsSkToPk = exports.blsAggregateVerify = exports.blsFastAggregateVerify = exports.blsKeyGen = exports.blsAggregate = exports.blsKeyValidate = exports.blsVerify = exports.blsSign = exports.BLS_SUPPORTED = exports.lib = void 0;
const blsNotSupportedError = new Error('BLS is not supported on your platform. To enable, please check if optional dependencies are meet.');
exports.lib = {
    blsKeyValidate: (_pk) => {
        throw blsNotSupportedError;
    },
    blsKeyGen: (_ikm) => {
        throw blsNotSupportedError;
    },
    blsSkToPk: (_sk) => {
        throw blsNotSupportedError;
    },
    blsAggregate: (_signatures) => {
        throw blsNotSupportedError;
    },
    blsSign: (_sk, _message) => {
        throw blsNotSupportedError;
    },
    blsVerify: (_pk, _message, _signature) => {
        throw blsNotSupportedError;
    },
    blsAggregateVerify: (_publicKeys, _messages, _signature) => {
        throw blsNotSupportedError;
    },
    blsFastAggregateVerify: (_publicKeys, _messages, _signature) => {
        throw blsNotSupportedError;
    },
    blsPopProve: (_sk) => {
        throw blsNotSupportedError;
    },
    blsPopVerify: (_pk, _proof) => {
        throw blsNotSupportedError;
    },
};
exports.BLS_SUPPORTED = true;
try {
    require.resolve('@chainsafe/blst');
    exports.lib = require('./lib');
}
catch (err) {
    exports.BLS_SUPPORTED = false;
}
exports.blsSign = exports.lib.blsSign, exports.blsVerify = exports.lib.blsVerify, exports.blsKeyValidate = exports.lib.blsKeyValidate, exports.blsAggregate = exports.lib.blsAggregate, exports.blsKeyGen = exports.lib.blsKeyGen, exports.blsFastAggregateVerify = exports.lib.blsFastAggregateVerify, exports.blsAggregateVerify = exports.lib.blsAggregateVerify, exports.blsSkToPk = exports.lib.blsSkToPk, exports.blsPopProve = exports.lib.blsPopProve, exports.blsPopVerify = exports.lib.blsPopVerify;
//# sourceMappingURL=index.js.map