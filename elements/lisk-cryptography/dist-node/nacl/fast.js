"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sodium = require("sodium-native");
exports.box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => {
    const cipherBytes = Buffer.alloc(messageInBytes.length + sodium.crypto_box_MACBYTES);
    sodium.crypto_box_easy(cipherBytes, messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey);
    return cipherBytes;
};
exports.openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const plainText = Buffer.alloc(cipherBytes.length - sodium.crypto_box_MACBYTES);
    if (!sodium.crypto_box_open_easy(plainText, cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey)) {
        throw new Error('Failed to decrypt message');
    }
    return plainText;
};
exports.signDetached = (messageBytes, privateKeyBytes) => {
    const signatureBytes = Buffer.alloc(sodium.crypto_sign_BYTES);
    sodium.crypto_sign_detached(signatureBytes, messageBytes, privateKeyBytes);
    return signatureBytes;
};
exports.verifyDetached = (messageBytes, signatureBytes, publicKeyBytes) => sodium.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
exports.getRandomBytes = length => {
    const nonce = Buffer.alloc(length);
    sodium.randombytes_buf(nonce);
    return nonce;
};
exports.getKeyPair = hashedSeed => {
    const publicKeyBytes = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    const privateKeyBytes = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_seed_keypair(publicKeyBytes, privateKeyBytes, hashedSeed);
    return {
        publicKeyBytes,
        privateKeyBytes,
    };
};
exports.getPublicKey = privateKey => {
    const publicKeyBytes = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    const privateKeyBytes = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_seed_keypair(publicKeyBytes, privateKeyBytes, privateKey);
    return publicKeyBytes;
};
//# sourceMappingURL=fast.js.map