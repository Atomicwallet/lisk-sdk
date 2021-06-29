"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCsv = exports.isVersionMatch = exports.isStringEndsWith = exports.isPort = exports.isIP = exports.isIPV6 = exports.isIPV4 = exports.isProtocolString = exports.isGreaterThanRangedVersion = exports.isLessThanRangedVersion = exports.isRangedSemVer = exports.isSemVer = exports.isEncryptedPassphrase = exports.isHexString = exports.isValidInteger = exports.isBytes = exports.isUInt64 = exports.isSInt64 = exports.isUInt32 = exports.isSInt32 = exports.isBoolean = exports.isString = exports.isNumberString = void 0;
const semver_1 = require("semver");
const validator_1 = require("validator");
const constants_1 = require("./constants");
const isNumberString = (num) => {
    if (typeof num !== 'string') {
        return false;
    }
    return validator_1.default.isInt(num);
};
exports.isNumberString = isNumberString;
const isString = (data) => typeof data === 'string';
exports.isString = isString;
const isBoolean = (data) => typeof data === 'boolean';
exports.isBoolean = isBoolean;
const isSInt32 = (data) => {
    if (typeof data === 'number' && Number.isInteger(data)) {
        return data <= constants_1.MAX_SINT32 && data >= constants_1.MIN_SINT32;
    }
    return false;
};
exports.isSInt32 = isSInt32;
const isUInt32 = (data) => {
    if (typeof data === 'number' && Number.isInteger(data)) {
        return data <= constants_1.MAX_UINT32 && data >= 0;
    }
    return false;
};
exports.isUInt32 = isUInt32;
const isSInt64 = (data) => typeof data === 'bigint' ? data <= constants_1.MAX_SINT64 && data >= constants_1.MIN_SINT64 : false;
exports.isSInt64 = isSInt64;
const isUInt64 = (data) => typeof data === 'bigint' ? data <= constants_1.MAX_UINT64 && data >= BigInt(0) : false;
exports.isUInt64 = isUInt64;
const isBytes = (data) => Buffer.isBuffer(data);
exports.isBytes = isBytes;
const isValidInteger = (num) => typeof num === 'number' ? Math.floor(num) === num : false;
exports.isValidInteger = isValidInteger;
const isHexString = (data) => {
    if (typeof data !== 'string') {
        return false;
    }
    return data === '' || /^[a-f0-9]+$/i.test(data);
};
exports.isHexString = isHexString;
const isEncryptedPassphrase = (data) => {
    const keyRegExp = /[a-zA-Z0-9]{2,15}/;
    const valueRegExp = /[a-f0-9]{1,512}/;
    const keyValueRegExp = new RegExp(`${keyRegExp.source}=${valueRegExp.source}`);
    const encryptedPassphraseRegExp = new RegExp(`^(${keyValueRegExp.source})(?:&(${keyValueRegExp.source})){0,10}$`);
    return encryptedPassphraseRegExp.test(data);
};
exports.isEncryptedPassphrase = isEncryptedPassphrase;
const isSemVer = (version) => !!semver_1.valid(version);
exports.isSemVer = isSemVer;
const isRangedSemVer = (version) => !!semver_1.validRange(version);
exports.isRangedSemVer = isRangedSemVer;
exports.isLessThanRangedVersion = semver_1.ltr;
exports.isGreaterThanRangedVersion = semver_1.gtr;
const isProtocolString = (data) => /^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);
exports.isProtocolString = isProtocolString;
const IPV4_NUMBER = '4';
const IPV6_NUMBER = '6';
const isIPV4 = (data) => validator_1.default.isIP(data, IPV4_NUMBER);
exports.isIPV4 = isIPV4;
const isIPV6 = (data) => validator_1.default.isIP(data, IPV6_NUMBER);
exports.isIPV6 = isIPV6;
const isIP = (data) => exports.isIPV4(data) || exports.isIPV6(data);
exports.isIP = isIP;
const isPort = (port) => validator_1.default.isPort(port);
exports.isPort = isPort;
const isStringEndsWith = (target, suffixes) => suffixes.some(suffix => target.endsWith(suffix));
exports.isStringEndsWith = isStringEndsWith;
exports.isVersionMatch = semver_1.gte;
const isCsv = (data) => {
    if (typeof data !== 'string') {
        return false;
    }
    const csvAsArray = data.split(',');
    if (csvAsArray.length > 0) {
        return true;
    }
    return false;
};
exports.isCsv = isCsv;
//# sourceMappingURL=validation.js.map