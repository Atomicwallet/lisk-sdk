"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseTransaction = void 0;
const lisk_cryptography_1 = require("../../../lisk-cryptography");
const time_1 = require("./time");
const createBaseTransaction = ({ passphrase, timeOffset, }) => {
    const { address: senderId, publicKey: senderPublicKey } = passphrase
        ? lisk_cryptography_1.getAddressAndPublicKeyFromPassphrase(passphrase)
        : { address: undefined, publicKey: undefined };
    const timestamp = time_1.getTimeWithOffset(timeOffset);
    return {
        amount: '0',
        recipientId: '',
        senderId,
        senderPublicKey,
        timestamp,
    };
};
exports.createBaseTransaction = createBaseTransaction;
//# sourceMappingURL=create_base_transaction.js.map