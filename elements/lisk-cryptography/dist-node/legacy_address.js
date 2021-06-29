"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegacyAddressFromPrivateKey = exports.getLegacyAddressFromPassphrase = exports.getLegacyAddressAndPublicKeyFromPassphrase = exports.getLegacyAddressFromPublicKey = void 0;
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const convert_1 = require("./convert");
const nacl_1 = require("./nacl");
const getLegacyAddressFromPublicKey = (publicKey) => {
    const publicKeyHash = hash_1.hash(publicKey);
    const publicKeyTransform = convert_1.getFirstEightBytesReversed(publicKeyHash);
    return `${publicKeyTransform.readBigUInt64BE().toString()}L`;
};
exports.getLegacyAddressFromPublicKey = getLegacyAddressFromPublicKey;
const getLegacyAddressAndPublicKeyFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    const address = exports.getLegacyAddressFromPublicKey(publicKey);
    return {
        address,
        publicKey,
    };
};
exports.getLegacyAddressAndPublicKeyFromPassphrase = getLegacyAddressAndPublicKeyFromPassphrase;
const getLegacyAddressFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
exports.getLegacyAddressFromPassphrase = getLegacyAddressFromPassphrase;
const getLegacyAddressFromPrivateKey = (privateKey) => {
    const publicKey = nacl_1.getPublicKey(privateKey);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
exports.getLegacyAddressFromPrivateKey = getLegacyAddressFromPrivateKey;
//# sourceMappingURL=legacy_address.js.map