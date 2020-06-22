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
export const transactionInterface = {
	required: ['getBytes', 'validate', 'apply', 'verifySignatures'],
	properties: {
		getBytes: {
			typeof: 'function',
		},
		validate: {
			typeof: 'function',
		},
		apply: {
			typeof: 'function',
		},
		verifySignatures: {
			typeof: 'function',
		},
	},
};

export const baseTransactionSchema = {
	$id: 'lisk/base-transaction',
	type: 'object',
	required: ['type', 'nonce', 'fee', 'senderPublicKey', 'asset'],
	properties: {
		type: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		nonce: {
			dataType: 'uint64',
			fieldNumber: 2,
		},
		fee: {
			dataType: 'uint64',
			fieldNumber: 3,
		},
		senderPublicKey: {
			dataType: 'bytes',
			fieldNumber: 4,
		},
		asset: {
			dataType: 'bytes',
			fieldNumber: 5,
		},
		signatures: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 6,
		},
	},
};
