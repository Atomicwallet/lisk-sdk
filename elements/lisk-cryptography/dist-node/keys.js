"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("./buffer");
var convert_1 = require("./convert");
var hash_1 = require("./hash");
var nacl_1 = require("./nacl");
exports.getPrivateAndPublicKeyBytesFromPassphrase = function (passphrase) {
    var hashed = hash_1.hash(passphrase, 'utf8');
    var _a = nacl_1.getKeyPair(hashed), publicKeyBytes = _a.publicKeyBytes, privateKeyBytes = _a.privateKeyBytes;
    return {
        privateKeyBytes: privateKeyBytes,
        publicKeyBytes: publicKeyBytes,
    };
};
exports.getPrivateAndPublicKeyFromPassphrase = function (passphrase) {
    var _a = exports.getPrivateAndPublicKeyBytesFromPassphrase(passphrase), privateKeyBytes = _a.privateKeyBytes, publicKeyBytes = _a.publicKeyBytes;
    return {
        privateKey: buffer_1.bufferToHex(privateKeyBytes),
        publicKey: buffer_1.bufferToHex(publicKeyBytes),
    };
};
exports.getKeys = exports.getPrivateAndPublicKeyFromPassphrase;
exports.getAddressAndPublicKeyFromPassphrase = function (passphrase) {
    var publicKey = exports.getKeys(passphrase).publicKey;
    var address = convert_1.getAddressFromPublicKey(publicKey);
    return {
        address: address,
        publicKey: publicKey,
    };
};
exports.getAddressFromPassphrase = function (passphrase) {
    var publicKey = exports.getKeys(passphrase).publicKey;
    return convert_1.getAddressFromPublicKey(publicKey);
};
exports.getAddressFromPrivateKey = function (privateKey) {
    var publicKeyBytes = nacl_1.getPublicKey(buffer_1.hexToBuffer(privateKey));
    var publicKey = buffer_1.bufferToHex(publicKeyBytes);
    return convert_1.getAddressFromPublicKey(publicKey);
};
//# sourceMappingURL=keys.js.map