"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegacyAddressFromPrivateKey = exports.getLegacyAddressFromPassphrase = exports.getLegacyAddressAndPublicKeyFromPassphrase = exports.getLegacyAddressFromPublicKey = void 0;
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const convert_1 = require("./convert");
const nacl_1 = require("./nacl");

if (typeof Buffer.readBigUInt64BE === 'undefined') {
	Buffer.prototype.readBigUInt64BE = function readBigUInt64LE (offset) {
		offset = offset >>> 0
		const first = this[offset]
		const last = this[offset + 7]
		if (first === undefined || last === undefined) {
			throw new Error('some er')
		}

		const lo = first +
			this[++offset] * 2 ** 8 +
			this[++offset] * 2 ** 16 +
			this[++offset] * 2 ** 24

		const hi = this[++offset] +
			this[++offset] * 2 ** 8 +
			this[++offset] * 2 ** 16 +
			last * 2 ** 24

		return BigInt(lo) + (BigInt(hi) << BigInt(32))
	}
}

const getLegacyAddressFromPublicKey = (publicKey) => {
    const publicKeyHash = hash_1.hash(publicKey);
    const publicKeyTransform = convert_1.getFirstEightBytesReversed(publicKeyHash);
    return `${publicKeyTransform.readBigUInt64BE().toString()}L`;
};
exports.getLegacyAddressFromPublicKey = getLegacyAddressFromPublicKey;
const getLegacyAddressAndPublicKeyFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    const address = exports.getLegacyAddressFromPublicKey(publicKey);
    return {
        address,
        publicKey,
    };
};
exports.getLegacyAddressAndPublicKeyFromPassphrase = getLegacyAddressAndPublicKeyFromPassphrase;
const getLegacyAddressFromPassphrase = (passphrase) => {
    const { publicKey } = keys_1.getKeys(passphrase);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
exports.getLegacyAddressFromPassphrase = getLegacyAddressFromPassphrase;
const getLegacyAddressFromPrivateKey = (privateKey) => {
    const publicKey = nacl_1.getPublicKey(privateKey);
    return exports.getLegacyAddressFromPublicKey(publicKey);
};
exports.getLegacyAddressFromPrivateKey = getLegacyAddressFromPrivateKey;
//# sourceMappingURL=legacy_address.js.map
