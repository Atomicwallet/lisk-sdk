"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
const cryptography = require("../../../lisk-cryptography");
const constants_1 = require("../constants");
exports.isValidValue = (value) => {
    if (value === undefined) {
        return false;
    }
    if (typeof value === 'number' && Number.isNaN(value)) {
        return false;
    }
    if (value === false) {
        return false;
    }
    return true;
};
exports.checkRequiredFields = (requiredFields, data) => {
    const dataFields = Object.keys(data);
    requiredFields.forEach(parameter => {
        if (!dataFields.includes(parameter) || !exports.isValidValue(data[parameter])) {
            throw new Error(`${parameter} is a required parameter.`);
        }
    });
    return true;
};
exports.getAssetDataForTransferTransaction = ({ data, }) => data ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
exports.getAssetDataForRegisterSecondSignatureTransaction = ({ signature, }) => {
    exports.checkRequiredFields(['publicKey'], signature);
    const { publicKey } = signature;
    return cryptography.hexToBuffer(publicKey);
};
exports.getAssetDataForRegisterDelegateTransaction = ({ delegate, }) => {
    exports.checkRequiredFields(['username'], delegate);
    const { username } = delegate;
    return Buffer.from(username, 'utf8');
};
exports.getAssetDataForCastVotesTransaction = ({ votes, }) => {
    if (!Array.isArray(votes)) {
        throw new Error('votes parameter must be an Array.');
    }
    return Buffer.from(votes.join(''), 'utf8');
};
exports.getAssetDataForRegisterMultisignatureAccountTransaction = ({ multisignature, }) => {
    exports.checkRequiredFields(['min', 'lifetime', 'keysgroup'], multisignature);
    const { min, lifetime, keysgroup } = multisignature;
    const minBuffer = Buffer.alloc(1, min);
    const lifetimeBuffer = Buffer.alloc(1, lifetime);
    const keysgroupBuffer = Buffer.from(keysgroup.join(''), 'utf8');
    return Buffer.concat([minBuffer, lifetimeBuffer, keysgroupBuffer]);
};
const DAPP_TYPE_LENGTH = 4;
const DAPP_CATEGORY_LENGTH = 4;
exports.getAssetDataForCreateDappTransaction = ({ dapp, }) => {
    exports.checkRequiredFields(['name', 'link', 'type', 'category'], dapp);
    const { name, description, tags, link, icon, type, category } = dapp;
    const nameBuffer = Buffer.from(name, 'utf8');
    const linkBuffer = Buffer.from(link, 'utf8');
    const typeBuffer = Buffer.alloc(DAPP_TYPE_LENGTH);
    typeBuffer.writeIntLE(type, 0, DAPP_TYPE_LENGTH);
    const categoryBuffer = Buffer.alloc(DAPP_CATEGORY_LENGTH);
    categoryBuffer.writeIntLE(category, 0, DAPP_CATEGORY_LENGTH);
    const descriptionBuffer = description
        ? Buffer.from(description, 'utf8')
        : Buffer.alloc(0);
    const tagsBuffer = tags ? Buffer.from(tags, 'utf8') : Buffer.alloc(0);
    const iconBuffer = icon ? Buffer.from(icon, 'utf8') : Buffer.alloc(0);
    return Buffer.concat([
        nameBuffer,
        descriptionBuffer,
        tagsBuffer,
        linkBuffer,
        iconBuffer,
        typeBuffer,
        categoryBuffer,
    ]);
};
exports.getAssetDataForTransferIntoDappTransaction = ({ inTransfer, }) => {
    exports.checkRequiredFields(['dappId'], inTransfer);
    const { dappId } = inTransfer;
    return Buffer.from(dappId, 'utf8');
};
exports.getAssetDataForTransferOutOfDappTransaction = ({ outTransfer, }) => {
    exports.checkRequiredFields(['dappId', 'transactionId'], outTransfer);
    const { dappId, transactionId } = outTransfer;
    const outAppIdBuffer = Buffer.from(dappId, 'utf8');
    const outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');
    return Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]);
};
const transactionTypeAssetGetBytesMap = {
    0: exports.getAssetDataForTransferTransaction,
    1: exports.getAssetDataForRegisterSecondSignatureTransaction,
    2: exports.getAssetDataForRegisterDelegateTransaction,
    3: exports.getAssetDataForCastVotesTransaction,
    4: exports.getAssetDataForRegisterMultisignatureAccountTransaction,
    5: exports.getAssetDataForCreateDappTransaction,
    6: exports.getAssetDataForTransferIntoDappTransaction,
    7: exports.getAssetDataForTransferOutOfDappTransaction,
};
exports.getAssetBytes = (transaction) => transactionTypeAssetGetBytesMap[transaction.type](transaction.asset);
const REQUIRED_TRANSACTION_PARAMETERS = [
    'type',
    'timestamp',
    'senderPublicKey',
    'amount',
];
exports.checkTransaction = (transaction) => {
    exports.checkRequiredFields(REQUIRED_TRANSACTION_PARAMETERS, transaction);
    const { data } = transaction.asset;
    if (data && data.length > constants_1.BYTESIZES.DATA) {
        throw new Error(`Transaction asset data exceeds size of ${constants_1.BYTESIZES.DATA}.`);
    }
    return true;
};
exports.getTransactionBytes = (transaction) => {
    exports.checkTransaction(transaction);
    const { type, timestamp, senderPublicKey, recipientId, amount, signature, signSignature, } = transaction;
    const transactionType = Buffer.alloc(constants_1.BYTESIZES.TYPE, type);
    const transactionTimestamp = Buffer.alloc(constants_1.BYTESIZES.TIMESTAMP);
    transactionTimestamp.writeIntLE(timestamp, 0, constants_1.BYTESIZES.TIMESTAMP);
    const transactionSenderPublicKey = cryptography.hexToBuffer(senderPublicKey);
    const transactionRecipientID = recipientId
        ? cryptography.bigNumberToBuffer(recipientId.slice(0, -1), constants_1.BYTESIZES.RECIPIENT_ID)
        : Buffer.alloc(constants_1.BYTESIZES.RECIPIENT_ID);
    const amountBigNum = new BN(amount);
    if (amountBigNum.lt(0)) {
        throw new Error('Transaction amount must not be negative.');
    }
    if (amountBigNum.gt(new BN(constants_1.MAX_TRANSACTION_AMOUNT))) {
        throw new Error('Transaction amount is too large.');
    }
    const transactionAmount = amountBigNum.toBuffer({
        endian: 'little',
        size: constants_1.BYTESIZES.AMOUNT,
    });
    const transactionAssetData = exports.getAssetBytes(transaction);
    const transactionSignature = signature
        ? cryptography.hexToBuffer(signature)
        : Buffer.alloc(0);
    const transactionSecondSignature = signSignature
        ? cryptography.hexToBuffer(signSignature)
        : Buffer.alloc(0);
    return Buffer.concat([
        transactionType,
        transactionTimestamp,
        transactionSenderPublicKey,
        transactionRecipientID,
        transactionAmount,
        transactionAssetData,
        transactionSignature,
        transactionSecondSignature,
    ]);
};
//# sourceMappingURL=get_transaction_bytes.js.map