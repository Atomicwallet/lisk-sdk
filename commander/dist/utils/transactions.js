"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./error");
exports.parseTransactionString = function (transactionStr) {
    try {
        return JSON.parse(transactionStr);
    }
    catch (error) {
        throw new error_1.ValidationError('Could not parse transaction JSON.');
    }
};
//# sourceMappingURL=transactions.js.map