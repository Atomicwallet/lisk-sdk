"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const varuint_bitcoin_1 = require("varuint-bitcoin");
const constants_1 = require("./constants");
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const nacl_1 = require("./nacl");
const createHeader = (text) => `-----${text}-----`;
const signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
const messageHeader = createHeader('MESSAGE');
const publicKeyHeader = createHeader('PUBLIC KEY');
const signatureHeader = createHeader('SIGNATURE');
const signatureFooter = createHeader('END LISK SIGNED MESSAGE');
const SIGNED_MESSAGE_PREFIX_BYTES = Buffer.from(constants_1.SIGNED_MESSAGE_PREFIX, 'utf8');
const SIGNED_MESSAGE_PREFIX_LENGTH = varuint_bitcoin_1.encode(constants_1.SIGNED_MESSAGE_PREFIX.length);
exports.digestMessage = (message) => {
    const msgBytes = Buffer.from(message, 'utf8');
    const msgLenBytes = varuint_bitcoin_1.encode(message.length);
    const dataBytes = Buffer.concat([
        SIGNED_MESSAGE_PREFIX_LENGTH,
        SIGNED_MESSAGE_PREFIX_BYTES,
        msgLenBytes,
        msgBytes,
    ]);
    return hash_1.hash(hash_1.hash(dataBytes));
};
exports.signMessageWithPassphrase = (message, passphrase) => {
    const msgBytes = exports.digestMessage(message);
    const { privateKey, publicKey } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const signature = nacl_1.signDetached(msgBytes, privateKey);
    return {
        message,
        publicKey,
        signature,
    };
};
exports.verifyMessageWithPublicKey = ({ message, publicKey, signature, }) => {
    const msgBytes = exports.digestMessage(message);
    if (publicKey.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error(`Invalid publicKey, expected ${nacl_1.NACL_SIGN_PUBLICKEY_LENGTH.toString()}-byte publicKey`);
    }
    if (signature.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error(`Invalid signature length, expected ${nacl_1.NACL_SIGN_SIGNATURE_LENGTH.toString()}-byte signature`);
    }
    return nacl_1.verifyDetached(msgBytes, signature, publicKey);
};
exports.printSignedMessage = ({ message, signature, publicKey }) => [
    signedMessageHeader,
    messageHeader,
    message,
    publicKeyHeader,
    publicKey.toString('hex'),
    signatureHeader,
    signature.toString('hex'),
    signatureFooter,
]
    .filter(Boolean)
    .join('\n');
exports.signAndPrintMessage = (message, passphrase) => {
    const signedMessage = exports.signMessageWithPassphrase(message, passphrase);
    return exports.printSignedMessage(signedMessage);
};
exports.signDataWithPrivateKey = (data, privateKey) => nacl_1.signDetached(data, privateKey);
exports.signDataWithPassphrase = (data, passphrase) => {
    const { privateKey } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    return exports.signDataWithPrivateKey(data, privateKey);
};
exports.signData = exports.signDataWithPassphrase;
exports.verifyData = (data, signature, publicKey) => nacl_1.verifyDetached(data, signature, publicKey);
//# sourceMappingURL=sign.js.map