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
import { MultisignatureStatus } from '../base_transaction';
import { TransactionError, TransactionPendingError } from '../errors';
import { Account } from '../transaction_types';

import { convertBeddowsToLSK } from './format';
import { validateMultisignatures } from './sign_and_validate';

export const verifySenderPublicKey = (
	id: string,
	sender: Account,
	publicKey: string,
): TransactionError | undefined =>
	sender.publicKey && sender.publicKey !== publicKey
		? new TransactionError(
				'Invalid sender publicKey',
				id,
				'.senderPublicKey',
				publicKey,
				sender.publicKey,
		  )
		: undefined;

export const verifyBalance = (
	id: string,
	account: Account,
	amount: bigint,
): TransactionError | undefined =>
	account.balance < amount
		? new TransactionError(
				`Account does not have enough LSK: ${
					account.address
				}, balance: ${convertBeddowsToLSK(account.balance.toString())}`,
				id,
				'.balance',
		  )
		: undefined;

export const verifyAmountBalance = (
	id: string,
	account: Account,
	amount: bigint,
	fee: bigint,
): TransactionError | undefined => {
	if (account.balance >= BigInt(0) && account.balance < amount) {
		return new TransactionError(
			`Account does not have enough LSK: ${
				account.address
			}, balance: ${convertBeddowsToLSK((account.balance + fee).toString())}`,
			id,
			'.balance',
		);
	}

	return undefined;
};

export const verifyMinRemainingBalance = (
	id: string,
	account: Account,
	minRemainingBalance: bigint,
): TransactionError | undefined => {
	if (account.balance < minRemainingBalance) {
		return new TransactionError(
			`Account does not have enough minimum remaining LSK: ${
				account.address
			}, balance: ${convertBeddowsToLSK(account.balance.toString())}`,
			id,
			'.balance',
		);
	}

	return undefined;
};

export const verifyAccountNonce = (
	id: string,
	account: Account,
	nonce: bigint,
): TransactionError | undefined => {
	if (account.nonce !== nonce) {
		return new TransactionError(
			`Nonce does not match with account: ${
				account.address
			}, Nonce: ${nonce.toString()}, Account Nonce: ${account.nonce.toString()}`,
			id,
			'.nonce',
		);
	}

	return undefined;
};

export interface VerifyMultiSignatureResult {
	readonly status: MultisignatureStatus;
	readonly errors: ReadonlyArray<TransactionError>;
}

const isMultisignatureAccount = (account: Account): boolean =>
	!!(
		(account.keys.mandatoryKeys.length > 0 ||
			account.keys.optionalKeys.length > 0) &&
		account.keys.numberOfSignatures
	);

export const verifyMultiSignatures = (
	id: string,
	sender: Account,
	signatures: ReadonlyArray<string>,
	transactionBytes: Buffer,
): VerifyMultiSignatureResult => {
	if (!isMultisignatureAccount(sender) && signatures.length > 0) {
		return {
			status: MultisignatureStatus.FAIL,
			errors: [
				new TransactionError(
					'Sender is not a multisignature account',
					id,
					'.signatures',
				),
			],
		};
	}

	if (!isMultisignatureAccount(sender)) {
		return {
			status: MultisignatureStatus.NONMULTISIGNATURE,
			errors: [],
		};
	}

	const { valid, errors } = validateMultisignatures(
		[], // UPDATE TO LIP0017 sender.membersPublicKeys as ReadonlyArray<string>,
		signatures,
		sender.keys.numberOfSignatures,
		transactionBytes,
		id,
	);

	if (valid) {
		return {
			status: MultisignatureStatus.READY,
			errors: [],
		};
	}

	if (
		errors &&
		errors.length === 1 &&
		errors[0] instanceof TransactionPendingError
	) {
		return {
			status: MultisignatureStatus.PENDING,
			errors,
		};
	}

	return {
		status: MultisignatureStatus.FAIL,
		errors: errors || [],
	};
};
