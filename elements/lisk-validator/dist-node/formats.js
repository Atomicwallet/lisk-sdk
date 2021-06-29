"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddInteger = exports.ipOrFQDN = exports.ip = exports.encryptedPassphrase = exports.path = exports.networkVersion = exports.version = exports.camelCase = exports.int32 = exports.uint32 = exports.uint64 = exports.int64 = exports.bytes = exports.hex = void 0;
const validation_1 = require("./validation");
exports.hex = validation_1.isHexString;
exports.bytes = validation_1.isBytes;
const int64 = (data) => validation_1.isNumberString(data) && validation_1.isSInt64(BigInt(data));
exports.int64 = int64;
const uint64 = (data) => validation_1.isNumberString(data) && validation_1.isUInt64(BigInt(data));
exports.uint64 = uint64;
const uint32 = (data) => validation_1.isNumberString(data) && validation_1.isUInt32(Number(data));
exports.uint32 = uint32;
const int32 = (data) => validation_1.isNumberString(data) && validation_1.isSInt32(Number(data));
exports.int32 = int32;
const camelCaseRegex = /^[a-z]+((\d)|([A-Z0-9][a-zA-Z0-9]+))*([a-z0-9A-Z])?$/;
const camelCase = (data) => camelCaseRegex.exec(data) !== null;
exports.camelCase = camelCase;
exports.version = validation_1.isSemVer;
const networkVersion = (data) => /^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);
exports.networkVersion = networkVersion;
const path = (data) => /^(.?)(\/[^/]+)+(\/?)$/.test(data);
exports.path = path;
exports.encryptedPassphrase = validation_1.isEncryptedPassphrase;
exports.ip = validation_1.isIP;
const ipOrFQDN = (data) => {
    const hostnameRegex = /^[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?(\.[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?)*$/;
    return validation_1.isIPV4(data) || hostnameRegex.test(data);
};
exports.ipOrFQDN = ipOrFQDN;
const oddInteger = (data) => {
    if (typeof data === 'number') {
        return Number.isInteger(data) && data % 2 === 1;
    }
    return /^\d*[13579]$/.test(data);
};
exports.oddInteger = oddInteger;
//# sourceMappingURL=formats.js.map