"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var buffer_1 = require("./buffer");
var convert_1 = require("./convert");
var keys_1 = require("./keys");
var nacl_1 = require("./nacl");
var PBKDF2_ITERATIONS = 1e6;
var PBKDF2_KEYLEN = 32;
var PBKDF2_HASH_FUNCTION = 'sha256';
var ENCRYPTION_VERSION = '1';
exports.encryptMessageWithPassphrase = function (message, passphrase, recipientPublicKey) {
    var senderPrivateKeyBytes = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase).privateKeyBytes;
    var convertedPrivateKey = Buffer.from(convert_1.convertPrivateKeyEd2Curve(senderPrivateKeyBytes));
    var recipientPublicKeyBytes = buffer_1.hexToBuffer(recipientPublicKey);
    var messageInBytes = Buffer.from(message, 'utf8');
    var nonceSize = 24;
    var nonce = nacl_1.getRandomBytes(nonceSize);
    var publicKeyUint8Array = convert_1.convertPublicKeyEd2Curve(recipientPublicKeyBytes);
    if (publicKeyUint8Array === null) {
        throw new Error('given public key is not a valid Ed25519 public key');
    }
    var convertedPublicKey = Buffer.from(publicKeyUint8Array);
    var cipherBytes = nacl_1.box(messageInBytes, nonce, convertedPublicKey, convertedPrivateKey);
    var nonceHex = buffer_1.bufferToHex(nonce);
    var encryptedMessage = buffer_1.bufferToHex(cipherBytes);
    return {
        nonce: nonceHex,
        encryptedMessage: encryptedMessage,
    };
};
exports.decryptMessageWithPassphrase = function (cipherHex, nonce, passphrase, senderPublicKey) {
    var recipientPrivateKeyBytes = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase).privateKeyBytes;
    var convertedPrivateKey = Buffer.from(convert_1.convertPrivateKeyEd2Curve(recipientPrivateKeyBytes));
    var senderPublicKeyBytes = buffer_1.hexToBuffer(senderPublicKey);
    var cipherBytes = buffer_1.hexToBuffer(cipherHex);
    var nonceBytes = buffer_1.hexToBuffer(nonce);
    var publicKeyUint8Array = convert_1.convertPublicKeyEd2Curve(senderPublicKeyBytes);
    if (publicKeyUint8Array === null) {
        throw new Error('given public key is not a valid Ed25519 public key');
    }
    var convertedPublicKey = Buffer.from(publicKeyUint8Array);
    try {
        var decoded = nacl_1.openBox(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
        return Buffer.from(decoded).toString();
    }
    catch (error) {
        if (error.message.match(/bad nonce size|nonce must be a buffer of size crypto_box_NONCEBYTES/)) {
            throw new Error('Expected nonce to be 24 bytes.');
        }
        throw new Error('Something went wrong during decryption. Is this the full encrypted message?');
    }
};
var getKeyFromPassword = function (password, salt, iterations) {
    return crypto.pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, PBKDF2_HASH_FUNCTION);
};
var encryptAES256GCMWithPassword = function (plainText, password, iterations) {
    if (iterations === void 0) { iterations = PBKDF2_ITERATIONS; }
    var IV_BUFFER_SIZE = 12;
    var SALT_BUFFER_SIZE = 16;
    var iv = crypto.randomBytes(IV_BUFFER_SIZE);
    var salt = crypto.randomBytes(SALT_BUFFER_SIZE);
    var key = getKeyFromPassword(password, salt, iterations);
    var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    var firstBlock = cipher.update(plainText, 'utf8');
    var encrypted = Buffer.concat([firstBlock, cipher.final()]);
    var tag = cipher.getAuthTag();
    return {
        iterations: iterations,
        cipherText: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        version: ENCRYPTION_VERSION,
    };
};
var getTagBuffer = function (tag) {
    var TAG_BUFFER_SIZE = 16;
    var tagBuffer = buffer_1.hexToBuffer(tag, 'Tag');
    if (tagBuffer.length !== TAG_BUFFER_SIZE) {
        throw new Error('Tag must be 16 bytes.');
    }
    return tagBuffer;
};
var decryptAES256GCMWithPassword = function (encryptedPassphrase, password) {
    var _a = encryptedPassphrase.iterations, iterations = _a === void 0 ? PBKDF2_ITERATIONS : _a, cipherText = encryptedPassphrase.cipherText, iv = encryptedPassphrase.iv, salt = encryptedPassphrase.salt, tag = encryptedPassphrase.tag;
    var tagBuffer = getTagBuffer(tag);
    var key = getKeyFromPassword(password, buffer_1.hexToBuffer(salt, 'Salt'), iterations);
    var decipher = crypto.createDecipheriv('aes-256-gcm', key, buffer_1.hexToBuffer(iv, 'IV'));
    decipher.setAuthTag(tagBuffer);
    var firstBlock = decipher.update(buffer_1.hexToBuffer(cipherText, 'Cipher text'));
    var decrypted = Buffer.concat([firstBlock, decipher.final()]);
    return decrypted.toString();
};
exports.encryptPassphraseWithPassword = encryptAES256GCMWithPassword;
exports.decryptPassphraseWithPassword = decryptAES256GCMWithPassword;
//# sourceMappingURL=encrypt.js.map