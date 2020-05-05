/*
 * Copyright © 2020 Lisk Foundation
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
 */

import { transfer, utils } from '@liskhq/lisk-transactions';
import { nodeUtils, storageUtils, configUtils } from '../../../../../../utils';
import { accounts } from '../../../../../../fixtures';

const { convertLSKToBeddows } = utils;
const { genesis } = accounts;

describe('Transaction pool', () => {
	const dbName = 'transaction_pool';
	let storage: any;
	let node: any;

	beforeAll(async () => {
		storage = new storageUtils.StorageSandbox(
			configUtils.storageConfig({ database: dbName }),
			dbName,
		);
		await storage.bootstrap();
		node = await nodeUtils.createAndLoadNode(storage);
	});

	afterAll(async () => {
		await node.cleanup();
		await storage.cleanup();
	});

	describe('given a valid transaction while forging is disabled', () => {
		let transaction: any;

		beforeAll(async () => {
			const genesisAccount = await node.chain.dataAccess.getAccountByAddress(
				genesis.address,
			);
			const account = nodeUtils.createAccount();
			transaction = transfer({
				nonce: genesisAccount.nonce.toString(),
				networkIdentifier: node.networkIdentifier,
				fee: convertLSKToBeddows('0.002'),
				recipientId: account.address,
				amount: convertLSKToBeddows('1000'),
				passphrase: genesis.passphrase,
			});
			await node.transport.handleEventPostTransaction({ transaction });
		});

		describe('when transaction is pass to the transaction pool', () => {
			it('should be added to the transaction pool', () => {
				expect(node.transactionPool.contains(transaction.id)).toBeTrue();
			});

			// TODO: Fix this test after implementing expireTransactions
			// eslint-disable-next-line jest/no-disabled-tests
			it.skip('should expire after X sec', async () => {
				const tx = node.transactionPool.get(transaction.id);
				// Mutate received at to be expired (3 hours + 1s)
				tx.receivedAt = new Date(Date.now() - 10801000);
				// Forcefully call expire
				await node.transactionPool.pool.expireTransactions();
				expect(node.transactionPool.contains(transaction.id)).toBeFalse();
			});
		});
	});
});
