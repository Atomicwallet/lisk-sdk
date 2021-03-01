"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.isMultisignatureAccount = (account) => !!((account.keys.mandatoryKeys.length > 0 || account.keys.optionalKeys.length > 0) &&
    account.keys.numberOfSignatures);
exports.validateSignature = (publicKey, signature, transactionBytes, id) => {
    const valid = lisk_cryptography_1.verifyData(transactionBytes, signature, publicKey);
    if (!valid) {
        throw new Error(`Failed to validate signature '${signature.toString('hex')}' for transaction with id '${id.toString('hex')}'`);
    }
};
exports.validateKeysSignatures = (keys, signatures, transactionBytes, id) => {
    for (let i = 0; i < keys.length; i += 1) {
        if (signatures[i].length === 0) {
            throw new Error('Invalid signature. Empty buffer is not a valid signature.');
        }
        exports.validateSignature(keys[i], signatures[i], transactionBytes, id);
    }
};
exports.verifyMultiSignatureTransaction = (id, sender, signatures, transactionBytes) => {
    const { mandatoryKeys, optionalKeys, numberOfSignatures } = sender.keys;
    const numMandatoryKeys = mandatoryKeys.length;
    const numOptionalKeys = optionalKeys.length;
    const nonEmptySignaturesCount = signatures.filter(k => k.length !== 0).length;
    if (nonEmptySignaturesCount !== numberOfSignatures ||
        signatures.length !== numMandatoryKeys + numOptionalKeys) {
        throw new Error(`Transaction signatures does not match required number of signatures: '${numberOfSignatures.toString()}' for transaction with id '${id.toString('hex')}'`);
    }
    exports.validateKeysSignatures(mandatoryKeys, signatures, transactionBytes, id);
    for (let k = 0; k < numOptionalKeys; k += 1) {
        const signature = signatures[numMandatoryKeys + k];
        if (signature.length !== 0) {
            exports.validateSignature(optionalKeys[k], signature, transactionBytes, id);
        }
    }
};
//# sourceMappingURL=verify.js.map