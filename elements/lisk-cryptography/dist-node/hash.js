"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkIdentifier = exports.hash = void 0;
const crypto = require("crypto");
const buffer_1 = require("./buffer");
const cryptoHashSha256 = (data) => {
    const dataHash = crypto.createHash('sha256');
    dataHash.update(data);
    return dataHash.digest();
};
const hash = (data, format) => {
    if (Buffer.isBuffer(data)) {
        return cryptoHashSha256(data);
    }
    if (typeof data === 'string' && typeof format === 'string') {
        if (!['utf8', 'hex'].includes(format)) {
            throw new Error('Unsupported string format. Currently only `hex` and `utf8` are supported.');
        }
        const encoded = format === 'utf8' ? Buffer.from(data, 'utf8') : buffer_1.hexToBuffer(data);
        return cryptoHashSha256(encoded);
    }
    throw new Error(`Unsupported data:${data} and format:${format !== null && format !== void 0 ? format : 'undefined'}. Currently only Buffers or hex and utf8 strings are supported.`);
};
exports.hash = hash;
const getNetworkIdentifier = (genesisBlockID, communityIdentifier) => exports.hash(Buffer.concat([genesisBlockID, Buffer.from(communityIdentifier, 'utf8')]));
exports.getNetworkIdentifier = getNetworkIdentifier;
//# sourceMappingURL=hash.js.map