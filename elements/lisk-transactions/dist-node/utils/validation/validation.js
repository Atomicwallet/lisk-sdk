"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var BigNum = require("@liskhq/bignum");
var cryptography = require("@liskhq/lisk-cryptography");
var constants_1 = require("../../constants");
exports.validatePublicKey = function (publicKey) {
    var publicKeyBuffer = cryptography.hexToBuffer(publicKey);
    if (publicKeyBuffer.length !== constants_1.MAX_PUBLIC_KEY_LENGTH) {
        throw new Error("Public key " + publicKey + " length differs from the expected 32 bytes for a public key.");
    }
    return true;
};
exports.isNullByteIncluded = function (input) {
    return new RegExp('\\0|\\U00000000').test(input);
};
exports.validateUsername = function (username) {
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
exports.validateSignature = function (signature) {
    return /^[a-f0-9]{128}$/i.test(signature);
};
exports.checkPublicKeysForDuplicates = function (publicKeys) {
    return publicKeys.every(function (element, index) {
        if (publicKeys.slice(index + 1).includes(element)) {
            throw new Error("Duplicated public key: " + publicKeys[index] + ".");
        }
        return true;
    });
};
exports.stringEndsWith = function (target, suffixes) { return suffixes.some(function (suffix) { return target.endsWith(suffix); }); };
exports.validatePublicKeys = function (publicKeys) {
    return publicKeys.every(exports.validatePublicKey) &&
        exports.checkPublicKeysForDuplicates(publicKeys);
};
exports.validateKeysgroup = function (keysgroup) {
    if (keysgroup.length < constants_1.MULTISIGNATURE_MIN_KEYSGROUP ||
        keysgroup.length > constants_1.MULTISIGNATURE_MAX_KEYSGROUP) {
        throw new Error("Expected between " + constants_1.MULTISIGNATURE_MIN_KEYSGROUP + " and " + constants_1.MULTISIGNATURE_MAX_KEYSGROUP + " public keys in the keysgroup.");
    }
    return exports.validatePublicKeys(keysgroup);
};
var MIN_ADDRESS_LENGTH = 2;
var MAX_ADDRESS_LENGTH = 22;
var BASE_TEN = 10;
exports.validateAddress = function (address) {
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
    var addressString = address.slice(0, -1);
    var addressNumber = new BigNum(addressString);
    if (addressNumber.cmp(new BigNum(constants_1.MAX_ADDRESS_NUMBER)) > 0) {
        throw new Error('Address format does not match requirements. Address out of maximum range.');
    }
    if (addressString !== addressNumber.toString(BASE_TEN)) {
        throw new Error("Address string format does not match it's number representation.");
    }
    return true;
};
exports.isGreaterThanZero = function (amount) { return amount.cmp(0) > 0; };
exports.isGreaterThanMaxTransactionAmount = function (amount) {
    return amount.cmp(constants_1.MAX_TRANSACTION_AMOUNT) > 0;
};
exports.isGreaterThanMaxTransactionId = function (id) {
    return id.cmp(constants_1.MAX_TRANSACTION_ID) > 0;
};
exports.isNumberString = function (str) {
    if (typeof str !== 'string') {
        return false;
    }
    return /^[0-9]+$/g.test(str);
};
exports.validateNonTransferAmount = function (data) {
    return exports.isNumberString(data) && data === '0';
};
exports.validateTransferAmount = function (data) {
    return exports.isNumberString(data) &&
        exports.isGreaterThanZero(new BigNum(data)) &&
        !exports.isGreaterThanMaxTransactionAmount(new BigNum(data));
};
exports.isValidTransferData = function (data) {
    return Buffer.byteLength(data, 'utf8') <= constants_1.MAX_TRANSFER_ASSET_DATA_LENGTH;
};
exports.validateFee = function (data) {
    return exports.isNumberString(data) &&
        exports.isGreaterThanZero(new BigNum(data)) &&
        !exports.isGreaterThanMaxTransactionAmount(new BigNum(data));
};
exports.isValidInteger = function (num) {
    return typeof num === 'number' ? Math.floor(num) === num : false;
};
exports.isUnique = function (values) {
    var unique = __spread(new Set(values));
    return unique.length === values.length;
};
exports.isValidNumber = function (num) {
    if (typeof num === 'number') {
        return true;
    }
    if (typeof num === 'string') {
        return exports.isNumberString(num);
    }
    return false;
};
//# sourceMappingURL=validation.js.map