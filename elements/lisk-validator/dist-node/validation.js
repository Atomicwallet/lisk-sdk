"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const validator_1 = require("validator");
const constants_1 = require("./constants");
exports.isNumberString = (num) => {
    if (typeof num !== 'string') {
        return false;
    }
    return validator_1.default.isInt(num);
};
exports.isValidInteger = (num) => typeof num === 'number' ? Math.floor(num) === num : false;
exports.isHexString = (data) => {
    if (typeof data !== 'string') {
        return false;
    }
    return data === '' || /^[a-f0-9]+$/i.test(data);
};
exports.isEncryptedPassphrase = (data) => {
    const keyRegExp = /[a-zA-Z0-9]{2,15}/;
    const valueRegExp = /[a-f0-9]{1,512}/;
    const keyValueRegExp = new RegExp(`${keyRegExp.source}=${valueRegExp.source}`);
    const encryptedPassphraseRegExp = new RegExp(`^(${keyValueRegExp.source})(?:&(${keyValueRegExp.source})){0,10}$`);
    return encryptedPassphraseRegExp.test(data);
};
exports.isSemVer = (version) => !!semver_1.valid(version);
exports.isRangedSemVer = (version) => !!semver_1.validRange(version);
exports.isLessThanRangedVersion = semver_1.ltr;
exports.isGreaterThanRangedVersion = semver_1.gtr;
exports.isProtocolString = (data) => /^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);
const IPV4_NUMBER = '4';
const IPV6_NUMBER = '6';
exports.isIPV4 = (data) => validator_1.default.isIP(data, IPV4_NUMBER);
exports.isIPV6 = (data) => validator_1.default.isIP(data, IPV6_NUMBER);
exports.isIP = (data) => exports.isIPV4(data) || exports.isIPV6(data);
exports.isPort = (port) => validator_1.default.isPort(port);
exports.isStringEndsWith = (target, suffixes) => suffixes.some(suffix => target.endsWith(suffix));
exports.isVersionMatch = semver_1.gte;
exports.isCsv = (data) => {
    if (typeof data !== 'string') {
        return false;
    }
    const csvAsArray = data.split(',');
    if (csvAsArray.length > 0) {
        return true;
    }
    return false;
};
exports.isString = (data) => typeof data === 'string';
exports.isBoolean = (data) => typeof data === 'boolean';
exports.isSInt32 = (data) => {
    if (typeof data === 'number' && Number.isInteger(data)) {
        return data <= constants_1.MAX_SINT32 && data >= constants_1.MIN_SINT32;
    }
    return false;
};
exports.isUInt32 = (data) => {
    if (typeof data === 'number' && Number.isInteger(data)) {
        return data <= constants_1.MAX_UINT32 && data >= 0;
    }
    return false;
};
exports.isSInt64 = (data) => typeof data === 'bigint' ? data <= constants_1.MAX_SINT64 && data >= constants_1.MIN_SINT64 : false;
exports.isUInt64 = (data) => typeof data === 'bigint' ? data <= constants_1.MAX_UINT64 && data >= BigInt(0) : false;
exports.isBytes = (data) => Buffer.isBuffer(data);
//# sourceMappingURL=validation.js.map