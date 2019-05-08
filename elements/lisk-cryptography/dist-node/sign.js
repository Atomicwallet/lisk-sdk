"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var varuint_bitcoin_1 = require("varuint-bitcoin");
var buffer_1 = require("./buffer");
var constants_1 = require("./constants");
var hash_1 = require("./hash");
var keys_1 = require("./keys");
var nacl_1 = require("./nacl");
var createHeader = function (text) { return "-----" + text + "-----"; };
var signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
var messageHeader = createHeader('MESSAGE');
var publicKeyHeader = createHeader('PUBLIC KEY');
var secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
var signatureHeader = createHeader('SIGNATURE');
var secondSignatureHeader = createHeader('SECOND SIGNATURE');
var signatureFooter = createHeader('END LISK SIGNED MESSAGE');
var SIGNED_MESSAGE_PREFIX_BYTES = Buffer.from(constants_1.SIGNED_MESSAGE_PREFIX, 'utf8');
var SIGNED_MESSAGE_PREFIX_LENGTH = varuint_bitcoin_1.encode(constants_1.SIGNED_MESSAGE_PREFIX.length);
exports.digestMessage = function (message) {
    var msgBytes = Buffer.from(message, 'utf8');
    var msgLenBytes = varuint_bitcoin_1.encode(message.length);
    var dataBytes = Buffer.concat([
        SIGNED_MESSAGE_PREFIX_LENGTH,
        SIGNED_MESSAGE_PREFIX_BYTES,
        msgLenBytes,
        msgBytes,
    ]);
    return hash_1.hash(hash_1.hash(dataBytes));
};
exports.signMessageWithPassphrase = function (message, passphrase) {
    var msgBytes = exports.digestMessage(message);
    var _a = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase), privateKeyBytes = _a.privateKeyBytes, publicKeyBytes = _a.publicKeyBytes;
    var signature = nacl_1.signDetached(msgBytes, privateKeyBytes);
    return {
        message: message,
        publicKey: buffer_1.bufferToHex(publicKeyBytes),
        signature: buffer_1.bufferToHex(signature),
    };
};
exports.verifyMessageWithPublicKey = function (_a) {
    var message = _a.message, publicKey = _a.publicKey, signature = _a.signature;
    var msgBytes = exports.digestMessage(message);
    var signatureBytes = buffer_1.hexToBuffer(signature);
    var publicKeyBytes = buffer_1.hexToBuffer(publicKey);
    if (publicKeyBytes.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error("Invalid publicKey, expected " + nacl_1.NACL_SIGN_PUBLICKEY_LENGTH + "-byte publicKey");
    }
    if (signatureBytes.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error("Invalid signature length, expected " + nacl_1.NACL_SIGN_SIGNATURE_LENGTH + "-byte signature");
    }
    return nacl_1.verifyDetached(msgBytes, signatureBytes, publicKeyBytes);
};
exports.signMessageWithTwoPassphrases = function (message, passphrase, secondPassphrase) {
    var msgBytes = exports.digestMessage(message);
    var keypairBytes = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
    var secondKeypairBytes = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(secondPassphrase);
    var signature = nacl_1.signDetached(msgBytes, keypairBytes.privateKeyBytes);
    var secondSignature = nacl_1.signDetached(msgBytes, secondKeypairBytes.privateKeyBytes);
    return {
        message: message,
        publicKey: buffer_1.bufferToHex(keypairBytes.publicKeyBytes),
        secondPublicKey: buffer_1.bufferToHex(secondKeypairBytes.publicKeyBytes),
        signature: buffer_1.bufferToHex(signature),
        secondSignature: buffer_1.bufferToHex(secondSignature),
    };
};
exports.verifyMessageWithTwoPublicKeys = function (_a) {
    var message = _a.message, signature = _a.signature, secondSignature = _a.secondSignature, publicKey = _a.publicKey, secondPublicKey = _a.secondPublicKey;
    var messageBytes = exports.digestMessage(message);
    var signatureBytes = buffer_1.hexToBuffer(signature);
    var secondSignatureBytes = buffer_1.hexToBuffer(secondSignature);
    var publicKeyBytes = buffer_1.hexToBuffer(publicKey);
    var secondPublicKeyBytes = buffer_1.hexToBuffer(secondPublicKey);
    if (signatureBytes.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error("Invalid first signature length, expected " + nacl_1.NACL_SIGN_SIGNATURE_LENGTH + "-byte signature");
    }
    if (secondSignatureBytes.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error("Invalid second signature length, expected " + nacl_1.NACL_SIGN_SIGNATURE_LENGTH + "-byte signature");
    }
    if (publicKeyBytes.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error("Invalid first publicKey, expected " + nacl_1.NACL_SIGN_PUBLICKEY_LENGTH + "-byte publicKey");
    }
    if (secondPublicKeyBytes.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error("Invalid second publicKey, expected " + nacl_1.NACL_SIGN_PUBLICKEY_LENGTH + "-byte publicKey");
    }
    var verifyFirstSignature = function () {
        return nacl_1.verifyDetached(messageBytes, signatureBytes, publicKeyBytes);
    };
    var verifySecondSignature = function () {
        return nacl_1.verifyDetached(messageBytes, secondSignatureBytes, secondPublicKeyBytes);
    };
    return verifyFirstSignature() && verifySecondSignature();
};
exports.printSignedMessage = function (_a) {
    var message = _a.message, signature = _a.signature, publicKey = _a.publicKey, secondSignature = _a.secondSignature, secondPublicKey = _a.secondPublicKey;
    return [
        signedMessageHeader,
        messageHeader,
        message,
        publicKeyHeader,
        publicKey,
        secondPublicKey ? secondPublicKeyHeader : undefined,
        secondPublicKey,
        signatureHeader,
        signature,
        secondSignature ? secondSignatureHeader : undefined,
        secondSignature,
        signatureFooter,
    ]
        .filter(Boolean)
        .join('\n');
};
exports.signAndPrintMessage = function (message, passphrase, secondPassphrase) {
    var signedMessage = secondPassphrase
        ? exports.signMessageWithTwoPassphrases(message, passphrase, secondPassphrase)
        : exports.signMessageWithPassphrase(message, passphrase);
    return exports.printSignedMessage(signedMessage);
};
exports.signDataWithPrivateKey = function (data, privateKey) {
    var signature = nacl_1.signDetached(data, privateKey);
    return buffer_1.bufferToHex(signature);
};
exports.signDataWithPassphrase = function (data, passphrase) {
    var privateKeyBytes = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase).privateKeyBytes;
    return exports.signDataWithPrivateKey(data, privateKeyBytes);
};
exports.signData = exports.signDataWithPassphrase;
exports.verifyData = function (data, signature, publicKey) {
    return nacl_1.verifyDetached(data, buffer_1.hexToBuffer(signature), buffer_1.hexToBuffer(publicKey));
};
//# sourceMappingURL=sign.js.map