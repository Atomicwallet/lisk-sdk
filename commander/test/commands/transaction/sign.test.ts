/*
 * LiskHQ/lisk-commander
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
import { expect, test } from '@oclif/test';
import * as config from '../../../src/utils/config';
import * as printUtils from '../../../src/utils/print';
import * as inputModule from '../../../src/utils/input/utils';
import * as inputUtils from '../../../src/utils/input';

describe('transaction:sign', () => {
	const defaultTransaction = {
		type: 8,
		nonce: '0',
		fee: '10000000',
		senderPublicKey:
			'efaf1d977897cb60d7db9d30e8fd668dee070ac0db1fb8d184c06152a8b75f8d',
		asset: {
			recipientId: '18141291412139607230L',
			amount: '1234567890',
			data: 'random data',
		},
	};

	const invalidTransaction = 'invalid transaction';
	const defaultInputs = {
		passphrase:
			'wear protect skill sentence lift enter wild sting lottery power floor neglect',
	};

	const defaultSignedTransaction = {
		...defaultTransaction,
		senderId: '2129300327344985743L',
		signatures: [
			'483cc0efdb019d4910ea577d44d95f7115c4bfe179a26d3f8bbbca4d9141b38143d85219a5a9cb5eff712553e0ec2e2cf3f3b570fd841030aa7289b995a1c301',
		],
		id: '13361438474776003692',
	};

	const printMethodStub = sandbox.stub();
	const setupTest = () =>
		test
			.stub(printUtils, 'print', sandbox.stub().returns(printMethodStub))
			.stub(
				config,
				'getConfig',
				sandbox.stub().returns({ api: { network: 'test' } }),
			)
			.stub(
				inputUtils,
				'getInputsFromSources',
				sandbox.stub().resolves(defaultInputs),
			)
			.stdout();

	describe('transaction:sign', () => {
		setupTest()
			.stub(
				inputModule,
				'getStdIn',
				sandbox.stub().rejects(new Error('Timeout error')),
			)
			.command(['transaction:sign'])
			.catch(error => {
				return expect(error.message).to.contain('No transaction was provided.');
			})
			.it('should throw an error');
	});

	describe('transaction:sign transaction', () => {
		setupTest()
			.command(['transaction:sign', invalidTransaction])
			.catch(error => {
				return expect(error.message).to.contain(
					'Could not parse transaction JSON.',
				);
			})
			.it('should throw an error');

		setupTest()
			.command([
				'transaction:sign',
				JSON.stringify({
					...defaultTransaction,
					asset: { ...defaultTransaction.asset, amount: '-1' },
				}),
			])
			.catch(error => {
				return expect(error.message).to.contain(
					'Transaction: 2111182107947711760 failed at .asset.amount',
				);
			})
			.it('should throw an error when transaction is invalid');

		setupTest()
			.command(['transaction:sign', JSON.stringify(defaultTransaction)])
			.it('should take transaction from arg to sign', () => {
				expect(inputUtils.getInputsFromSources).to.be.calledWithExactly({
					passphrase: {
						source: undefined,
						repeatPrompt: true,
					},
				});
				return expect(printMethodStub).to.be.calledWithExactly(
					defaultSignedTransaction,
				);
			});
	});

	describe('transaction:sign transaction --passphrase=pass:xxx', () => {
		setupTest()
			.command([
				'transaction:sign',
				JSON.stringify(defaultTransaction),
				'--passphrase=pass:123',
			])
			.it(
				'should take transaction from arg and passphrase from flag to sign',
				() => {
					expect(inputUtils.getInputsFromSources).to.be.calledWithExactly({
						passphrase: {
							source: 'pass:123',
							repeatPrompt: true,
						},
					});
					return expect(printMethodStub).to.be.calledWithExactly(
						defaultSignedTransaction,
					);
				},
			);
	});

	describe('transaction | transaction:sign', () => {
		setupTest()
			.stub(inputModule, 'getStdIn', sandbox.stub().resolves({}))
			.command(['transaction:sign'])
			.catch(error => {
				return expect(error.message).to.contain('No transaction was provided.');
			})
			.it('should throw an error when stdin is empty');

		setupTest()
			.stub(
				inputModule,
				'getStdIn',
				sandbox.stub().resolves({ data: invalidTransaction }),
			)
			.command(['transaction:sign'])
			.catch(error => {
				return expect(error.message).to.contain(
					'Could not parse transaction JSON.',
				);
			})
			.it('should throw an error when std is an invalid JSON format');

		setupTest()
			.stub(
				inputModule,
				'getStdIn',
				sandbox.stub().resolves({ data: JSON.stringify(defaultTransaction) }),
			)
			.command(['transaction:sign'])
			.it('should take transaction from stdin and sign', () => {
				expect(inputUtils.getInputsFromSources).to.be.calledWithExactly({
					passphrase: {
						source: undefined,
						repeatPrompt: true,
					},
				});
				return expect(printMethodStub).to.be.calledWithExactly(
					defaultSignedTransaction,
				);
			});
	});

	describe('transaction | transaction:sign --passphrase=pass:xxx', () => {
		setupTest()
			.stub(
				inputModule,
				'getStdIn',
				sandbox.stub().resolves({ data: JSON.stringify(defaultTransaction) }),
			)
			.command(['transaction:sign', '--passphrase=pass:123'])
			.it(
				'should take transaction from stdin and sign with passphrase from flag',
				() => {
					expect(inputUtils.getInputsFromSources).to.be.calledWithExactly({
						passphrase: {
							source: 'pass:123',
							repeatPrompt: true,
						},
					});
					return expect(printMethodStub).to.be.calledWithExactly(
						defaultSignedTransaction,
					);
				},
			);
	});
});
