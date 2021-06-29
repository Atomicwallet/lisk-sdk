"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyData = exports.signData = exports.signDataWithPassphrase = exports.signDataWithPrivateKey = exports.signAndPrintMessage = exports.printSignedMessage = exports.verifyMessageWithPublicKey = exports.signMessageWithPassphrase = exports.digestMessage = void 0;
const varuint_bitcoin_1 = require("varuint-bitcoin");
const constants_1 = require("./constants");
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const message_tag_1 = require("./message_tag");
const nacl_1 = require("./nacl");
const createHeader = (text) => `-----${text}-----`;
const signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
const messageHeader = createHeader('MESSAGE');
const publicKeyHeader = createHeader('PUBLIC KEY');
const signatureHeader = createHeader('SIGNATURE');
const signatureFooter = createHeader('END LISK SIGNED MESSAGE');
const SIGNED_MESSAGE_PREFIX_BYTES = Buffer.from(constants_1.SIGNED_MESSAGE_PREFIX, 'utf8');
const SIGNED_MESSAGE_PREFIX_LENGTH = varuint_bitcoin_1.encode(constants_1.SIGNED_MESSAGE_PREFIX.length);
const digestMessage = (message) => {
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
exports.digestMessage = digestMessage;
const signMessageWithPassphrase = (message, passphrase) => {
    const msgBytes = exports.digestMessage(message);
    const { privateKey, publicKey } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    const signature = nacl_1.signDetached(msgBytes, privateKey);
    return {
        message,
        publicKey,
        signature,
    };
};
exports.signMessageWithPassphrase = signMessageWithPassphrase;
const verifyMessageWithPublicKey = ({ message, publicKey, signature, }) => {
    const msgBytes = exports.digestMessage(message);
    if (publicKey.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error(`Invalid publicKey, expected ${nacl_1.NACL_SIGN_PUBLICKEY_LENGTH.toString()}-byte publicKey`);
    }
    if (signature.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error(`Invalid signature length, expected ${nacl_1.NACL_SIGN_SIGNATURE_LENGTH.toString()}-byte signature`);
    }
    return nacl_1.verifyDetached(msgBytes, signature, publicKey);
};
exports.verifyMessageWithPublicKey = verifyMessageWithPublicKey;
const printSignedMessage = ({ message, signature, publicKey }) => [
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
exports.printSignedMessage = printSignedMessage;
const signAndPrintMessage = (message, passphrase) => {
    const signedMessage = exports.signMessageWithPassphrase(message, passphrase);
    return exports.printSignedMessage(signedMessage);
};
exports.signAndPrintMessage = signAndPrintMessage;
const signDataWithPrivateKey = (tag, networkIdentifier, data, privateKey) => nacl_1.signDetached(message_tag_1.tagMessage(tag, networkIdentifier, data), privateKey);
exports.signDataWithPrivateKey = signDataWithPrivateKey;
const signDataWithPassphrase = (tag, networkIdentifier, data, passphrase) => {
    const { privateKey } = keys_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
    return exports.signDataWithPrivateKey(tag, networkIdentifier, data, privateKey);
};
exports.signDataWithPassphrase = signDataWithPassphrase;
exports.signData = exports.signDataWithPassphrase;
const verifyData = (tag, networkIdentifier, data, signature, publicKey) => nacl_1.verifyDetached(message_tag_1.tagMessage(tag, networkIdentifier, data), signature, publicKey);
exports.verifyData = verifyData;
//# sourceMappingURL=sign.js.map