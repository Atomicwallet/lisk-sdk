"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweetnacl = require("tweetnacl");
exports.box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => Buffer.from(tweetnacl.box(Uint8Array.from(messageInBytes), Uint8Array.from(nonceInBytes), Uint8Array.from(convertedPublicKey), Uint8Array.from(convertedPrivateKey)));
exports.openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const originalMessage = tweetnacl.box.open(Uint8Array.from(cipherBytes), Uint8Array.from(nonceBytes), Uint8Array.from(convertedPublicKey), Uint8Array.from(convertedPrivateKey));
    if (originalMessage === null) {
        throw new Error('Failed to decrypt message');
    }
    return Buffer.from(originalMessage);
};
exports.signDetached = (messageBytes, privateKeyBytes) => Buffer.from(tweetnacl.sign.detached(Uint8Array.from(messageBytes), Uint8Array.from(privateKeyBytes)));
exports.verifyDetached = (messageBytes, signatureBytes, publicKeyBytes) => tweetnacl.sign.detached.verify(Uint8Array.from(messageBytes), Uint8Array.from(signatureBytes), Uint8Array.from(publicKeyBytes));
exports.getRandomBytes = length => Buffer.from(tweetnacl.randomBytes(length));
exports.getKeyPair = hashedSeed => {
    const { publicKey, secretKey } = tweetnacl.sign.keyPair.fromSeed(Uint8Array.from(hashedSeed));
    return {
        privateKey: Buffer.from(secretKey),
        publicKey: Buffer.from(publicKey),
    };
};
const PRIVATE_KEY_LENGTH = 32;
exports.getPublicKey = privateKey => {
    const { publicKey } = tweetnacl.sign.keyPair.fromSeed(Uint8Array.from(privateKey.slice(0, PRIVATE_KEY_LENGTH)));
    return Buffer.from(publicKey);
};
//# sourceMappingURL=slow.js.map