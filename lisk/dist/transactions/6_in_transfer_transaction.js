'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var bignum_1 = tslib_1.__importDefault(require('@liskhq/bignum'));
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var constants_1 = require('./constants');
var convertBeddowsToLSK = lisk_transactions_1.utils.convertBeddowsToLSK,
	verifyAmountBalance = lisk_transactions_1.utils.verifyAmountBalance,
	validator = lisk_transactions_1.utils.validator;
exports.inTransferAssetFormatSchema = {
	type: 'object',
	required: ['inTransfer'],
	properties: {
		inTransfer: {
			type: 'object',
			required: ['dappId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};
var InTransferTransaction = (function(_super) {
	tslib_1.__extends(InTransferTransaction, _super);
	function InTransferTransaction(rawTransaction) {
		var _this = _super.call(this, rawTransaction) || this;
		var tx =
			typeof rawTransaction === 'object' && rawTransaction !== null
				? rawTransaction
				: {};
		_this.asset = tx.asset || { inTransfer: {} };
		return _this;
	}
	InTransferTransaction.prototype.assetToBytes = function() {
		return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
	};
	InTransferTransaction.prototype.prepare = function(store) {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var transactions, dappTransaction;
			var _this = this;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4, store.account.cache([{ address: this.senderId }])];
					case 1:
						_a.sent();
						return [
							4,
							store.transaction.cache([
								{
									id: this.asset.inTransfer.dappId,
								},
							]),
						];
					case 2:
						transactions = _a.sent();
						dappTransaction =
							transactions && transactions.length > 0
								? transactions.find(function(tx) {
										return (
											tx.type === constants_1.TRANSACTION_DAPP_TYPE &&
											tx.id === _this.asset.inTransfer.dappId
										);
								  })
								: undefined;
						if (!dappTransaction) return [3, 4];
						return [
							4,
							store.account.cache([{ address: dappTransaction.senderId }]),
						];
					case 3:
						_a.sent();
						_a.label = 4;
					case 4:
						return [2];
				}
			});
		});
	};
	InTransferTransaction.prototype.assetToJSON = function() {
		return this.asset;
	};
	InTransferTransaction.prototype.verifyAgainstTransactions = function(_) {
		return [];
	};
	InTransferTransaction.prototype.validateAsset = function() {
		validator.validate(exports.inTransferAssetFormatSchema, this.asset);
		var errors = lisk_transactions_1.convertToAssetError(
			this.id,
			validator.errors
		);
		if (this.type !== constants_1.TRANSACTION_INTRANSFER_TYPE) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Invalid type',
					this.id,
					'.type',
					this.type,
					constants_1.TRANSACTION_INTRANSFER_TYPE
				)
			);
		}
		if (this.recipientId) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'RecipientId is expected to be undefined.',
					this.id,
					'.recipientId',
					this.recipientId
				)
			);
		}
		if (this.recipientPublicKey) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'RecipientPublicKey is expected to be undefined.',
					this.id,
					'.recipientPublicKey',
					this.recipientPublicKey
				)
			);
		}
		if (this.amount.lte(0)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Amount must be greater than 0',
					this.id,
					'.amount',
					this.amount.toString(),
					'0'
				)
			);
		}
		if (!this.fee.eq(constants_1.IN_TRANSFER_FEE)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Fee must be equal to ' + constants_1.IN_TRANSFER_FEE,
					this.id,
					'.fee',
					this.fee.toString(),
					constants_1.IN_TRANSFER_FEE
				)
			);
		}
		return errors;
	};
	InTransferTransaction.prototype.applyAsset = function(store) {
		var _this = this;
		var errors = [];
		var idExists = store.transaction.find(function(transaction) {
			return (
				transaction.type === constants_1.TRANSACTION_DAPP_TYPE &&
				transaction.id === _this.asset.inTransfer.dappId
			);
		});
		if (!idExists) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Application not found: ' + this.asset.inTransfer.dappId,
					this.id,
					this.asset.inTransfer.dappId
				)
			);
		}
		var sender = store.account.get(this.senderId);
		var balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.amount,
			this.fee
		);
		if (balanceError) {
			errors.push(balanceError);
		}
		var updatedBalance = new bignum_1.default(sender.balance).sub(this.amount);
		var updatedSender = tslib_1.__assign({}, sender, {
			balance: updatedBalance.toString(),
		});
		store.account.set(updatedSender.address, updatedSender);
		var dappTransaction = store.transaction.get(this.asset.inTransfer.dappId);
		var recipient = store.account.get(dappTransaction.senderId);
		var updatedRecipientBalance = new bignum_1.default(recipient.balance).add(
			this.amount
		);
		var updatedRecipient = tslib_1.__assign({}, recipient, {
			balance: updatedRecipientBalance.toString(),
		});
		store.account.set(updatedRecipient.address, updatedRecipient);
		return errors;
	};
	InTransferTransaction.prototype.undoAsset = function(store) {
		var errors = [];
		var sender = store.account.get(this.senderId);
		var updatedBalance = new bignum_1.default(sender.balance).add(this.amount);
		var updatedSender = tslib_1.__assign({}, sender, {
			balance: updatedBalance.toString(),
		});
		store.account.set(updatedSender.address, updatedSender);
		var dappTransaction = store.transaction.get(this.asset.inTransfer.dappId);
		var recipient = store.account.get(dappTransaction.senderId);
		var updatedRecipientBalance = new bignum_1.default(recipient.balance).sub(
			this.amount
		);
		if (updatedRecipientBalance.lt(0)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Account does not have enough LSK: ' +
						recipient.address +
						', balance: ' +
						convertBeddowsToLSK(recipient.balance) +
						'.',
					this.id
				)
			);
		}
		var updatedRecipient = tslib_1.__assign({}, recipient, {
			balance: updatedRecipientBalance.toString(),
		});
		store.account.set(updatedRecipient.address, updatedRecipient);
		return errors;
	};
	return InTransferTransaction;
})(lisk_transactions_1.BaseTransaction);
exports.InTransferTransaction = InTransferTransaction;
//# sourceMappingURL=6_in_transfer_transaction.js.map
