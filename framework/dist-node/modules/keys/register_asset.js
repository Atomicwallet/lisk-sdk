"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterAsset = exports.MAX_KEYS_COUNT = exports.RegisterAssetID = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const base_asset_1 = require("../base_asset");
const schemas_1 = require("./schemas");
const setMemberAccounts = async (store, membersPublicKeys) => {
    for (const memberPublicKey of membersPublicKeys) {
        const address = lisk_cryptography_1.getAddressFromPublicKey(memberPublicKey);
        const memberAccount = await store.account.getOrDefault(address);
        await store.account.set(memberAccount.address, memberAccount);
    }
};
exports.RegisterAssetID = 0;
exports.MAX_KEYS_COUNT = 64;
class RegisterAsset extends base_asset_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = 'registerMultisignatureGroup';
        this.id = exports.RegisterAssetID;
        this.schema = schemas_1.keysSchema;
    }
    validate({ asset, transaction }) {
        const { mandatoryKeys, optionalKeys, numberOfSignatures } = asset;
        if (!lisk_utils_1.objects.bufferArrayUniqueItems(mandatoryKeys)) {
            throw new Error('MandatoryKeys contains duplicate public keys.');
        }
        if (!lisk_utils_1.objects.bufferArrayUniqueItems(optionalKeys)) {
            throw new Error('OptionalKeys contains duplicate public keys.');
        }
        if (mandatoryKeys.length + optionalKeys.length < numberOfSignatures) {
            throw new Error('The numberOfSignatures is bigger than the count of Mandatory and Optional keys.');
        }
        if (mandatoryKeys.length + optionalKeys.length > exports.MAX_KEYS_COUNT ||
            mandatoryKeys.length + optionalKeys.length <= 0) {
            throw new Error('The count of Mandatory and Optional keys should be between 1 and 64.');
        }
        if (mandatoryKeys.length > numberOfSignatures) {
            throw new Error('The numberOfSignatures needs to be equal or bigger than the number of Mandatory keys.');
        }
        const repeatedKeys = mandatoryKeys.filter(value => optionalKeys.find(optional => optional.equals(value)) !== undefined);
        if (repeatedKeys.length > 0) {
            throw new Error('Invalid combination of Mandatory and Optional keys. Repeated keys across Mandatory and Optional were found.');
        }
        if (mandatoryKeys.length + optionalKeys.length + 1 !== transaction.signatures.length) {
            throw new Error('The number of mandatory, optional and sender keys should match the number of signatures');
        }
        const sortedMandatoryKeys = [...mandatoryKeys].sort((a, b) => a.compare(b));
        const sortedOptionalKeys = [...optionalKeys].sort((a, b) => a.compare(b));
        for (let i = 0; i < sortedMandatoryKeys.length; i += 1) {
            if (!mandatoryKeys[i].equals(sortedMandatoryKeys[i])) {
                throw new Error('Mandatory keys should be sorted lexicographically.');
            }
        }
        for (let i = 0; i < sortedOptionalKeys.length; i += 1) {
            if (!optionalKeys[i].equals(sortedOptionalKeys[i])) {
                throw new Error('Optional keys should be sorted lexicographically.');
            }
        }
    }
    async apply({ asset, stateStore, transaction }) {
        const sender = await stateStore.account.get(transaction.senderAddress);
        if (sender.keys.numberOfSignatures > 0) {
            throw new Error('Register multisignature only allowed once per account.');
        }
        sender.keys = {
            numberOfSignatures: asset.numberOfSignatures,
            mandatoryKeys: asset.mandatoryKeys,
            optionalKeys: asset.optionalKeys,
        };
        await stateStore.account.set(sender.address, sender);
        await setMemberAccounts(stateStore, sender.keys.mandatoryKeys);
        await setMemberAccounts(stateStore, sender.keys.optionalKeys);
    }
}
exports.RegisterAsset = RegisterAsset;
//# sourceMappingURL=register_asset.js.map