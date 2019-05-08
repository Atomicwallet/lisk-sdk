"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cryptography = require("@liskhq/lisk-cryptography");
var utils_1 = require("./utils");
exports.createSignatureObject = function (transaction, passphrase) {
    if (!utils_1.verifyTransaction(transaction)) {
        throw new Error('Invalid transaction.');
    }
    if (!transaction.id) {
        throw new Error('Transaction ID is required to create a signature object.');
    }
    var publicKey = cryptography.getPrivateAndPublicKeyFromPassphrase(passphrase).publicKey;
    return {
        transactionId: transaction.id,
        publicKey: publicKey,
        signature: utils_1.multiSignTransaction(transaction, passphrase),
    };
};
//# sourceMappingURL=create_signature_object.js.map