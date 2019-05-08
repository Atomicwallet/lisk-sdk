'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var bignum_1 = tslib_1.__importDefault(require('@liskhq/bignum'));
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var constants_1 = require('./constants');
var verifyAmountBalance = lisk_transactions_1.utils.verifyAmountBalance,
	validator = lisk_transactions_1.utils.validator;
var TRANSACTION_OUTTRANSFER_TYPE = 7;
var TRANSACTION_DAPP_REGISTERATION_TYPE = 5;
exports.outTransferAssetFormatSchema = {
	type: 'object',
	required: ['outTransfer'],
	properties: {
		outTransfer: {
			type: 'object',
			required: ['dappId', 'transactionId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
				transactionId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};
var OutTransferTransaction = (function(_super) {
	tslib_1.__extends(OutTransferTransaction, _super);
	function OutTransferTransaction(rawTransaction) {
		var _this = _super.call(this, rawTransaction) || this;
		var tx =
			typeof rawTransaction === 'object' && rawTransaction !== null
				? rawTransaction
				: {};
		_this.asset = tx.asset || { outTransfer: {} };
		_this.containsUniqueData = true;
		return _this;
	}
	OutTransferTransaction.prototype.prepare = function(store) {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4,
							store.account.cache([
								{
									address: this.senderId,
								},
								{ address: this.recipientId },
							]),
						];
					case 1:
						_a.sent();
						return [
							4,
							store.transaction.cache([
								{
									id: this.asset.outTransfer.dappId,
								},
								{ id: this.asset.outTransfer.transactionId },
							]),
						];
					case 2:
						_a.sent();
						return [2];
				}
			});
		});
	};
	OutTransferTransaction.prototype.assetToBytes = function() {
		var _a = this.asset.outTransfer,
			dappId = _a.dappId,
			transactionId = _a.transactionId;
		var outAppIdBuffer = Buffer.from(dappId, 'utf8');
		var outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');
		return Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]);
	};
	OutTransferTransaction.prototype.assetToJSON = function() {
		return this.asset;
	};
	OutTransferTransaction.prototype.verifyAgainstTransactions = function(
		transactions
	) {
		var _this = this;
		var sameTypeTransactions = transactions.filter(function(tx) {
			return (
				tx.type === _this.type &&
				'outTransfer' in tx.asset &&
				_this.asset.outTransfer.transactionId ===
					tx.asset.outTransfer.transactionId
			);
		});
		return sameTypeTransactions.length > 0
			? [
					new lisk_transactions_1.TransactionError(
						'Out Transfer cannot refer to the same transactionId',
						this.id,
						'.asset.outTransfer.transactionId'
					),
			  ]
			: [];
	};
	OutTransferTransaction.prototype.validateAsset = function() {
		validator.validate(exports.outTransferAssetFormatSchema, this.asset);
		var errors = lisk_transactions_1.convertToAssetError(
			this.id,
			validator.errors
		);
		if (this.type !== TRANSACTION_OUTTRANSFER_TYPE) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Invalid type',
					this.id,
					'.type',
					this.type,
					TRANSACTION_OUTTRANSFER_TYPE
				)
			);
		}
		if (this.amount.lte(0)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Amount must be greater than zero for outTransfer transaction',
					this.id,
					'.amount',
					this.amount.toString()
				)
			);
		}
		if (!this.fee.eq(constants_1.OUT_TRANSFER_FEE)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Fee must be equal to ' + constants_1.OUT_TRANSFER_FEE,
					this.id,
					'.fee',
					this.fee.toString(),
					constants_1.OUT_TRANSFER_FEE
				)
			);
		}
		if (this.recipientId === '') {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'RecipientId must be set for outTransfer transaction',
					this.id,
					'.recipientId',
					this.recipientId
				)
			);
		}
		return errors;
	};
	OutTransferTransaction.prototype.applyAsset = function(store) {
		var errors = [];
		var dappRegistrationTransaction = store.transaction.get(
			this.asset.outTransfer.dappId
		);
		if (
			!dappRegistrationTransaction ||
			dappRegistrationTransaction.type !== TRANSACTION_DAPP_REGISTERATION_TYPE
		) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Application not found: ' + this.asset.outTransfer.dappId,
					this.id,
					'.asset.outTransfer.dappId'
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
		var recipient = store.account.getOrDefault(this.recipientId);
		var updatedRecipientBalance = new bignum_1.default(recipient.balance).add(
			this.amount
		);
		if (updatedRecipientBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Invalid amount',
					this.id,
					'.amount'
				)
			);
		}
		var updatedRecipient = tslib_1.__assign({}, recipient, {
			balance: updatedRecipientBalance.toString(),
		});
		store.account.set(updatedRecipient.address, updatedRecipient);
		return errors;
	};
	OutTransferTransaction.prototype.undoAsset = function(store) {
		var errors = [];
		var sender = store.account.get(this.senderId);
		var updatedBalance = new bignum_1.default(sender.balance).add(this.amount);
		if (updatedBalance.gt(constants_1.MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.amount.toString()
				)
			);
		}
		var updatedSender = tslib_1.__assign({}, sender, {
			balance: updatedBalance.toString(),
		});
		store.account.set(updatedSender.address, updatedSender);
		var recipient = store.account.getOrDefault(this.recipientId);
		var updatedRecipientBalance = new bignum_1.default(recipient.balance).sub(
			this.amount
		);
		if (updatedRecipientBalance.lt(0)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Account does not have enough LSK: ' +
						recipient.address +
						', balance: ' +
						recipient.balance,
					this.id,
					updatedRecipientBalance.toString()
				)
			);
		}
		var updatedRecipient = tslib_1.__assign({}, recipient, {
			balance: updatedRecipientBalance.toString(),
		});
		store.account.set(updatedRecipient.address, updatedRecipient);
		return errors;
	};
	return OutTransferTransaction;
})(lisk_transactions_1.BaseTransaction);
exports.OutTransferTransaction = OutTransferTransaction;
//# sourceMappingURL=7_out_transfer_transaction.js.map
