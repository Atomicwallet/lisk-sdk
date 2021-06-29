"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blsPopVerify = exports.blsPopProve = exports.blsFastAggregateVerify = exports.blsAggregateVerify = exports.blsVerify = exports.blsSign = exports.blsAggregate = exports.blsSkToPk = exports.blsKeyGen = exports.blsKeyValidate = void 0;
const blst_1 = require("@chainsafe/blst");
const bindings_1 = require("@chainsafe/blst/dist/bindings");
const DST_POP = 'BLS_POP_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_';
const blsKeyValidate = (pk) => {
    try {
        const key = blst_1.PublicKey.fromBytes(pk);
        key.keyValidate();
        return true;
    }
    catch {
        return false;
    }
};
exports.blsKeyValidate = blsKeyValidate;
const blsKeyGen = (ikm) => Buffer.from(blst_1.SecretKey.fromKeygen(ikm).toBytes());
exports.blsKeyGen = blsKeyGen;
const blsSkToPk = (sk) => Buffer.from(blst_1.SecretKey.fromBytes(sk).toPublicKey().toBytes());
exports.blsSkToPk = blsSkToPk;
const blsAggregate = (signatures) => {
    try {
        return Buffer.from(blst_1.aggregateSignatures(signatures.map(s => blst_1.Signature.fromBytes(s))).toBytes());
    }
    catch {
        return false;
    }
};
exports.blsAggregate = blsAggregate;
const blsSign = (sk, message) => {
    const signature = Buffer.from(blst_1.SecretKey.fromBytes(sk).sign(message).toBytes());
    return signature;
};
exports.blsSign = blsSign;
const blsVerify = (pk, message, signature) => {
    try {
        const sig = blst_1.Signature.fromBytes(signature);
        const pub = blst_1.PublicKey.fromBytes(pk);
        return blst_1.verify(message, pub, sig);
    }
    catch {
        return false;
    }
};
exports.blsVerify = blsVerify;
const blsAggregateVerify = (publicKeys, messages, signature) => {
    if (publicKeys.length === 0)
        return false;
    try {
        return blst_1.aggregateVerify(messages.map(m => m), publicKeys.map(k => blst_1.PublicKey.fromBytes(k)), blst_1.Signature.fromBytes(signature));
    }
    catch {
        return false;
    }
};
exports.blsAggregateVerify = blsAggregateVerify;
const blsFastAggregateVerify = (publicKeys, messages, signature) => {
    if (publicKeys.length === 0)
        return false;
    try {
        return blst_1.fastAggregateVerify(messages, publicKeys.map(k => blst_1.PublicKey.fromBytes(k)), blst_1.Signature.fromBytes(signature));
    }
    catch {
        return false;
    }
};
exports.blsFastAggregateVerify = blsFastAggregateVerify;
const blsPopProve = (sk) => {
    const message = exports.blsSkToPk(sk);
    const sig = new bindings_1.blst.P2();
    return Buffer.from(new blst_1.Signature(sig.hash_to(message, DST_POP).sign_with(blst_1.SecretKey.fromBytes(sk).value)).toBytes());
};
exports.blsPopProve = blsPopProve;
const blsPopVerify = (pk, proof) => {
    if (!exports.blsKeyValidate(pk)) {
        return false;
    }
    try {
        const signature = blst_1.Signature.fromBytes(proof, blst_1.CoordType.affine).value;
        const publicKey = blst_1.PublicKey.fromBytes(pk, blst_1.CoordType.affine).value;
        return signature.core_verify(publicKey, true, pk, DST_POP) === bindings_1.BLST_ERROR.BLST_SUCCESS;
    }
    catch {
        return false;
    }
};
exports.blsPopVerify = blsPopVerify;
//# sourceMappingURL=lib.js.map