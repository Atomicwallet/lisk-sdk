"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELEASE_URL = exports.DEFAULT_NETWORK = exports.NETWORK = void 0;
var NETWORK;
(function (NETWORK) {
    NETWORK["DEFAULT"] = "default";
    NETWORK["MAINNET"] = "mainnet";
    NETWORK["TESTNET"] = "testnet";
    NETWORK["BETANET"] = "betanet";
    NETWORK["ALPHANET"] = "alphanet";
    NETWORK["DEVNET"] = "devnet";
})(NETWORK = exports.NETWORK || (exports.NETWORK = {}));
exports.DEFAULT_NETWORK = NETWORK.DEFAULT;
exports.RELEASE_URL = 'https://downloads.lisk.io/lisk';
//# sourceMappingURL=constants.js.map