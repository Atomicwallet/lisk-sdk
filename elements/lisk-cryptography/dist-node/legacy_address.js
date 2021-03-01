"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const convert_1 = require("./convert");
const nacl_1 = require("./nacl");
exports.getLegacyAddressFromPublicKey = (publicKey) => {
    const publicKeyHash = hash_1.hash(publicKey);
    const publicKeyTransform = convert_1.getFirstEightBytesReversed(publicKeyHash);
    return `${publicKeyTransform.readBigUInt64BE().toString()}L`;
};
exports.getLegacyAddressAndPublicKeyFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    const address = exports.getLegacyAddressFromPublicKey(publicKey);
    return {
        address,
        publicKey,
    };
};
exports.getLegacyAddressFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
exports.getLegacyAddressFromPrivateKey = (privateKey) => {
    const publicKey = nacl_1.getPublicKey(privateKey);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
//# sourceMappingURL=legacy_address.js.map