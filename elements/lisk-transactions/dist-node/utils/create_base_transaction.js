"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var time_1 = require("./time");
exports.createBaseTransaction = function (_a) {
    var passphrase = _a.passphrase, timeOffset = _a.timeOffset;
    var _b = passphrase
        ? lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase)
        : { address: undefined, publicKey: undefined }, senderId = _b.address, senderPublicKey = _b.publicKey;
    var timestamp = time_1.getTimeWithOffset(timeOffset);
    return {
        amount: '0',
        recipientId: '',
        senderId: senderId,
        senderPublicKey: senderPublicKey,
        timestamp: timestamp,
    };
};
//# sourceMappingURL=create_base_transaction.js.map