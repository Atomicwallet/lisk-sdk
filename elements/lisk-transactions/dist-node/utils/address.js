"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSenderIdAndPublicKey = void 0;
const lisk_cryptography_1 = require("../../../lisk-cryptography");
const errors_1 = require("../errors");
const validateSenderIdAndPublicKey = (id, senderId, senderPublicKey) => {
    const actualAddress = lisk_cryptography_1.getAddressFromPublicKey(senderPublicKey);
    return senderId.toUpperCase() !== actualAddress.toUpperCase()
        ? new errors_1.TransactionError('`senderId` does not match `senderPublicKey`', id, '.senderId', actualAddress, senderId)
        : undefined;
};
exports.validateSenderIdAndPublicKey = validateSenderIdAndPublicKey;
//# sourceMappingURL=address.js.map