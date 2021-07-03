"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicKey = exports.getKeyPair = exports.getRandomBytes = exports.verifyDetached = exports.signDetached = exports.openBox = exports.box = void 0;
const tweetnacl = require("tweetnacl");
const box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => Buffer.from(tweetnacl.box(messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey));
exports.box = box;
const openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const originalMessage = tweetnacl.box.open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
    if (originalMessage === null) {
        throw new Error('Failed to decrypt message');
    }
    return Buffer.from(originalMessage);
};
exports.openBox = openBox;
const signDetached = (messageBytes, privateKeyBytes) => Buffer.from(tweetnacl.sign.detached(messageBytes, privateKeyBytes));
exports.signDetached = signDetached;
exports.verifyDetached = tweetnacl.sign.detached.verify;
const getRandomBytes = length => Buffer.from(tweetnacl.randomBytes(length));
exports.getRandomBytes = getRandomBytes;
const getKeyPair = hashedSeed => {
    const { publicKey, secretKey } = tweetnacl.sign.keyPair.fromSeed(hashedSeed);
    return {
        privateKeyBytes: Buffer.from(secretKey),
        publicKeyBytes: Buffer.from(publicKey),
    };
};
exports.getKeyPair = getKeyPair;
const PRIVATE_KEY_LENGTH = 32;
const getPublicKey = privateKey => {
    const { publicKey } = tweetnacl.sign.keyPair.fromSeed(privateKey.slice(0, PRIVATE_KEY_LENGTH));
    return Buffer.from(publicKey);
};
exports.getPublicKey = getPublicKey;
//# sourceMappingURL=slow.js.map