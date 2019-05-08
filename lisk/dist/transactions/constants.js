'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var FIXED_POINT = lisk_transactions_1.constants.FIXED_POINT,
	MAX_TRANSACTION_AMOUNT = lisk_transactions_1.constants.MAX_TRANSACTION_AMOUNT;
exports.FIXED_POINT = FIXED_POINT;
exports.MAX_TRANSACTION_AMOUNT = MAX_TRANSACTION_AMOUNT;
exports.TRANSACTION_DAPP_TYPE = 5;
exports.TRANSACTION_INTRANSFER_TYPE = 6;
exports.TRANSACTION_OUTTRANSFER_TYPE = 7;
exports.IN_TRANSFER_FEE = FIXED_POINT * 0.1;
exports.OUT_TRANSFER_FEE = FIXED_POINT * 0.1;
exports.DAPP_FEE = FIXED_POINT * 25;
//# sourceMappingURL=constants.js.map
