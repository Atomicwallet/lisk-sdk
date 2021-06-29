"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassphrase = exports.liskSnapshotUrl = void 0;
const cryptography = require("@liskhq/lisk-cryptography");
const constants_1 = require("../constants");
const liskSnapshotUrl = (url, network) => {
    if (!['testnet', 'mainnet', 'betanet', 'default'].includes(network.toLowerCase())) {
        return '';
    }
    if (url && url.search(constants_1.RELEASE_URL) >= 0) {
        return `${constants_1.RELEASE_URL}/${network}/blockchain.db.tar.gz`;
    }
    return url;
};
exports.liskSnapshotUrl = liskSnapshotUrl;
const encryptPassphrase = (passphrase, password, outputPublicKey) => {
    const encryptedPassphraseObject = cryptography.encryptPassphraseWithPassword(passphrase, password);
    const encryptedPassphrase = cryptography.stringifyEncryptedPassphrase(encryptedPassphraseObject);
    return outputPublicKey
        ? {
            encryptedPassphrase,
            publicKey: cryptography.getKeys(passphrase).publicKey.toString('hex'),
        }
        : { encryptedPassphrase };
};
exports.encryptPassphrase = encryptPassphrase;
//# sourceMappingURL=commons.js.map