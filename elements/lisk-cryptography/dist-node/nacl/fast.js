"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicKey = exports.getKeyPair = exports.getRandomBytes = exports.verifyDetached = exports.signDetached = exports.openBox = exports.box = void 0;
const sodium = require("sodium-native");
const box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => {
    const cipherBytes = Buffer.alloc(messageInBytes.length + sodium.crypto_box_MACBYTES);
    sodium.crypto_box_easy(cipherBytes, messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey);
    return cipherBytes;
};
exports.box = box;
const openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const plainText = Buffer.alloc(cipherBytes.length - sodium.crypto_box_MACBYTES);
    if (!sodium.crypto_box_open_easy(plainText, cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey)) {
        throw new Error('Failed to decrypt message');
    }
    return plainText;
};
exports.openBox = openBox;
const signDetached = (messageBytes, privateKeyBytes) => {
    const signatureBytes = Buffer.alloc(sodium.crypto_sign_BYTES);
    sodium.crypto_sign_detached(signatureBytes, messageBytes, privateKeyBytes);
    return signatureBytes;
};
exports.signDetached = signDetached;
const verifyDetached = (messageBytes, signatureBytes, publicKeyBytes) => sodium.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
exports.verifyDetached = verifyDetached;
const getRandomBytes = length => {
    const nonce = Buffer.alloc(length);
    sodium.randombytes_buf(nonce);
    return nonce;
};
exports.getRandomBytes = getRandomBytes;
const getKeyPair = hashedSeed => {
    const publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    const privateKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_seed_keypair(publicKey, privateKey, hashedSeed);
    return {
        publicKey,
        privateKey,
    };
};
exports.getKeyPair = getKeyPair;
const getPublicKey = privateKey => {
    const publicKeyBytes = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    sodium.crypto_sign_ed25519_sk_to_pk(publicKeyBytes, privateKey);
    return publicKeyBytes;
};
exports.getPublicKey = getPublicKey;
//# sourceMappingURL=fast.js.map