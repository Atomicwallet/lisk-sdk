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
import { createApplication, closeApplication } from '../utils/application';

import { Application } from '../../../src';

describe('Application related actions', () => {
	let app: Application;

	beforeAll(async () => {
		app = await createApplication('actions-transactions');
	});

	afterAll(async () => {
		await closeApplication(app);
	});

	describe('getSchema', () => {
		it('should return schemas used to encode objects in framework', async () => {
			const frameworkSchemas = await app['_channel'].invoke('app:getSchema');
			expect(frameworkSchemas).toMatchSnapshot();
		});
	});

	describe('getNodeInfo', () => {
		it('should return node status and constants', async () => {
			const nodeStatusAndConstants = await app['_channel'].invoke('app:getNodeInfo');
			expect(nodeStatusAndConstants).toEqual(
				expect.objectContaining({
					height: expect.any(Number),
					version: expect.any(String),
					networkIdentifier: expect.any(String),
					networkVersion: expect.any(String),
					lastBlockID: expect.any(String),
					finalizedHeight: expect.any(Number),
					unconfirmedTransactions: expect.any(Number),
				}),
			);
		});
	});

	describe('getForgers', () => {
		it('should return forgers info with all properties', async () => {
			const forgersInfo = await app['_channel'].invoke('app:getForgers');
			expect(forgersInfo).toEqual(
				expect.objectContaining({
					address: expect.any(String),
					nextForgingTime: expect.any(Number),
					minActiveHeight: expect.any(Number),
					isConsensusParticipant: expect.any(Boolean),
				}),
			);
		});
	});
});
