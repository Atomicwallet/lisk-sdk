"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_transactions_1 = require("@liskhq/lisk-transactions");
const createTransaction = ({ moduleID, assetClass, asset, nonce, fee, passphrase, networkIdentifier, }) => {
    const { publicKey } = lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase !== null && passphrase !== void 0 ? passphrase : '');
    const assetInstance = new assetClass();
    const assetID = assetInstance.id;
    const assetBytes = lisk_codec_1.codec.encode(assetInstance.schema, asset);
    const transaction = {
        moduleID,
        assetID,
        nonce: nonce !== null && nonce !== void 0 ? nonce : BigInt(0),
        fee: fee !== null && fee !== void 0 ? fee : BigInt(0),
        senderPublicKey: publicKey,
        asset,
        signatures: [],
    };
    const validationErrors = lisk_transactions_1.validateTransaction(assetInstance.schema, transaction);
    if (validationErrors) {
        throw validationErrors;
    }
    if (!passphrase) {
        return new lisk_chain_1.Transaction({ ...transaction, asset: assetBytes });
    }
    if (!networkIdentifier) {
        throw new Error('Network identifier is required to sign a transaction');
    }
    const signedTransaction = lisk_transactions_1.signTransaction(assetInstance.schema, transaction, networkIdentifier, passphrase);
    return new lisk_chain_1.Transaction({ ...signedTransaction, asset: assetBytes });
};
exports.createTransaction = createTransaction;
//# sourceMappingURL=create_transaction.js.map