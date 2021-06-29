"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWeightedAggSig = exports.verifyAggSig = exports.createAggSig = exports.verifyBLS = exports.signBLS = exports.validateKey = exports.getPublicKeyFromPrivateKey = exports.generatePrivateKey = exports.BLS_SUPPORTED = void 0;
const bls_lib_1 = require("./bls_lib");
Object.defineProperty(exports, "BLS_SUPPORTED", { enumerable: true, get: function () { return bls_lib_1.BLS_SUPPORTED; } });
const message_tag_1 = require("./message_tag");
const utils_1 = require("./utils");
exports.generatePrivateKey = bls_lib_1.blsKeyGen;
exports.getPublicKeyFromPrivateKey = bls_lib_1.blsSkToPk;
exports.validateKey = bls_lib_1.blsKeyValidate;
const signBLS = (tag, networkIdentifier, data, privateKey) => bls_lib_1.blsSign(privateKey, message_tag_1.tagMessage(tag, networkIdentifier, data));
exports.signBLS = signBLS;
const verifyBLS = (tag, networkIdentifier, data, signature, publicKey) => bls_lib_1.blsVerify(publicKey, message_tag_1.tagMessage(tag, networkIdentifier, data), signature);
exports.verifyBLS = verifyBLS;
const createAggSig = (publicKeysList, pubKeySignaturePairs) => {
    const aggregationBits = Buffer.alloc(Math.ceil(publicKeysList.length / 8));
    const signatures = [];
    for (const pair of pubKeySignaturePairs) {
        signatures.push(pair.signature);
        const index = publicKeysList.findIndex(key => key.equals(pair.publicKey));
        utils_1.writeBit(aggregationBits, index, true);
    }
    const signature = bls_lib_1.blsAggregate(signatures);
    if (!signature) {
        throw new Error('Can not aggregate signatures');
    }
    return { aggregationBits, signature };
};
exports.createAggSig = createAggSig;
const verifyAggSig = (publicKeysList, aggregationBits, signature, tag, networkIdentifier, message) => {
    const taggedMessage = message_tag_1.tagMessage(tag, networkIdentifier, message);
    const keys = [];
    for (const [index, key] of publicKeysList.entries()) {
        if (utils_1.readBit(aggregationBits, index)) {
            keys.push(key);
        }
    }
    return bls_lib_1.blsFastAggregateVerify(keys, taggedMessage, signature);
};
exports.verifyAggSig = verifyAggSig;
const verifyWeightedAggSig = (publicKeysList, aggregationBits, signature, tag, networkIdentifier, message, weights, threshold) => {
    const taggedMessage = message_tag_1.tagMessage(tag, networkIdentifier, message);
    const keys = [];
    let weightSum = 0;
    for (const [index, key] of publicKeysList.entries()) {
        if (utils_1.readBit(aggregationBits, index)) {
            keys.push(key);
            weightSum += weights[index];
        }
    }
    if (weightSum < threshold) {
        return false;
    }
    return bls_lib_1.blsFastAggregateVerify(keys, taggedMessage, signature);
};
exports.verifyWeightedAggSig = verifyWeightedAggSig;
//# sourceMappingURL=bls.js.map