"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("./validation");
exports.hex = validation_1.isHexString;
exports.int64 = (data) => validation_1.isNumberString(data) && validation_1.isSInt64(BigInt(data));
exports.uint64 = (data) => validation_1.isNumberString(data) && validation_1.isUInt64(BigInt(data));
exports.uint32 = (data) => validation_1.isNumberString(data) && validation_1.isUInt32(Number(data));
exports.int32 = (data) => validation_1.isNumberString(data) && validation_1.isSInt32(Number(data));
const camelCaseRegex = /^[a-z]+((\d)|([A-Z0-9][a-zA-Z0-9]+))*([a-z0-9A-Z])?$/;
exports.camelCase = (data) => camelCaseRegex.exec(data) !== null;
exports.version = validation_1.isSemVer;
exports.networkVersion = (data) => /^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);
exports.path = (data) => /^(.?)(\/[^/]+)+(\/?)$/.test(data);
exports.encryptedPassphrase = validation_1.isEncryptedPassphrase;
exports.ip = validation_1.isIP;
exports.ipOrFQDN = (data) => {
    const hostnameRegex = /^[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?(\.[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?)*$/;
    return validation_1.isIPV4(data) || hostnameRegex.test(data);
};
exports.oddInteger = (data) => {
    if (typeof data === 'number') {
        return Number.isInteger(data) && data % 2 === 1;
    }
    return /^\d*[13579]$/.test(data);
};
//# sourceMappingURL=formats.js.map