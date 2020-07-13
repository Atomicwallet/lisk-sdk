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
import { Application } from 'lisk-framework';
import axios from 'axios';
import { callNetwork, createApplication, closeApplication, getURL } from './utils/application';

describe('Account endpoint', () => {
	let app: Application;
	const accountFixture = {
		address: 'nQFJsJYtRL/Aip9k1a/Otigdf7U=',
		balance: '0',
		nonce: '0',
		keys: {
			numberOfSignatures: 0,
			mandatoryKeys: [],
			optionalKeys: [],
		},
		asset: {
			delegate: {
				username: 'genesis_5',
				pomHeights: [],
				consecutiveMissedBlocks: 0,
				lastForgedHeight: 0,
				isBanned: false,
				totalVotesReceived: '1000000000000',
			},
			sentVotes: [
				{
					delegateAddress: 'nQFJsJYtRL/Aip9k1a/Otigdf7U=',
					amount: '1000000000000',
				},
			],
			unlocking: [],
		},
	};

	beforeAll(async () => {
		app = await createApplication('account_http_functional');
	});

	afterAll(async () => {
		await closeApplication(app);
	});

	describe('/api/accounts', () => {
		it('should respond with account when account found in db', async () => {
			const result = await axios.get(getURL('/api/accounts/nQFJsJYtRL%2FAip9k1a%2FOtigdf7U%3D'));
			expect(result.data).toEqual({ data: accountFixture });
			expect(result.status).toBe(200);
		});

		it('should respond with 404 and error message when account not found in db', async () => {
			const { response, status } = await callNetwork(
				axios.get(getURL('/api/accounts/nQFJsJYtRL%2FAip0k1a%2FOtigdf7U%3D')),
			);

			expect(status).toBe(404);
			expect(response).toEqual({
				errors: [
					{
						message: "Account with address 'nQFJsJYtRL/Aip0k1a/Otigdf7U=' was not found",
					},
				],
			});
		});

		it('should respond with 400 and error message when address param is not base64', async () => {
			const { response, status } = await callNetwork(axios.get(getURL('/api/accounts/-nein-no')));

			expect(status).toBe(400);
			expect(response).toEqual({
				errors: [{ message: 'The Address parameter should be a base64 string.' }],
			});
		});
	});
});
