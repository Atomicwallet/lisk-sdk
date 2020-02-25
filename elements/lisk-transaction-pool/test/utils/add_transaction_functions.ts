/*
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import { TransactionObject, Transaction } from '../../src/transaction_pool';

export const wrapTransactionWithoutUniqueData = (
	transaction: TransactionObject,
): Transaction => {
	return {
		...transaction,
		containsUniqueData: false,
		verifyAgainstOtherTransactions: () => true,
		isExpired: (time: Date) => time.getTime() < 0,
		isReady: () => true,
	};
};

export const wrapTransactionWithUniqueData = (
	transaction: TransactionObject,
): Transaction => {
	return {
		...transaction,
		containsUniqueData: true,
		verifyAgainstOtherTransactions: () => true,
		isExpired: (time: Date) => time.getTime() < 0,
		isReady: () => true,
	};
};

export const wrapTransaction = (
	transaction: TransactionObject,
): Transaction => {
	return [0, 1].includes(transaction.type)
		? wrapTransactionWithoutUniqueData(transaction)
		: wrapTransactionWithUniqueData(transaction);
};
