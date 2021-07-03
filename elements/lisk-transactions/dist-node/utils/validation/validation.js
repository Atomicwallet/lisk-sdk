"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("@liskhq/bignum");
const cryptography = require("../../../../lisk-cryptography");
const constants_1 = require("../../constants");
exports.validatePublicKey = (publicKey) => {
    const publicKeyBuffer = cryptography.hexToBuffer(publicKey);
    if (publicKeyBuffer.length !== constants_1.MAX_PUBLIC_KEY_LENGTH) {
        throw new Error(`Public key ${publicKey} length differs from the expected 32 bytes for a public key.`);
    }
    return true;
};
exports.isNullByteIncluded = (input) => new RegExp('\\0|\\U00000000').test(input);
exports.validateUsername = (username) => {
    if (exports.isNullByteIncluded(username)) {
        return false;
    }
    if (username !== username.trim().toLowerCase()) {
        return false;
    }
    if (/^[0-9]{1,21}[L|l]$/g.test(username)) {
        return false;
    }
    if (!/^[a-z0-9!@$&_.]+$/g.test(username)) {
        return false;
    }
    return true;
};
exports.validateSignature = (signature) => /^[a-f0-9]{128}$/i.test(signature);
exports.checkPublicKeysForDuplicates = (publicKeys) => publicKeys.every((element, index) => {
    if (publicKeys.slice(index + 1).includes(element)) {
        throw new Error(`Duplicated public key: ${publicKeys[index]}.`);
    }
    return true;
});
exports.stringEndsWith = (target, suffixes) => suffixes.some(suffix => target.endsWith(suffix));
exports.validatePublicKeys = (publicKeys) => publicKeys.every(exports.validatePublicKey) &&
    exports.checkPublicKeysForDuplicates(publicKeys);
exports.validateKeysgroup = (keysgroup) => {
    if (keysgroup.length < constants_1.MULTISIGNATURE_MIN_KEYSGROUP ||
        keysgroup.length > constants_1.MULTISIGNATURE_MAX_KEYSGROUP) {
        throw new Error(`Expected between ${constants_1.MULTISIGNATURE_MIN_KEYSGROUP} and ${constants_1.MULTISIGNATURE_MAX_KEYSGROUP} public keys in the keysgroup.`);
    }
    return exports.validatePublicKeys(keysgroup);
};
const MIN_ADDRESS_LENGTH = 2;
const MAX_ADDRESS_LENGTH = 22;
const BASE_TEN = 10;
exports.validateAddress = (address) => {
    if (address.length < MIN_ADDRESS_LENGTH ||
        address.length > MAX_ADDRESS_LENGTH) {
        throw new Error('Address length does not match requirements. Expected between 2 and 22 characters.');
    }
    if (address[address.length - 1] !== 'L') {
        throw new Error('Address format does not match requirements. Expected "L" at the end.');
    }
    if (address.includes('.')) {
        throw new Error('Address format does not match requirements. Address includes invalid character: `.`.');
    }
    const addressString = address.slice(0, -1);
    const addressNumber = new BN(addressString);
    if (addressNumber.gt(new BN(constants_1.MAX_ADDRESS_NUMBER))) {
        throw new Error('Address format does not match requirements. Address out of maximum range.');
    }
    if (addressString !== addressNumber.toString(BASE_TEN)) {
        throw new Error("Address string format does not match it's number representation.");
    }
    return true;
};
exports.isGreaterThanZero = (amount) => amount.cmp(0) > 0;
exports.isGreaterThanMaxTransactionAmount = (amount) => amount.gt(new BN(constants_1.MAX_TRANSACTION_AMOUNT));
exports.isGreaterThanMaxTransactionId = (id) => id.gt(new BN(constants_1.MAX_TRANSACTION_ID));
exports.isNumberString = (str) => {
    if (typeof str !== 'string') {
        return false;
    }
    return /^[0-9]+$/g.test(str);
};
exports.validateNonTransferAmount = (data) => exports.isNumberString(data) && data === '0';
exports.validateTransferAmount = (data) => exports.isNumberString(data) &&
    exports.isGreaterThanZero(new BN(data)) &&
    !exports.isGreaterThanMaxTransactionAmount(new BN(data));
exports.isValidTransferData = (data) => Buffer.byteLength(data, 'utf8') <= constants_1.MAX_TRANSFER_ASSET_DATA_LENGTH;
exports.validateFee = (data) => exports.isNumberString(data) &&
    exports.isGreaterThanZero(new BN(data)) &&
    !exports.isGreaterThanMaxTransactionAmount(new BN(data));
exports.isValidInteger = (num) => typeof num === 'number' ? Math.floor(num) === num : false;
exports.isUnique = (values) => {
    const unique = [...new Set(values)];
    return unique.length === values.length;
};
exports.isValidNumber = (num) => {
    if (typeof num === 'number') {
        return true;
    }
    if (typeof num === 'string') {
        return exports.isNumberString(num);
    }
    return false;
};
//# sourceMappingURL=validation.js.map