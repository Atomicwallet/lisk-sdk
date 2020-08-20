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

import { testing } from '@liskhq/lisk-utils';
import { GenesisBlock, Account } from '@liskhq/lisk-chain';
import { DPOSAccountProps, DPoSModule } from '../../../../../src/modules/dpos';
import * as dataAccess from '../../../../../src/modules/dpos/data_access';
import * as delegates from '../../../../../src/modules/dpos/delegates';
import * as randomSeed from '../../../../../src/modules/dpos/random_seed';
import {
	AfterBlockApplyInput,
	AfterGenesisBlockApplyInput,
	GenesisConfig,
} from '../../../../../src';
import { Rounds } from '../../../../../src/modules/dpos/rounds';
import {
	createValidDefaultBlock,
	genesisBlock as createGenesisBlock,
} from '../../../../fixtures/blocks';
import Mock = jest.Mock;

jest.mock('../../../../../src/modules/dpos/data_access');
jest.mock('../../../../../src/modules/dpos/delegates');
jest.mock('../../../../../src/modules/dpos/random_seed');

const { StateStoreMock } = testing;

describe('DPoSModule', () => {
	let dposModule: DPoSModule;
	let genesisConfig: GenesisConfig;
	const reducerHandlerMock = { invoke: jest.fn() };

	beforeEach(() => {
		genesisConfig = {
			activeDelegates: 101,
			standbyDelegates: 2,
			delegateListRoundOffset: 3,
			baseFees: [
				{
					assetID: 0,
					baseFee: '1',
					moduleID: 3,
				},
			],
			bftThreshold: 67,
			blockTime: 10,
			communityIdentifier: 'lisk',
			maxPayloadLength: 15360,
			minFeePerByte: 1,
			rewards: {
				distance: 1,
				milestones: ['milestone'],
				offset: 2,
			},
		};
	});

	describe('constructor', () => {
		it('should create instance of module', () => {
			dposModule = new DPoSModule(genesisConfig);

			expect(dposModule).toBeInstanceOf(DPoSModule);
		});

		it('should have valid type', () => {
			dposModule = new DPoSModule(genesisConfig);

			expect(dposModule.id).toEqual(5);
		});

		it('should have valid name', () => {
			dposModule = new DPoSModule(genesisConfig);

			expect(dposModule.name).toEqual('dpos');
		});

		it('should have valid accountSchema', () => {
			dposModule = new DPoSModule(genesisConfig);

			expect(dposModule.accountSchema).toMatchSnapshot();
		});

		it('should throw error if "activeDelegates" is not available in genesis config', () => {
			delete genesisConfig.activeDelegates;

			expect(() => {
				// eslint-disable-next-line no-new
				new DPoSModule(genesisConfig);
			}).toThrow(
				'Lisk validator found 1 error[s]:\n' +
					"Missing property, should have required property 'activeDelegates'",
			);
		});

		it('should throw error if "activeDelegates" is zero in genesis config', () => {
			genesisConfig.activeDelegates = 0;

			expect(() => {
				// eslint-disable-next-line no-new
				new DPoSModule(genesisConfig);
			}).toThrow('Active delegates must have minimum 1');
		});

		it('should throw error if "activeDelegates" is less than "standbyDelegates"', () => {
			genesisConfig.activeDelegates = 5;
			genesisConfig.standbyDelegates = 6;

			expect(() => {
				// eslint-disable-next-line no-new
				new DPoSModule(genesisConfig);
			}).toThrow('Active delegates must be greater or equal to standby delegates');
		});

		it('should throw error if "standbyDelegates" is not available in genesis config', () => {
			delete genesisConfig.standbyDelegates;

			expect(() => {
				// eslint-disable-next-line no-new
				new DPoSModule(genesisConfig);
			}).toThrow(
				'Lisk validator found 1 error[s]:\n' +
					"Missing property, should have required property 'standbyDelegates'",
			);
		});

		it('should throw error if "delegateListRoundOffset" is not available in genesis config', () => {
			delete genesisConfig.delegateListRoundOffset;

			expect(() => {
				// eslint-disable-next-line no-new
				new DPoSModule(genesisConfig);
			}).toThrow(
				'Lisk validator found 1 error[s]:\n' +
					"Missing property, should have required property 'delegateListRoundOffset'",
			);
		});

		it('should create rounds object', () => {
			dposModule = new DPoSModule(genesisConfig);

			expect(dposModule.rounds).toBeInstanceOf(Rounds);
			expect(dposModule.rounds.blocksPerRound).toEqual(
				(genesisConfig.activeDelegates as number) + (genesisConfig.standbyDelegates as number),
			);
		});
	});

	describe('afterGenesisBlockApply', () => {
		let input: AfterGenesisBlockApplyInput<Account<DPOSAccountProps>>;

		beforeEach(() => {
			input = {
				genesisBlock: (createGenesisBlock() as unknown) as GenesisBlock<Account<DPOSAccountProps>>,
				stateStore: new StateStoreMock() as any,
				reducerHandler: reducerHandlerMock,
			};
		});

		it('should throw error if "initDelegates" list size is greater than blocksPerRound', async () => {
			genesisConfig.activeDelegates = 101;
			genesisConfig.standbyDelegates = 1;
			// Genesis block contains 103 init delegates
			dposModule = new DPoSModule(genesisConfig);

			expect(input.genesisBlock.header.asset.initDelegates).toHaveLength(103);
			await expect(dposModule.afterGenesisBlockApply(input)).rejects.toThrow(
				'Genesis block init delegates list is larger than allowed delegates per round',
			);
		});

		it('should throw error if "initDelegates" list contains an account which is not a delegate', async () => {
			dposModule = new DPoSModule(genesisConfig);
			const delegateAccount = input.genesisBlock.header.asset.accounts.find(a =>
				a.address.equals(input.genesisBlock.header.asset.initDelegates[0]),
			) as Account<DPOSAccountProps>;

			// Make that account a non-delegate
			delegateAccount.dpos.delegate.username = '';

			await expect(dposModule.afterGenesisBlockApply(input)).rejects.toThrow(
				'Genesis block init delegates list contain addresses which are not delegates',
			);
		});

		it('should set all registered delegates usernames', async () => {
			dposModule = new DPoSModule(genesisConfig);
			const allDelegates = input.genesisBlock.header.asset.accounts
				.filter(a => a.dpos.delegate.username !== '')
				.map(a => ({ address: a.address, username: a.dpos.delegate.username }));

			await dposModule.afterGenesisBlockApply(input);

			expect(dataAccess.setRegisteredDelegates).toBeCalledTimes(1);
			expect(dataAccess.setRegisteredDelegates).toBeCalledWith(input.stateStore, {
				registeredDelegates: allDelegates,
			});
		});
	});

	describe('afterBlockApply', () => {
		let input: AfterBlockApplyInput;

		beforeEach(() => {
			(randomSeed.generateRandomSeeds as Mock).mockReturnValue([]);
			input = {
				block: createValidDefaultBlock(),
				stateStore: new StateStoreMock({
					lastBlockHeaders: [createValidDefaultBlock({ header: { height: 10 } })],
				}) as any,
				reducerHandler: reducerHandlerMock,
				consensus: {
					getLastBootstrapHeight: jest.fn().mockReturnValue(5),
					getFinalizedHeight: jest.fn().mockReturnValue(0),
					getDelegates: jest.fn(),
					updateDelegates: jest.fn(),
				},
			};

			dposModule = new DPoSModule(genesisConfig);
		});

		describe('when finalized height changed', () => {
			it('should delete cache vote weight list', async () => {
				const round34 = 103 * 34;
				dposModule['_finalizedHeight'] = round34 - 5;
				// 34 rounds
				(input.consensus.getFinalizedHeight as Mock).mockReturnValue(round34);
				await dposModule.afterBlockApply(input);

				expect(dataAccess.deleteVoteWeightsUntilRound).toBeCalledTimes(1);
				expect(dataAccess.deleteVoteWeightsUntilRound).toBeCalledWith(
					34 - (genesisConfig.delegateListRoundOffset as number) - 3,
					input.stateStore,
				);
			});
		});

		describe('when finalized height not changed', () => {
			it('should not delete cache vote weight list', async () => {
				await dposModule.afterBlockApply(input);

				expect(dataAccess.deleteVoteWeightsUntilRound).not.toBeCalled();
			});
		});

		describe('when its bootstrap period', () => {
			const bootstrapRound = 50;

			beforeEach(() => {
				input.block = createValidDefaultBlock({ header: { height: 10 } });
				(input.consensus.getLastBootstrapHeight as Mock).mockReturnValue(bootstrapRound * 103);
			});

			it('should not update productivity', async () => {
				await dposModule.afterBlockApply(input);

				expect(delegates.updateDelegateProductivity).not.toBeCalled();
			});

			describe('when its not the last block of round', () => {
				beforeEach(async () => {
					input.block = createValidDefaultBlock({ header: { height: 10 * 103 - 1 } });

					await dposModule.afterBlockApply(input);
				});

				it('should not create vote weight', () => {
					expect(delegates.createVoteWeightsSnapshot).not.toBeCalled();
				});

				it('should not update validators', () => {
					expect(randomSeed.generateRandomSeeds).not.toBeCalled();
					expect(delegates.updateDelegateList).not.toBeCalled();
				});
			});

			describe('when its the last block of round and the last block of bootstrap period', () => {
				beforeEach(async () => {
					input.block = createValidDefaultBlock({ header: { height: bootstrapRound * 103 } });

					await dposModule.afterBlockApply(input);
				});

				it('should create vote weight', () => {
					expect(delegates.createVoteWeightsSnapshot).toBeCalledTimes(1);
					expect(delegates.createVoteWeightsSnapshot).toBeCalledWith({
						activeDelegates: genesisConfig.activeDelegates,
						standbyDelegates: genesisConfig.standbyDelegates,
						height: bootstrapRound * 103 + 1,
						stateStore: input.stateStore,
						round: bootstrapRound + (genesisConfig.delegateListRoundOffset as number) + 1,
					});
				});

				it('should update validators', () => {
					expect(randomSeed.generateRandomSeeds).toBeCalledTimes(1);
					expect(delegates.updateDelegateList).toBeCalledTimes(1);
				});
			});

			describe('when its the last block of round and not the last block of bootstrap period', () => {
				let blockRound: number;

				beforeEach(async () => {
					blockRound = bootstrapRound - 1;

					input.block = createValidDefaultBlock({ header: { height: blockRound * 103 } });

					await dposModule.afterBlockApply(input);
				});

				it('should create vote weight', () => {
					expect(delegates.createVoteWeightsSnapshot).toBeCalledTimes(1);
					expect(delegates.createVoteWeightsSnapshot).toBeCalledWith({
						activeDelegates: genesisConfig.activeDelegates,
						standbyDelegates: genesisConfig.standbyDelegates,
						height: blockRound * 103 + 1,
						stateStore: input.stateStore,
						round: blockRound + (genesisConfig.delegateListRoundOffset as number) + 1,
					});
				});

				it('should not update validators', () => {
					expect(randomSeed.generateRandomSeeds).not.toBeCalled();
					expect(delegates.updateDelegateList).not.toBeCalled();
				});
			});
		});

		describe('when its not bootstrap period', () => {
			const bootstrapRound = 5;

			beforeEach(() => {
				(input.consensus.getLastBootstrapHeight as Mock).mockReturnValue(bootstrapRound * 103);
			});

			describe('when its the last block of round', () => {
				let blockRound: number;

				beforeEach(async () => {
					blockRound = bootstrapRound + 1;

					input.block = createValidDefaultBlock({ header: { height: blockRound * 103 } });

					await dposModule.afterBlockApply(input);
				});

				it('should create vote weight', () => {
					expect(delegates.createVoteWeightsSnapshot).toBeCalledTimes(1);
					expect(delegates.createVoteWeightsSnapshot).toBeCalledWith({
						activeDelegates: genesisConfig.activeDelegates,
						standbyDelegates: genesisConfig.standbyDelegates,
						height: blockRound * 103 + 1,
						stateStore: input.stateStore,
						round: blockRound + (genesisConfig.delegateListRoundOffset as number) + 1,
					});
				});

				it('should update validators', () => {
					expect(randomSeed.generateRandomSeeds).toBeCalledTimes(1);
					expect(delegates.updateDelegateList).toBeCalledTimes(1);
				});
			});

			describe('when its not the last block of round', () => {
				beforeEach(async () => {
					input.block = createValidDefaultBlock({
						header: { height: (bootstrapRound + 1) * 103 + 3 },
					});

					await dposModule.afterBlockApply(input);
				});

				it('should not create vote weight', () => {
					expect(delegates.createVoteWeightsSnapshot).not.toBeCalled();
				});

				it('should not update validators', () => {
					expect(randomSeed.generateRandomSeeds).not.toBeCalled();
					expect(delegates.updateDelegateList).not.toBeCalled();
				});
			});
		});
	});
});
