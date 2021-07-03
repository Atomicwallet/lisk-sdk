"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweetnacl = require("tweetnacl");
exports.box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => Buffer.from(tweetnacl.box(messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey));
exports.openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const originalMessage = tweetnacl.box.open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
    if (originalMessage === null) {
        throw new Error('Failed to decrypt message');
    }
    return Buffer.from(originalMessage);
};
exports.signDetached = (messageBytes, privateKeyBytes) => Buffer.from(tweetnacl.sign.detached(messageBytes, privateKeyBytes));
exports.verifyDetached = tweetnacl.sign.detached.verify;
exports.getRandomBytes = length => Buffer.from(tweetnacl.randomBytes(length));
exports.getKeyPair = hashedSeed => {
    const { publicKey, secretKey } = tweetnacl.sign.keyPair.fromSeed(hashedSeed);
    return {
        privateKeyBytes: Buffer.from(secretKey),
        publicKeyBytes: Buffer.from(publicKey),
    };
};
const PRIVATE_KEY_LENGTH = 32;
exports.getPublicKey = privateKey => {
    const { publicKey } = tweetnacl.sign.keyPair.fromSeed(privateKey.slice(0, PRIVATE_KEY_LENGTH));
    return Buffer.from(publicKey);
};
//# sourceMappingURL=slow.js.map