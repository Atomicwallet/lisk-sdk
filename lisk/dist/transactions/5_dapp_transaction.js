'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_transactions_1 = require('@liskhq/lisk-transactions');
var constants_1 = require('./constants');
var validator = lisk_transactions_1.utils.validator,
	stringEndsWith = lisk_transactions_1.utils.stringEndsWith;
exports.dappAssetFormatSchema = {
	type: 'object',
	required: ['dapp'],
	properties: {
		dapp: {
			type: 'object',
			required: ['name', 'type', 'category'],
			properties: {
				icon: {
					type: 'string',
					format: 'uri',
					maxLength: 2000,
				},
				category: {
					type: 'integer',
					minimum: 0,
					maximum: 8,
				},
				type: {
					type: 'integer',
					minimum: 0,
					maximum: 1,
				},
				link: {
					type: 'string',
					format: 'uri',
					minLength: 0,
					maxLength: 2000,
				},
				tags: {
					type: 'string',
					format: 'noNullByte',
					maxLength: 160,
				},
				description: {
					type: 'string',
					format: 'noNullByte',
					maxLength: 160,
				},
				name: {
					type: 'string',
					format: 'noNullByte',
					minLength: 1,
					maxLength: 32,
				},
			},
		},
	},
};
var DappTransaction = (function(_super) {
	tslib_1.__extends(DappTransaction, _super);
	function DappTransaction(rawTransaction) {
		var _this = _super.call(this, rawTransaction) || this;
		var tx =
			typeof rawTransaction === 'object' && rawTransaction !== null
				? rawTransaction
				: {};
		_this.asset = tx.asset || { dapp: {} };
		_this.containsUniqueData = true;
		if (
			_this.asset &&
			_this.asset.dapp &&
			typeof _this.asset.dapp === 'object'
		) {
			_this.asset.dapp.description = _this.asset.dapp.description || undefined;
			_this.asset.dapp.icon = _this.asset.dapp.icon || undefined;
			_this.asset.dapp.tags = _this.asset.dapp.tags || undefined;
		}
		return _this;
	}
	DappTransaction.prototype.assetToBytes = function() {
		var DAPP_TYPE_LENGTH = 4;
		var DAPP_CATEGORY_LENGTH = 4;
		var _a = this.asset.dapp,
			name = _a.name,
			description = _a.description,
			tags = _a.tags,
			link = _a.link,
			icon = _a.icon,
			type = _a.type,
			category = _a.category;
		var nameBuffer = Buffer.from(name, 'utf8');
		var linkBuffer = link ? Buffer.from(link, 'utf8') : Buffer.alloc(0);
		var typeBuffer = Buffer.alloc(DAPP_TYPE_LENGTH);
		typeBuffer.writeIntLE(type, 0, DAPP_TYPE_LENGTH);
		var categoryBuffer = Buffer.alloc(DAPP_CATEGORY_LENGTH);
		categoryBuffer.writeIntLE(category, 0, DAPP_CATEGORY_LENGTH);
		var descriptionBuffer = description
			? Buffer.from(description, 'utf8')
			: Buffer.alloc(0);
		var tagsBuffer = tags ? Buffer.from(tags, 'utf8') : Buffer.alloc(0);
		var iconBuffer = icon ? Buffer.from(icon, 'utf8') : Buffer.alloc(0);
		return Buffer.concat([
			nameBuffer,
			descriptionBuffer,
			tagsBuffer,
			linkBuffer,
			iconBuffer,
			typeBuffer,
			categoryBuffer,
		]);
	};
	DappTransaction.prototype.assetToJSON = function() {
		return this.asset;
	};
	DappTransaction.prototype.prepare = function(store) {
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
							]),
						];
					case 1:
						_a.sent();
						return [
							4,
							store.transaction.cache([
								{
									dapp_name: this.asset.dapp.name,
								},
								{ dapp_link: this.asset.dapp.link },
							]),
						];
					case 2:
						_a.sent();
						return [2];
				}
			});
		});
	};
	DappTransaction.prototype.verifyAgainstTransactions = function(transactions) {
		var _this = this;
		var sameTypeTransactions = transactions.filter(function(tx) {
			return tx.type === _this.type;
		});
		var errors =
			sameTypeTransactions.filter(function(tx) {
				return (
					'dapp' in tx.asset && tx.asset.dapp.name === _this.asset.dapp.name
				);
			}).length > 0
				? [
						new lisk_transactions_1.TransactionError(
							'Dapp with the same name already exists.',
							this.id,
							'.asset.dapp.name',
							this.asset.dapp.name
						),
				  ]
				: [];
		if (
			sameTypeTransactions.filter(function(tx) {
				return (
					'dapp' in tx.asset &&
					_this.asset.dapp.link &&
					_this.asset.dapp.link === tx.asset.dapp.link
				);
			}).length > 0
		) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Dapp with the same link already exists.',
					this.id,
					'.asset.dapp.link',
					this.asset.dapp.link
				)
			);
		}
		return errors;
	};
	DappTransaction.prototype.validateAsset = function() {
		validator.validate(exports.dappAssetFormatSchema, this.asset);
		var errors = lisk_transactions_1.convertToAssetError(
			this.id,
			validator.errors
		);
		if (this.type !== constants_1.TRANSACTION_DAPP_TYPE) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Invalid type',
					this.id,
					'.type',
					this.type,
					constants_1.TRANSACTION_DAPP_TYPE
				)
			);
		}
		if (!this.amount.eq(0)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Amount must be zero for vote transaction',
					this.id,
					'.amount',
					this.amount.toString(),
					'0'
				)
			);
		}
		if (this.recipientId) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'RecipientId is expected to be undefined',
					this.id,
					'.recipientId'
				)
			);
		}
		if (!this.fee.eq(constants_1.DAPP_FEE)) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Fee must be equal to ' + constants_1.DAPP_FEE,
					this.id,
					'.fee',
					this.fee.toString(),
					constants_1.DAPP_FEE
				)
			);
		}
		var validLinkSuffix = ['.zip'];
		if (errors.length > 0) {
			return errors;
		}
		if (
			this.asset.dapp.link &&
			!stringEndsWith(this.asset.dapp.link, validLinkSuffix)
		) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Dapp icon must have suffix ' + validLinkSuffix.toString(),
					this.id,
					'.asset.dapp.link',
					this.asset.dapp.link
				)
			);
		}
		var validIconSuffix = ['.png', '.jpeg', '.jpg'];
		if (
			this.asset.dapp.icon &&
			!stringEndsWith(this.asset.dapp.icon, validIconSuffix)
		) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Dapp icon must have suffix of one of ' + validIconSuffix.toString(),
					this.id,
					'.asset.dapp.icon',
					this.asset.dapp.icon
				)
			);
		}
		if (this.asset.dapp.tags) {
			var tags = this.asset.dapp.tags
				.split(',')
				.map(function(tag) {
					return tag.trim();
				})
				.sort();
			if (tags.length !== new Set(tags).size) {
				errors.push(
					new lisk_transactions_1.TransactionError(
						'Dapp tags must have unique set',
						this.id,
						'.asset.dapp.tags',
						this.asset.dapp.tags
					)
				);
			}
		}
		return errors;
	};
	DappTransaction.prototype.applyAsset = function(store) {
		var _this = this;
		var errors = [];
		var nameExists = store.transaction.find(function(transaction) {
			return (
				transaction.type === constants_1.TRANSACTION_DAPP_TYPE &&
				transaction.id !== _this.id &&
				transaction.asset.dapp &&
				transaction.asset.dapp.name === _this.asset.dapp.name
			);
		});
		if (nameExists) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Application name already exists: ' + this.asset.dapp.name,
					this.id,
					this.asset.dapp.name
				)
			);
		}
		var linkExists = store.transaction.find(function(transaction) {
			return (
				transaction.type === constants_1.TRANSACTION_DAPP_TYPE &&
				transaction.id !== _this.id &&
				transaction.asset.dapp &&
				transaction.asset.dapp.link === _this.asset.dapp.link
			);
		});
		if (linkExists) {
			errors.push(
				new lisk_transactions_1.TransactionError(
					'Application link already exists: ' + this.asset.dapp.link,
					this.id,
					this.asset.dapp.link
				)
			);
		}
		return errors;
	};
	DappTransaction.prototype.undoAsset = function(_) {
		return [];
	};
	return DappTransaction;
})(lisk_transactions_1.BaseTransaction);
exports.DappTransaction = DappTransaction;
//# sourceMappingURL=5_dapp_transaction.js.map
