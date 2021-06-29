"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBase32AddressFromAddress = exports.getLisk32AddressFromAddress = exports.getAddressFromBase32Address = exports.getAddressFromLisk32Address = exports.validateBase32Address = exports.validateLisk32Address = exports.getBase32AddressFromPassphrase = exports.getLisk32AddressFromPassphrase = exports.getBase32AddressFromPublicKey = exports.getLisk32AddressFromPublicKey = exports.verifyChecksum = exports.createChecksum = exports.getAddressFromPrivateKey = exports.getAddressFromPassphrase = exports.getAddressAndPublicKeyFromPassphrase = exports.getAddressFromPublicKey = exports.getKeys = exports.getPrivateAndPublicKeyFromPassphrase = void 0;
const constants_1 = require("./constants");
const convert_1 = require("./convert");
const hash_1 = require("./hash");
const nacl_1 = require("./nacl");
const getPrivateAndPublicKeyFromPassphrase = (passphrase) => {
    const hashed = hash_1.hash(passphrase, 'utf8');
    return nacl_1.getKeyPair(hashed);
};
exports.getPrivateAndPublicKeyFromPassphrase = getPrivateAndPublicKeyFromPassphrase;
exports.getKeys = exports.getPrivateAndPublicKeyFromPassphrase;
const getAddressFromPublicKey = (publicKey) => {
    const buffer = hash_1.hash(publicKey);
    const truncatedBuffer = buffer.slice(0, constants_1.BINARY_ADDRESS_LENGTH);
    if (truncatedBuffer.length !== constants_1.BINARY_ADDRESS_LENGTH) {
        throw new Error('The Lisk addresses must contains exactly 20 bytes');
    }
    return truncatedBuffer;
};
exports.getAddressFromPublicKey = getAddressFromPublicKey;
const getAddressAndPublicKeyFromPassphrase = (passphrase) => {
    const { publicKey } = exports.getKeys(passphrase);
    const address = exports.getAddressFromPublicKey(publicKey);
    return {
        address,
        publicKey,
    };
};
exports.getAddressAndPublicKeyFromPassphrase = getAddressAndPublicKeyFromPassphrase;
const getAddressFromPassphrase = (passphrase) => {
    const { publicKey } = exports.getKeys(passphrase);
    return exports.getAddressFromPublicKey(publicKey);
};
exports.getAddressFromPassphrase = getAddressFromPassphrase;
const getAddressFromPrivateKey = (privateKey) => {
    const publicKey = nacl_1.getPublicKey(privateKey);
    return exports.getAddressFromPublicKey(publicKey);
};
exports.getAddressFromPrivateKey = getAddressFromPrivateKey;
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const polymod = (uint5Array) => {
    let chk = 1;
    for (const value of uint5Array) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ value;
        for (let i = 0; i < 5; i += 1) {
            if ((top >> i) & 1) {
                chk ^= GENERATOR[i];
            }
        }
    }
    return chk;
};
const createChecksum = (uint5Array) => {
    const values = uint5Array.concat([0, 0, 0, 0, 0, 0]);
    const mod = polymod(values) ^ 1;
    const result = [];
    for (let p = 0; p < 6; p += 1) {
        result.push((mod >> (5 * (5 - p))) & 31);
    }
    return result;
};
exports.createChecksum = createChecksum;
const verifyChecksum = (integerSequence) => polymod(integerSequence) === 1;
exports.verifyChecksum = verifyChecksum;
const addressToLisk32 = (address) => {
    const byteSequence = [];
    for (const b of address) {
        byteSequence.push(b);
    }
    const uint5Address = convert_1.convertUIntArray(byteSequence, 8, 5);
    const uint5Checksum = exports.createChecksum(uint5Address);
    return convert_1.convertUInt5ToBase32(uint5Address.concat(uint5Checksum));
};
const getLisk32AddressFromPublicKey = (publicKey, prefix = constants_1.DEFAULT_LISK32_ADDRESS_PREFIX) => `${prefix}${addressToLisk32(exports.getAddressFromPublicKey(publicKey))}`;
exports.getLisk32AddressFromPublicKey = getLisk32AddressFromPublicKey;
exports.getBase32AddressFromPublicKey = exports.getLisk32AddressFromPublicKey;
const getLisk32AddressFromPassphrase = (passphrase, prefix = constants_1.DEFAULT_LISK32_ADDRESS_PREFIX) => {
    const { publicKey } = exports.getAddressAndPublicKeyFromPassphrase(passphrase);
    return exports.getLisk32AddressFromPublicKey(publicKey, prefix);
};
exports.getLisk32AddressFromPassphrase = getLisk32AddressFromPassphrase;
exports.getBase32AddressFromPassphrase = exports.getLisk32AddressFromPassphrase;
const LISK32_ADDRESS_LENGTH = 41;
const LISK32_CHARSET = 'zxvcpmbn3465o978uyrtkqew2adsjhfg';
const validateLisk32Address = (address, prefix = constants_1.DEFAULT_LISK32_ADDRESS_PREFIX) => {
    if (address.length !== LISK32_ADDRESS_LENGTH) {
        throw new Error('Address length does not match requirements. Expected 41 characters.');
    }
    const addressPrefix = address.substring(0, 3);
    if (addressPrefix !== prefix) {
        throw new Error(`Invalid address prefix. Actual prefix: ${addressPrefix}, Expected prefix: ${prefix}`);
    }
    const addressSubstringArray = address.substring(3).split('');
    if (!addressSubstringArray.every(char => LISK32_CHARSET.includes(char))) {
        throw new Error("Invalid character found in address. Only allow characters: 'abcdefghjkmnopqrstuvwxyz23456789'.");
    }
    const integerSequence = addressSubstringArray.map(char => LISK32_CHARSET.indexOf(char));
    if (!exports.verifyChecksum(integerSequence)) {
        throw new Error('Invalid checksum for address.');
    }
    return true;
};
exports.validateLisk32Address = validateLisk32Address;
exports.validateBase32Address = exports.validateLisk32Address;
const getAddressFromLisk32Address = (base32Address, prefix = constants_1.DEFAULT_LISK32_ADDRESS_PREFIX) => {
    exports.validateLisk32Address(base32Address, prefix);
    const base32AddressNoPrefixNoChecksum = base32Address.substring(prefix.length, base32Address.length - 6);
    const addressArray = base32AddressNoPrefixNoChecksum.split('');
    const integerSequence = addressArray.map(char => LISK32_CHARSET.indexOf(char));
    const integerSequence8 = convert_1.convertUIntArray(integerSequence, 5, 8);
    return Buffer.from(integerSequence8);
};
exports.getAddressFromLisk32Address = getAddressFromLisk32Address;
exports.getAddressFromBase32Address = exports.getAddressFromLisk32Address;
const getLisk32AddressFromAddress = (address, prefix = constants_1.DEFAULT_LISK32_ADDRESS_PREFIX) => `${prefix}${addressToLisk32(address)}`;
exports.getLisk32AddressFromAddress = getLisk32AddressFromAddress;
exports.getBase32AddressFromAddress = exports.getLisk32AddressFromAddress;
//# sourceMappingURL=keys.js.map