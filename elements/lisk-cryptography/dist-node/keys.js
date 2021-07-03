"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("./buffer");
const convert_1 = require("./convert");
const hash_1 = require("./hash");
const nacl_1 = require("./nacl");
exports.getPrivateAndPublicKeyBytesFromPassphrase = (passphrase) => {
    const hashed = hash_1.hash(passphrase, 'utf8');
    const { publicKeyBytes, privateKeyBytes } = nacl_1.getKeyPair(hashed);
    return {
        privateKeyBytes,
        publicKeyBytes,
    };
};
exports.getPrivateAndPublicKeyFromPassphrase = (passphrase) => {
    const { privateKeyBytes, publicKeyBytes, } = exports.getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
    return {
        privateKey: buffer_1.bufferToHex(privateKeyBytes),
        publicKey: buffer_1.bufferToHex(publicKeyBytes),
    };
};
exports.getKeys = exports.getPrivateAndPublicKeyFromPassphrase;
exports.getAddressAndPublicKeyFromPassphrase = (passphrase) => {
    const { publicKey } = exports.getKeys(passphrase);
    const address = convert_1.getAddressFromPublicKey(publicKey);
    return {
        address,
        publicKey,
    };
};
exports.getAddressFromPassphrase = (passphrase) => {
    const { publicKey } = exports.getKeys(passphrase);
    return convert_1.getAddressFromPublicKey(publicKey);
};
exports.getAddressFromPrivateKey = (privateKey) => {
    const publicKeyBytes = nacl_1.getPublicKey(buffer_1.hexToBuffer(privateKey));
    const publicKey = buffer_1.bufferToHex(publicKeyBytes);
    return convert_1.getAddressFromPublicKey(publicKey);
};
//# sourceMappingURL=keys.js.map