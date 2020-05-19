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
import * as cryptography from '@liskhq/lisk-cryptography';
import { addTransactionFields } from '../helpers';
import { TransferTransaction } from '../../src';
import { getId } from '../../src/utils';
import * as transferFixture from '../../fixtures/transaction_network_id_and_change_order/transfer_transaction_validate.json';

// TODO: Update after updating protocol-specs
describe.skip('#getId', () => {
	const defaultTransaction = addTransactionFields(
		transferFixture.testCases[0].output,
	);
	const networkIdentifier =
		'e48feb88db5b5cf5ad71d93cdcd1d879b6d5ed187a36b0002cc34e0ef9883255';
	const validTestTransaction = new TransferTransaction({
		...defaultTransaction,
		networkIdentifier,
	});
	// Create tx id by validating
	validTestTransaction.validate();
	const defaultTransactionBytes = (validTestTransaction as any).getBytes();

	it('should return a valid id', () => {
		expect(getId(defaultTransactionBytes)).toEqual(validTestTransaction.id);
	});

	it('should call cryptography hash', () => {
		const cryptographyHashStub = jest
			.spyOn(cryptography, 'hash')
			.mockReturnValue(
				Buffer.from(
					'da63e78daf2096db8316a157a839c8b9a616d3ce6692cfe61d6d380a623a1902',
					'hex',
				),
			);

		getId(Buffer.from(defaultTransactionBytes, 'hex'));
		expect(cryptographyHashStub).toHaveBeenCalledTimes(1);
	});

	it('should call cryptography bufferToHex', () => {
		const cryptographybufferToIntAsStringStub = jest
			.spyOn(cryptography, 'bufferToHex')
			.mockReturnValue(
				'cb3ad8a0859fa1c6b6d6244b5dc3747a1a502baf58c77b3c8711d200553307ed',
			);

		getId(Buffer.from(defaultTransactionBytes, 'hex'));
		expect(cryptographybufferToIntAsStringStub).toHaveBeenCalledTimes(1);
	});
});
