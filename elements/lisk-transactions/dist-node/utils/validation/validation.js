"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidNumber = exports.isUnique = exports.isValidInteger = exports.validateFee = exports.isValidTransferData = exports.validateTransferAmount = exports.validateNonTransferAmount = exports.isNumberString = exports.isGreaterThanMaxTransactionId = exports.isGreaterThanMaxTransactionAmount = exports.isGreaterThanZero = exports.validateAddress = exports.validateKeysgroup = exports.validatePublicKeys = exports.stringEndsWith = exports.checkPublicKeysForDuplicates = exports.validateSignature = exports.validateUsername = exports.isNullByteIncluded = exports.validatePublicKey = void 0;
const bn_js_1 = require("bn.js");
const cryptography = require("../../../../lisk-cryptography");
const constants_1 = require("../../constants");
const validatePublicKey = (publicKey) => {
    const publicKeyBuffer = cryptography.hexToBuffer(publicKey);
    if (publicKeyBuffer.length !== constants_1.MAX_PUBLIC_KEY_LENGTH) {
        throw new Error(`Public key ${publicKey} length differs from the expected 32 bytes for a public key.`);
    }
    return true;
};
exports.validatePublicKey = validatePublicKey;
const isNullByteIncluded = (input) => new RegExp('\\0|\\U00000000').test(input);
exports.isNullByteIncluded = isNullByteIncluded;
const validateUsername = (username) => {
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
exports.validateUsername = validateUsername;
const validateSignature = (signature) => /^[a-f0-9]{128}$/i.test(signature);
exports.validateSignature = validateSignature;
const checkPublicKeysForDuplicates = (publicKeys) => publicKeys.every((element, index) => {
    if (publicKeys.slice(index + 1).includes(element)) {
        throw new Error(`Duplicated public key: ${publicKeys[index]}.`);
    }
    return true;
});
exports.checkPublicKeysForDuplicates = checkPublicKeysForDuplicates;
const stringEndsWith = (target, suffixes) => suffixes.some(suffix => target.endsWith(suffix));
exports.stringEndsWith = stringEndsWith;
const validatePublicKeys = (publicKeys) => publicKeys.every(exports.validatePublicKey) &&
    exports.checkPublicKeysForDuplicates(publicKeys);
exports.validatePublicKeys = validatePublicKeys;
const validateKeysgroup = (keysgroup) => {
    if (keysgroup.length < constants_1.MULTISIGNATURE_MIN_KEYSGROUP ||
        keysgroup.length > constants_1.MULTISIGNATURE_MAX_KEYSGROUP) {
        throw new Error(`Expected between ${constants_1.MULTISIGNATURE_MIN_KEYSGROUP} and ${constants_1.MULTISIGNATURE_MAX_KEYSGROUP} public keys in the keysgroup.`);
    }
    return exports.validatePublicKeys(keysgroup);
};
exports.validateKeysgroup = validateKeysgroup;
const MIN_ADDRESS_LENGTH = 2;
const MAX_ADDRESS_LENGTH = 22;
const BASE_TEN = 10;
const validateAddress = (address) => {
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
    const addressNumber = new bn_js_1.default(addressString);
    if (addressNumber.gt(new bn_js_1.default(constants_1.MAX_ADDRESS_NUMBER))) {
        throw new Error('Address format does not match requirements. Address out of maximum range.');
    }
    if (addressString !== addressNumber.toString(BASE_TEN)) {
        throw new Error("Address string format does not match it's number representation.");
    }
    return true;
};
exports.validateAddress = validateAddress;
const isGreaterThanZero = (amount) => amount.cmp(0) > 0;
exports.isGreaterThanZero = isGreaterThanZero;
const isGreaterThanMaxTransactionAmount = (amount) => amount.gt(new bn_js_1.default(constants_1.MAX_TRANSACTION_AMOUNT));
exports.isGreaterThanMaxTransactionAmount = isGreaterThanMaxTransactionAmount;
const isGreaterThanMaxTransactionId = (id) => id.gt(new bn_js_1.default(constants_1.MAX_TRANSACTION_ID));
exports.isGreaterThanMaxTransactionId = isGreaterThanMaxTransactionId;
const isNumberString = (str) => {
    if (typeof str !== 'string') {
        return false;
    }
    return /^[0-9]+$/g.test(str);
};
exports.isNumberString = isNumberString;
const validateNonTransferAmount = (data) => exports.isNumberString(data) && data === '0';
exports.validateNonTransferAmount = validateNonTransferAmount;
const validateTransferAmount = (data) => exports.isNumberString(data) &&
    exports.isGreaterThanZero(new bn_js_1.default(data)) &&
    !exports.isGreaterThanMaxTransactionAmount(new bn_js_1.default(data));
exports.validateTransferAmount = validateTransferAmount;
const isValidTransferData = (data) => Buffer.byteLength(data, 'utf8') <= constants_1.MAX_TRANSFER_ASSET_DATA_LENGTH;
exports.isValidTransferData = isValidTransferData;
const validateFee = (data) => exports.isNumberString(data) &&
    exports.isGreaterThanZero(new bn_js_1.default(data)) &&
    !exports.isGreaterThanMaxTransactionAmount(new bn_js_1.default(data));
exports.validateFee = validateFee;
const isValidInteger = (num) => typeof num === 'number' ? Math.floor(num) === num : false;
exports.isValidInteger = isValidInteger;
const isUnique = (values) => {
    const unique = [...new Set(values)];
    return unique.length === values.length;
};
exports.isUnique = isUnique;
const isValidNumber = (num) => {
    if (typeof num === 'number') {
        return true;
    }
    if (typeof num === 'string') {
        return exports.isNumberString(num);
    }
    return false;
};
exports.isValidNumber = isValidNumber;
//# sourceMappingURL=validation.js.map