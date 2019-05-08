"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tweetnacl = require("tweetnacl");
exports.box = function (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) {
    return Buffer.from(tweetnacl.box(messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey));
};
exports.openBox = function (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) {
    var originalMessage = tweetnacl.box.open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
    if (originalMessage === null) {
        throw new Error('Failed to decrypt message');
    }
    return Buffer.from(originalMessage);
};
exports.signDetached = function (messageBytes, privateKeyBytes) { return Buffer.from(tweetnacl.sign.detached(messageBytes, privateKeyBytes)); };
exports.verifyDetached = tweetnacl.sign.detached.verify;
exports.getRandomBytes = function (length) {
    return Buffer.from(tweetnacl.randomBytes(length));
};
exports.getKeyPair = function (hashedSeed) {
    var _a = tweetnacl.sign.keyPair.fromSeed(hashedSeed), publicKey = _a.publicKey, secretKey = _a.secretKey;
    return {
        privateKeyBytes: Buffer.from(secretKey),
        publicKeyBytes: Buffer.from(publicKey),
    };
};
var PRIVATE_KEY_LENGTH = 32;
exports.getPublicKey = function (privateKey) {
    var publicKey = tweetnacl.sign.keyPair.fromSeed(privateKey.slice(0, PRIVATE_KEY_LENGTH)).publicKey;
    return Buffer.from(publicKey);
};
//# sourceMappingURL=slow.js.map