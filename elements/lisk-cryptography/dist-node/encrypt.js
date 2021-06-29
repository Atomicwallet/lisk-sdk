"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPassphraseWithPassword = exports.encryptPassphraseWithPassword = exports.decryptMessageWithPassphrase = exports.encryptMessageWithPassphrase = void 0;
const crypto = require("crypto");
const buffer_1 = require("./buffer");
const convert_1 = require("./convert");
const keys_1 = require("./keys");
const nacl_1 = require("./nacl");
const PBKDF2_ITERATIONS = 1e6;
const PBKDF2_KEYLEN = 32;
const PBKDF2_HASH_FUNCTION = 'sha256';
const ENCRYPTION_VERSION = '1';
const encryptMessageWithPassphrase = (message, passphrase, recipientPublicKey) => {
    const { privateKey: senderPrivateKeyBytes } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const convertedPrivateKey = Buffer.from(convert_1.convertPrivateKeyEd2Curve(senderPrivateKeyBytes));
    const messageInBytes = Buffer.from(message, 'utf8');
    const nonceSize = 24;
    const nonce = nacl_1.getRandomBytes(nonceSize);
    const publicKeyUint8Array = convert_1.convertPublicKeyEd2Curve(recipientPublicKey);
    if (publicKeyUint8Array === null) {
        throw new Error('given public key is not a valid Ed25519 public key');
    }
    const convertedPublicKey = Buffer.from(publicKeyUint8Array);
    const cipherBytes = nacl_1.box(messageInBytes, nonce, convertedPublicKey, convertedPrivateKey);
    const nonceHex = buffer_1.bufferToHex(nonce);
    const encryptedMessage = buffer_1.bufferToHex(cipherBytes);
    return {
        nonce: nonceHex,
        encryptedMessage,
    };
};
exports.encryptMessageWithPassphrase = encryptMessageWithPassphrase;
const decryptMessageWithPassphrase = (cipherHex, nonce, passphrase, senderPublicKey) => {
    const { privateKey: recipientPrivateKeyBytes } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const convertedPrivateKey = Buffer.from(convert_1.convertPrivateKeyEd2Curve(recipientPrivateKeyBytes));
    const cipherBytes = buffer_1.hexToBuffer(cipherHex);
    const nonceBytes = buffer_1.hexToBuffer(nonce);
    const publicKeyUint8Array = convert_1.convertPublicKeyEd2Curve(senderPublicKey);
    if (publicKeyUint8Array === null) {
        throw new Error('given public key is not a valid Ed25519 public key');
    }
    const convertedPublicKey = Buffer.from(publicKeyUint8Array);
    try {
        const decoded = nacl_1.openBox(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
        return Buffer.from(decoded).toString();
    }
    catch (error) {
        if (error.message.match(/bad nonce size|"n" must be crypto_box_NONCEBYTES bytes long/)) {
            throw new Error('Expected nonce to be 24 bytes.');
        }
        throw new Error('Something went wrong during decryption. Is this the full encrypted message?');
    }
};
exports.decryptMessageWithPassphrase = decryptMessageWithPassphrase;
const getKeyFromPassword = (password, salt, iterations) => crypto.pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, PBKDF2_HASH_FUNCTION);
const encryptAES256GCMWithPassword = (plainText, password, iterations = PBKDF2_ITERATIONS) => {
    const IV_BUFFER_SIZE = 12;
    const SALT_BUFFER_SIZE = 16;
    const iv = crypto.randomBytes(IV_BUFFER_SIZE);
    const salt = crypto.randomBytes(SALT_BUFFER_SIZE);
    const key = getKeyFromPassword(password, salt, iterations);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const firstBlock = cipher.update(plainText, 'utf8');
    const encrypted = Buffer.concat([firstBlock, cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iterations,
        cipherText: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        version: ENCRYPTION_VERSION,
    };
};
const getTagBuffer = (tag) => {
    const TAG_BUFFER_SIZE = 16;
    const tagBuffer = buffer_1.hexToBuffer(tag, 'Tag');
    if (tagBuffer.length !== TAG_BUFFER_SIZE) {
        throw new Error('Tag must be 16 bytes.');
    }
    return tagBuffer;
};
const decryptAES256GCMWithPassword = (encryptedPassphrase, password) => {
    const { iterations = PBKDF2_ITERATIONS, cipherText, iv, salt, tag } = encryptedPassphrase;
    const tagBuffer = getTagBuffer(tag);
    const key = getKeyFromPassword(password, buffer_1.hexToBuffer(salt, 'Salt'), iterations);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, buffer_1.hexToBuffer(iv, 'IV'));
    decipher.setAuthTag(tagBuffer);
    const firstBlock = decipher.update(buffer_1.hexToBuffer(cipherText, 'Cipher text'));
    const decrypted = Buffer.concat([firstBlock, decipher.final()]);
    return decrypted.toString();
};
exports.encryptPassphraseWithPassword = encryptAES256GCMWithPassword;
exports.decryptPassphraseWithPassword = decryptAES256GCMWithPassword;
//# sourceMappingURL=encrypt.js.map