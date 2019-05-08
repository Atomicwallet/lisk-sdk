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
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var semver_1 = require("semver");
var validator = require("validator");
var constants_1 = require("./constants");
exports.isNullCharacterIncluded = function (input) {
    return new RegExp('\\0|\\U00000000').test(input);
};
exports.isUsername = function (username) {
    if (exports.isNullCharacterIncluded(username)) {
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
exports.isSignature = function (signature) {
    return /^[a-f0-9]{128}$/i.test(signature);
};
exports.isGreaterThanZero = function (amount) { return amount.cmp(0) > 0; };
exports.isGreaterThanMaxTransactionAmount = function (amount) {
    return amount.cmp(constants_1.MAX_INT64) > 0;
};
exports.isGreaterThanMaxTransactionId = function (id) {
    return id.cmp(constants_1.MAX_EIGHT_BYTE_NUMBER) > 0;
};
exports.isNumberString = function (num) {
    if (typeof num !== 'string') {
        return false;
    }
    return validator.isInt(num);
};
exports.isValidInteger = function (num) {
    return typeof num === 'number' ? Math.floor(num) === num : false;
};
exports.hasNoDuplicate = function (values) {
    var unique = __spread(new Set(values));
    return unique.length === values.length;
};
exports.isStringBufferLessThan = function (data, max) {
    if (typeof data !== 'string') {
        return false;
    }
    return Buffer.from(data).length <= max;
};
exports.isHexString = function (data) {
    if (typeof data !== 'string') {
        return false;
    }
    return data === '' || /^[a-f0-9]+$/i.test(data);
};
exports.isEncryptedPassphrase = function (data) {
    var keyRegExp = /[a-zA-Z0-9]{2,15}/;
    var valueRegExp = /[a-f0-9]{1,256}/;
    var keyValueRegExp = new RegExp(keyRegExp.source + "=" + valueRegExp.source);
    var encryptedPassphraseRegExp = new RegExp("^(" + keyValueRegExp.source + ")(?:&(" + keyValueRegExp.source + ")){0,10}$");
    return encryptedPassphraseRegExp.test(data);
};
exports.isSemVer = function (version) { return !!semver_1.valid(version); };
exports.isRangedSemVer = function (version) {
    return !!semver_1.validRange(version);
};
exports.isLessThanRangedVersion = semver_1.ltr;
exports.isGreaterThanRangedVersion = semver_1.gtr;
exports.isProtocolString = function (data) {
    return /^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);
};
var IPV4_NUMBER = 4;
var IPV6_NUMBER = 6;
exports.isIPV4 = function (data) {
    return validator.isIP(data, IPV4_NUMBER);
};
exports.isIPV6 = function (data) {
    return validator.isIP(data, IPV6_NUMBER);
};
exports.isIP = function (data) { return exports.isIPV4(data) || exports.isIPV6(data); };
exports.isPort = function (port) { return validator.isPort(port); };
exports.validatePublicKeysForDuplicates = function (publicKeys) {
    return publicKeys.every(function (element, index) {
        if (publicKeys.slice(index + 1).includes(element)) {
            throw new Error("Duplicated public key: " + publicKeys[index] + ".");
        }
        return true;
    });
};
exports.isStringEndsWith = function (target, suffixes) { return suffixes.some(function (suffix) { return target.endsWith(suffix); }); };
exports.isVersionMatch = semver_1.gte;
exports.validatePublicKey = function (publicKey) {
    var publicKeyBuffer = lisk_cryptography_1.hexToBuffer(publicKey);
    if (publicKeyBuffer.length !== constants_1.MAX_PUBLIC_KEY_LENGTH) {
        throw new Error("Public key " + publicKey + " length differs from the expected 32 bytes for a public key.");
    }
    return true;
};
exports.validatePublicKeys = function (publicKeys) {
    return publicKeys.every(exports.validatePublicKey) &&
        exports.validatePublicKeysForDuplicates(publicKeys);
};
exports.validateKeysgroup = function (keysgroup, min, max) {
    if (keysgroup.length < min || keysgroup.length > max) {
        throw new Error("Expected between " + min + " and " + max + " public keys in the keysgroup.");
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
    if (addressNumber.cmp(new BigNum(constants_1.MAX_EIGHT_BYTE_NUMBER)) > 0) {
        throw new Error('Address format does not match requirements. Address out of maximum range.');
    }
    if (addressString !== addressNumber.toString(BASE_TEN)) {
        throw new Error("Address string format does not match it's number representation.");
    }
    return true;
};
exports.validateNonTransferAmount = function (data) {
    return exports.isNumberString(data) && data === '0';
};
exports.validateTransferAmount = function (data) {
    return exports.isNumberString(data) &&
        exports.isGreaterThanZero(new BigNum(data)) &&
        !exports.isGreaterThanMaxTransactionAmount(new BigNum(data));
};
exports.validateFee = function (data) {
    return exports.isNumberString(data) &&
        exports.isGreaterThanZero(new BigNum(data)) &&
        !exports.isGreaterThanMaxTransactionAmount(new BigNum(data));
};
//# sourceMappingURL=validation.js.map