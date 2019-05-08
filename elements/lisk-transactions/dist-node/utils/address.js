"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var errors_1 = require("../errors");
exports.validateSenderIdAndPublicKey = function (id, senderId, senderPublicKey) {
    var actualAddress = lisk_cryptography_1.getAddressFromPublicKey(senderPublicKey);
    return senderId.toUpperCase() !== actualAddress.toUpperCase()
        ? new errors_1.TransactionError('`senderId` does not match `senderPublicKey`', id, '.senderId', actualAddress, senderId)
        : undefined;
};
//# sourceMappingURL=address.js.map