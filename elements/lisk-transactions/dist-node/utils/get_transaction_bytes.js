"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var cryptography = require("@liskhq/lisk-cryptography");
var constants_1 = require("../constants");
exports.isValidValue = function (value) {
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
exports.checkRequiredFields = function (requiredFields, data) {
    var dataFields = Object.keys(data);
    requiredFields.forEach(function (parameter) {
        if (!dataFields.includes(parameter) || !exports.isValidValue(data[parameter])) {
            throw new Error(parameter + " is a required parameter.");
        }
    });
    return true;
};
exports.getAssetDataForTransferTransaction = function (_a) {
    var data = _a.data;
    return data ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
};
exports.getAssetDataForRegisterSecondSignatureTransaction = function (_a) {
    var signature = _a.signature;
    exports.checkRequiredFields(['publicKey'], signature);
    var publicKey = signature.publicKey;
    return cryptography.hexToBuffer(publicKey);
};
exports.getAssetDataForRegisterDelegateTransaction = function (_a) {
    var delegate = _a.delegate;
    exports.checkRequiredFields(['username'], delegate);
    var username = delegate.username;
    return Buffer.from(username, 'utf8');
};
exports.getAssetDataForCastVotesTransaction = function (_a) {
    var votes = _a.votes;
    if (!Array.isArray(votes)) {
        throw new Error('votes parameter must be an Array.');
    }
    return Buffer.from(votes.join(''), 'utf8');
};
exports.getAssetDataForRegisterMultisignatureAccountTransaction = function (_a) {
    var multisignature = _a.multisignature;
    exports.checkRequiredFields(['min', 'lifetime', 'keysgroup'], multisignature);
    var min = multisignature.min, lifetime = multisignature.lifetime, keysgroup = multisignature.keysgroup;
    var minBuffer = Buffer.alloc(1, min);
    var lifetimeBuffer = Buffer.alloc(1, lifetime);
    var keysgroupBuffer = Buffer.from(keysgroup.join(''), 'utf8');
    return Buffer.concat([minBuffer, lifetimeBuffer, keysgroupBuffer]);
};
var DAPP_TYPE_LENGTH = 4;
var DAPP_CATEGORY_LENGTH = 4;
exports.getAssetDataForCreateDappTransaction = function (_a) {
    var dapp = _a.dapp;
    exports.checkRequiredFields(['name', 'link', 'type', 'category'], dapp);
    var name = dapp.name, description = dapp.description, tags = dapp.tags, link = dapp.link, icon = dapp.icon, type = dapp.type, category = dapp.category;
    var nameBuffer = Buffer.from(name, 'utf8');
    var linkBuffer = Buffer.from(link, 'utf8');
    var typeBuffer = Buffer.alloc(DAPP_TYPE_LENGTH);
    typeBuffer.writeIntLE(type, 0, DAPP_TYPE_LENGTH);
    var categoryBuffer = Buffer.alloc(DAPP_CATEGORY_LENGTH);
    categoryBuffer.writeIntLE(category, 0, DAPP_CATEGORY_LENGTH);
    var descriptionBuffer = description
        ? Buffer.from(description, 'utf8')
        : Buffer.alloc(0);
    var tagsBuffer = tags ? Buffer.from(tags, 'utf8') : Buffer.alloc(0);
    var iconBuffer = icon ? Buffer.from(icon, 'utf8') : Buffer.alloc(0);
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
exports.getAssetDataForTransferIntoDappTransaction = function (_a) {
    var inTransfer = _a.inTransfer;
    exports.checkRequiredFields(['dappId'], inTransfer);
    var dappId = inTransfer.dappId;
    return Buffer.from(dappId, 'utf8');
};
exports.getAssetDataForTransferOutOfDappTransaction = function (_a) {
    var outTransfer = _a.outTransfer;
    exports.checkRequiredFields(['dappId', 'transactionId'], outTransfer);
    var dappId = outTransfer.dappId, transactionId = outTransfer.transactionId;
    var outAppIdBuffer = Buffer.from(dappId, 'utf8');
    var outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');
    return Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]);
};
var transactionTypeAssetGetBytesMap = {
    0: exports.getAssetDataForTransferTransaction,
    1: exports.getAssetDataForRegisterSecondSignatureTransaction,
    2: exports.getAssetDataForRegisterDelegateTransaction,
    3: exports.getAssetDataForCastVotesTransaction,
    4: exports.getAssetDataForRegisterMultisignatureAccountTransaction,
    5: exports.getAssetDataForCreateDappTransaction,
    6: exports.getAssetDataForTransferIntoDappTransaction,
    7: exports.getAssetDataForTransferOutOfDappTransaction,
};
exports.getAssetBytes = function (transaction) {
    return transactionTypeAssetGetBytesMap[transaction.type](transaction.asset);
};
var REQUIRED_TRANSACTION_PARAMETERS = [
    'type',
    'timestamp',
    'senderPublicKey',
    'amount',
];
exports.checkTransaction = function (transaction) {
    exports.checkRequiredFields(REQUIRED_TRANSACTION_PARAMETERS, transaction);
    var data = transaction.asset.data;
    if (data && data.length > constants_1.BYTESIZES.DATA) {
        throw new Error("Transaction asset data exceeds size of " + constants_1.BYTESIZES.DATA + ".");
    }
    return true;
};
exports.getTransactionBytes = function (transaction) {
    exports.checkTransaction(transaction);
    var type = transaction.type, timestamp = transaction.timestamp, senderPublicKey = transaction.senderPublicKey, recipientId = transaction.recipientId, amount = transaction.amount, signature = transaction.signature, signSignature = transaction.signSignature;
    var transactionType = Buffer.alloc(constants_1.BYTESIZES.TYPE, type);
    var transactionTimestamp = Buffer.alloc(constants_1.BYTESIZES.TIMESTAMP);
    transactionTimestamp.writeIntLE(timestamp, 0, constants_1.BYTESIZES.TIMESTAMP);
    var transactionSenderPublicKey = cryptography.hexToBuffer(senderPublicKey);
    var transactionRecipientID = recipientId
        ? cryptography.bigNumberToBuffer(recipientId.slice(0, -1), constants_1.BYTESIZES.RECIPIENT_ID)
        : Buffer.alloc(constants_1.BYTESIZES.RECIPIENT_ID);
    var amountBigNum = new BigNum(amount);
    if (amountBigNum.lt(0)) {
        throw new Error('Transaction amount must not be negative.');
    }
    if (amountBigNum.gt(new BigNum(constants_1.MAX_TRANSACTION_AMOUNT))) {
        throw new Error('Transaction amount is too large.');
    }
    var transactionAmount = amountBigNum.toBuffer({
        endian: 'little',
        size: constants_1.BYTESIZES.AMOUNT,
    });
    var transactionAssetData = exports.getAssetBytes(transaction);
    var transactionSignature = signature
        ? cryptography.hexToBuffer(signature)
        : Buffer.alloc(0);
    var transactionSecondSignature = signSignature
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