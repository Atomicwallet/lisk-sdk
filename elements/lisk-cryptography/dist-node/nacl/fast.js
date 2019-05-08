"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sodium = require("sodium-native");
exports.box = function (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) {
    var cipherBytes = Buffer.alloc(messageInBytes.length + sodium.crypto_box_MACBYTES);
    sodium.crypto_box_easy(cipherBytes, messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey);
    return cipherBytes;
};
exports.openBox = function (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) {
    var plainText = Buffer.alloc(cipherBytes.length - sodium.crypto_box_MACBYTES);
    if (!sodium.crypto_box_open_easy(plainText, cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey)) {
        throw new Error('Failed to decrypt message');
    }
    return plainText;
};
exports.signDetached = function (messageBytes, privateKeyBytes) {
    var signatureBytes = Buffer.alloc(sodium.crypto_sign_BYTES);
    sodium.crypto_sign_detached(signatureBytes, messageBytes, privateKeyBytes);
    return signatureBytes;
};
exports.verifyDetached = function (messageBytes, signatureBytes, publicKeyBytes) {
    return sodium.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
};
exports.getRandomBytes = function (length) {
    var nonce = Buffer.alloc(length);
    sodium.randombytes_buf(nonce);
    return nonce;
};
exports.getKeyPair = function (hashedSeed) {
    var publicKeyBytes = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    var privateKeyBytes = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_seed_keypair(publicKeyBytes, privateKeyBytes, hashedSeed);
    return {
        publicKeyBytes: publicKeyBytes,
        privateKeyBytes: privateKeyBytes,
    };
};
exports.getPublicKey = function (privateKey) {
    var publicKeyBytes = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    var privateKeyBytes = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_seed_keypair(publicKeyBytes, privateKeyBytes, privateKey);
    return publicKeyBytes;
};
//# sourceMappingURL=fast.js.map