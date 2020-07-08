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
 */

import { when } from 'jest-when';
import { KVStore, NotFoundError } from '@liskhq/lisk-db';
import { getRandomBytes, getAddressFromPublicKey } from '@liskhq/lisk-cryptography';
import { TransferTransaction, BaseTransaction, VoteTransaction } from '@liskhq/lisk-transactions';
import {
	createValidDefaultBlock,
	defaultNetworkIdentifier,
	genesisBlock,
	defaultBlockHeaderAssetSchema,
} from '../utils/block';
import { Chain } from '../../src/chain';
import { StateStore } from '../../src/state_store';
import { DataAccess } from '../../src/data_access';
import {
	defaultAccountAssetSchema,
	createFakeDefaultAccount,
	defaultAccountSchema,
	genesisAccount,
	encodeDefaultAccount,
} from '../utils/account';
import { registeredTransactions } from '../utils/registered_transactions';
import { Block } from '../../src/types';
import { getTransferTransaction } from '../utils/transaction';
import { CHAIN_STATE_BURNT_FEE } from '../../src/constants';

jest.mock('events');
jest.mock('@liskhq/lisk-db');

describe('blocks/header', () => {
	const constants = {
		maxPayloadLength: 15 * 1024,
		activeDelegates: 101,
		rewardDistance: 3000000,
		rewardOffset: 2160,
		rewardMilestones: [
			'500000000', // Initial Reward
			'400000000', // Milestone 1
			'300000000', // Milestone 2
			'200000000', // Milestone 3
			'100000000', // Milestone 4
		],
		totalAmount: BigInt('10000000000000000'),
		blockTime: 10,
		epochTime: new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0)).toISOString(),
	};

	let chainInstance: Chain;
	let db: any;
	let block: Block;

	beforeEach(() => {
		db = new KVStore('temp');
		chainInstance = new Chain({
			db,
			genesisBlock,
			networkIdentifier: defaultNetworkIdentifier,
			registeredTransactions,
			accountAsset: {
				schema: defaultAccountAssetSchema,
				default: createFakeDefaultAccount().asset,
			},
			registeredBlocks: {
				0: defaultBlockHeaderAssetSchema,
				2: defaultBlockHeaderAssetSchema,
			},
			...constants,
		});
		(chainInstance as any)._lastBlock = genesisBlock;

		block = createValidDefaultBlock();
	});

	describe('#validateBlockHeader', () => {
		describe('when previous block property is invalid', () => {
			it('should throw error', () => {
				// Arrange
				block = createValidDefaultBlock({
					header: { previousBlockID: Buffer.alloc(0), height: 3 },
				} as any);
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow('Invalid previous block');
			});
		});

		describe('when signature is invalid', () => {
			it('should throw error', () => {
				// Arrange
				block = createValidDefaultBlock();
				(block.header as any).signature = getRandomBytes(64);
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow('Invalid block signature');
			});
		});

		describe('when reward is invalid', () => {
			it('should throw error', () => {
				// Arrange
				block = createValidDefaultBlock({
					header: { reward: BigInt(1000000000) },
				});
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow('Invalid block reward');
			});
		});

		describe('when a transaction included is invalid', () => {
			it('should throw error', () => {
				// Arrange
				const invalidTx = getTransferTransaction();
				(invalidTx.senderPublicKey as any) = '100';
				block = createValidDefaultBlock({ payload: [invalidTx] });
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow();
			});
		});

		describe('when payload length exceeds maximum allowed', () => {
			it('should throw error', () => {
				// Arrange
				(chainInstance as any).constants.maxPayloadLength = 100;
				const txs = new Array(200).fill(0).map(() => getTransferTransaction());
				block = createValidDefaultBlock({ payload: txs });
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow(
					'Payload length is too long',
				);
			});
		});

		describe('when transaction root is incorrect', () => {
			it('should throw error', () => {
				// Arrange
				const txs = new Array(20).fill(0).map(() => getTransferTransaction());
				block = createValidDefaultBlock({
					payload: txs,
					header: { transactionRoot: Buffer.from('1234567890') },
				});
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).toThrow('Invalid transaction root');
			});
		});

		describe('when all the value is valid', () => {
			it('should not throw error', () => {
				// Arrange
				const txs = new Array(20).fill(0).map(() => getTransferTransaction());
				block = createValidDefaultBlock({ payload: txs });
				// Act & assert
				expect(() => chainInstance.validateBlockHeader(block)).not.toThrow();
			});
		});
	});

	describe('#verify', () => {
		let stateStore: StateStore;

		beforeEach(() => {
			// Arrange
			const dataAccess = new DataAccess({
				db,
				accountSchema: defaultAccountSchema as any,
				registeredBlockHeaders: {
					0: defaultBlockHeaderAssetSchema,
					2: defaultBlockHeaderAssetSchema,
				},
				registeredTransactions: { 8: TransferTransaction },
				minBlockHeaderCache: 505,
				maxBlockHeaderCache: 309,
			});
			stateStore = new StateStore(dataAccess, {
				lastBlockHeaders: [],
				networkIdentifier: defaultNetworkIdentifier,
				lastBlockReward: BigInt(500000000),
				defaultAsset: createFakeDefaultAccount().asset,
			});
		});

		describe('when previous block id is invalid', () => {
			it('should not throw error', async () => {
				// Arrange
				block = createValidDefaultBlock({
					header: { previousBlockID: getRandomBytes(32) },
				});
				// Act & assert
				await expect(chainInstance.verify(block, stateStore)).rejects.toThrow(
					'Invalid previous block',
				);
			});
		});

		describe('when block slot is invalid', () => {
			it('should throw when block timestamp is in the future', async () => {
				// Arrange
				const futureTimestamp = chainInstance.slots.getSlotTime(chainInstance.slots.getNextSlot());
				block = createValidDefaultBlock({
					header: {
						timestamp: futureTimestamp,
						previousBlockID: genesisBlock.header.id,
					},
				});
				expect.assertions(1);
				// Act & Assert
				await expect(chainInstance.verify(block, stateStore)).rejects.toThrow(
					'Invalid block timestamp',
				);
			});

			it('should throw when block timestamp is earlier than lastBlock timestamp', async () => {
				// Arrange
				block = createValidDefaultBlock({
					header: { timestamp: 0, previousBlockID: genesisBlock.header.id },
				});
				expect.assertions(1);
				// Act & Assert
				await expect(chainInstance.verify(block, stateStore)).rejects.toThrow(
					'Invalid block timestamp',
				);
			});

			it('should throw when block timestamp is equal to the lastBlock timestamp', async () => {
				(chainInstance as any)._lastBlock = {
					...genesisBlock,
					timestamp: 200,
					receivedAt: new Date(),
				};
				// Arrange
				block = createValidDefaultBlock({
					header: {
						previousBlockID: chainInstance.lastBlock.header.id,
						height: chainInstance.lastBlock.header.height + 1,
						timestamp: chainInstance.lastBlock.header.timestamp - 10,
					},
				});
				// Act & Assert
				await expect(chainInstance.verify(block, stateStore)).rejects.toThrow(
					'Invalid block timestamp',
				);
			});
		});

		describe('when all values are valid', () => {
			it('should not throw error', async () => {
				// Arrange
				block = createValidDefaultBlock();
				// Act & assert
				let err;
				try {
					await chainInstance.verify(block, stateStore);
				} catch (error) {
					err = error;
				}
				expect(err).toBeUndefined();
			});
		});

		describe('when skip existing check is true and a transaction is not allowed', () => {
			let notAllowedTx;
			let txApplySpy: jest.SpyInstance;
			let originalClass: typeof BaseTransaction;

			beforeEach(() => {
				// Arrage
				notAllowedTx = getTransferTransaction();
				const transactionClass = (chainInstance as any).dataAccess._transactionAdapter._transactionClassMap.get(
					notAllowedTx.type,
				);
				originalClass = transactionClass;
				Object.defineProperty(transactionClass.prototype, 'matcher', {
					get: () => (): boolean => false,
					configurable: true,
				});
				(chainInstance as any).dataAccess._transactionAdapter._transactionClassMap.set(
					notAllowedTx.type,
					transactionClass,
				);
				txApplySpy = jest.spyOn(notAllowedTx, 'apply');
				block = createValidDefaultBlock({ payload: [notAllowedTx] });
			});

			afterEach(() => {
				Object.defineProperty(originalClass.prototype, 'matcher', {
					get: () => (): boolean => true,
					configurable: true,
				});
			});

			it('should not call apply for the transaction and throw error', async () => {
				// Arrange
				const dataAccess = new DataAccess({
					db,
					accountSchema: defaultAccountSchema as any,
					registeredBlockHeaders: {
						0: defaultBlockHeaderAssetSchema,
						2: defaultBlockHeaderAssetSchema,
					},
					registeredTransactions: { 8: TransferTransaction },
					minBlockHeaderCache: 505,
					maxBlockHeaderCache: 309,
				});
				stateStore = new StateStore(dataAccess, {
					lastBlockHeaders: [],
					networkIdentifier: defaultNetworkIdentifier,
					lastBlockReward: BigInt(500000000),
					defaultAsset: createFakeDefaultAccount().asset,
				});

				// Act && Assert
				await expect(chainInstance.verify(block, stateStore)).rejects.toMatchObject([
					expect.objectContaining({
						message: expect.stringContaining('is currently not allowed'),
					}),
				]);
				expect(txApplySpy).not.toHaveBeenCalled();
			});
		});

		describe('when skip existing check is true and transactions are valid', () => {
			let invalidTx;

			beforeEach(() => {
				// Arrage
				when(db.get)
					.calledWith(`accounts:address:${genesisAccount.address.toString('binary')}`)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: genesisAccount.address,
								balance: BigInt('1000000000000'),
							}),
						) as never,
					);

				invalidTx = getTransferTransaction();
				block = createValidDefaultBlock({ payload: [invalidTx] });
			});

			it('should not call apply for the transaction and throw error', async () => {
				// Act
				const dataAccess = new DataAccess({
					db,
					accountSchema: defaultAccountSchema as any,
					registeredBlockHeaders: {
						0: defaultBlockHeaderAssetSchema,
						2: defaultBlockHeaderAssetSchema,
					},
					registeredTransactions: { 8: TransferTransaction },
					minBlockHeaderCache: 505,
					maxBlockHeaderCache: 309,
				});
				stateStore = new StateStore(dataAccess, {
					lastBlockHeaders: [],
					networkIdentifier: defaultNetworkIdentifier,
					lastBlockReward: BigInt(500000000),
					defaultAsset: createFakeDefaultAccount().asset,
				});
				expect.assertions(1);
				let err;
				try {
					await chainInstance.verify(block, stateStore);
				} catch (errors) {
					err = errors;
				}
				expect(err).toBeUndefined();
			});
		});
	});

	describe('#apply', () => {
		describe('when block does not contain transactions', () => {
			let stateStore: StateStore;

			beforeEach(async () => {
				block = createValidDefaultBlock({
					header: { reward: BigInt(500000000) },
				});
				const dataAccess = new DataAccess({
					db,
					accountSchema: defaultAccountSchema as any,
					registeredBlockHeaders: {
						0: defaultBlockHeaderAssetSchema,
						2: defaultBlockHeaderAssetSchema,
					},
					registeredTransactions: { 8: TransferTransaction },
					minBlockHeaderCache: 505,
					maxBlockHeaderCache: 309,
				});
				stateStore = new StateStore(dataAccess, {
					lastBlockHeaders: [],
					networkIdentifier: defaultNetworkIdentifier,
					lastBlockReward: BigInt(500000000),
					defaultAsset: createFakeDefaultAccount().asset,
				});
				when(db.get)
					.calledWith(`accounts:address:${genesisAccount.address.toString('binary')}`)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: genesisAccount.address,
								balance: BigInt('1000000000000'),
							}),
						) as never,
					)
					.calledWith(
						`accounts:address:${getAddressFromPublicKey(block.header.generatorPublicKey).toString(
							'binary',
						)}`,
					)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: getAddressFromPublicKey(block.header.generatorPublicKey),
								balance: BigInt('0'),
							}),
						) as never,
					)
					.calledWith('chain:burntFee')
					.mockResolvedValue(Buffer.from(JSON.stringify('100')) as never);
				jest.spyOn(stateStore.chain, 'set');

				// Arrage
				await chainInstance.apply(block, stateStore);
			});

			it('should update generator balance to give rewards and fees - minFee', async () => {
				const generator = await stateStore.account.get(
					getAddressFromPublicKey(block.header.generatorPublicKey),
				);
				expect(generator.balance).toEqual(block.header.reward);
			});

			it('should not have updated burnt fee', () => {
				expect(stateStore.chain.set).not.toHaveBeenCalled();
			});
		});

		describe('when transaction is not applicable', () => {
			let validTx;
			let stateStore: StateStore;

			beforeEach(() => {
				// Arrage
				validTx = getTransferTransaction({ amount: BigInt(10000000) });
				block = createValidDefaultBlock({ payload: [validTx] });

				// Act
				const dataAccess = new DataAccess({
					db,
					accountSchema: defaultAccountSchema as any,
					registeredBlockHeaders: {
						0: defaultBlockHeaderAssetSchema,
						2: defaultBlockHeaderAssetSchema,
					},
					registeredTransactions: { 8: TransferTransaction },
					minBlockHeaderCache: 505,
					maxBlockHeaderCache: 309,
				});
				stateStore = new StateStore(dataAccess, {
					lastBlockHeaders: [],
					networkIdentifier: defaultNetworkIdentifier,
					lastBlockReward: BigInt(500000000),
					defaultAsset: createFakeDefaultAccount().asset,
				});

				const generatorAddress = getAddressFromPublicKey(block.header.generatorPublicKey);

				when(db.get)
					.calledWith(`accounts:address:${validTx.asset.recipientAddress.toString('binary')}`)
					.mockRejectedValue(new NotFoundError('data not found') as never)
					.calledWith(`accounts:address:${genesisAccount.address.toString('binary')}`)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: genesisAccount.address,
								balance: BigInt('0'),
							}),
						) as never,
					)
					.calledWith(`accounts:address:${generatorAddress.toString('hex')}`)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: generatorAddress,
								balance: BigInt('0'),
							}),
						) as never,
					);
			});

			it('should throw error', async () => {
				await expect(chainInstance.apply(block, stateStore)).rejects.toMatchObject([
					expect.objectContaining({
						message: expect.stringContaining('Account does not have enough minimum remaining LSK'),
					}),
				]);
			});

			it('should not set the block to the last block', () => {
				expect(chainInstance.lastBlock).toStrictEqual(genesisBlock);
			});
		});

		describe('when transactions are all valid', () => {
			const defaultBurntFee = '100';

			let stateStore: StateStore;
			let delegate1: any;
			let delegate2: any;
			let validTxApplySpy: jest.SpyInstance;
			let validTx2ApplySpy: jest.SpyInstance;

			beforeEach(async () => {
				// Arrage
				delegate1 = {
					address: Buffer.from('32e4d3f46ae3bc74e7771780eee290ae5826006d', 'hex'),
					passphrase:
						'weapon visual tag seed deal solar country toy boring concert decline require',
					publicKey: Buffer.from(
						'8c4dddbfe40892940d3bd5446d9d2ee9cdd16ceffecebda684a0585837f60f23',
						'hex',
					),
					username: 'genesis_200',
					balance: BigInt('10000000000'),
				};
				delegate2 = {
					address: Buffer.from('23d5abdb69c0dbbc21c7c732965589792cc5922a', 'hex'),
					passphrase:
						'shoot long boost electric upon mule enough swing ritual example custom party',
					publicKey: Buffer.from(
						'6263120d0ee380d60070e648684a7f98ece4767d140ccb277f267c3a6f36a799',
						'hex',
					),
					username: 'genesis_201',
					balance: BigInt('10000000000'),
				};

				// Act
				const validTx = new VoteTransaction({
					id: getRandomBytes(32),
					type: 8,
					fee: BigInt('10000000'),
					nonce: BigInt('0'),
					senderPublicKey: genesisAccount.publicKey,
					asset: {
						votes: [
							{
								delegateAddress: delegate1.address,
								amount: BigInt('10000000000'),
							},
							{
								delegateAddress: delegate2.address,
								amount: BigInt('10000000000'),
							},
						],
					},
					signatures: [],
				});
				validTx.sign(defaultNetworkIdentifier, genesisAccount.passphrase);
				// Calling validate to inject id and min-fee
				validTx.validate();
				const validTx2 = getTransferTransaction({
					nonce: BigInt(1),
					amount: BigInt('10000000'),
				});
				// Calling validate to inject id and min-fee
				validTx2.validate();
				validTxApplySpy = jest.spyOn(validTx, 'apply');
				validTx2ApplySpy = jest.spyOn(validTx2, 'apply');
				block = createValidDefaultBlock({
					header: { reward: BigInt(500000000) },
					payload: [validTx, validTx2],
				});
				// Act
				const dataAccess = new DataAccess({
					db,
					accountSchema: defaultAccountSchema as any,
					registeredBlockHeaders: {
						0: defaultBlockHeaderAssetSchema,
						2: defaultBlockHeaderAssetSchema,
					},
					registeredTransactions,
					minBlockHeaderCache: 505,
					maxBlockHeaderCache: 309,
				});
				stateStore = new StateStore(dataAccess, {
					lastBlockHeaders: [],
					networkIdentifier: defaultNetworkIdentifier,
					lastBlockReward: BigInt(500000000),
					defaultAsset: createFakeDefaultAccount().asset,
				});

				const burntFeeBuffer = Buffer.alloc(8);
				burntFeeBuffer.writeBigInt64BE(BigInt(defaultBurntFee));

				when(db.get)
					.mockRejectedValue(new NotFoundError('Data not found') as never)
					.calledWith(`accounts:address:${genesisAccount.address.toString('binary')}`)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: genesisAccount.address,
								balance: BigInt('1000000000000'),
							}),
						) as never,
					)
					.calledWith(
						`accounts:address:${getAddressFromPublicKey(block.header.generatorPublicKey).toString(
							'binary',
						)}`,
					)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								address: genesisAccount.address,
								balance: BigInt('0'),
								nonce: BigInt('0'),
							}),
						) as never,
					)
					.calledWith(
						// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
						`accounts:address:${delegate1.address.toString('binary')}`,
					)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								...delegate1,
								asset: { delegate: { username: delegate1.username } },
							}),
						) as never,
					)
					.calledWith(
						// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
						`accounts:address:${delegate2.address.toString('binary')}`,
					)
					.mockResolvedValue(
						encodeDefaultAccount(
							createFakeDefaultAccount({
								...delegate2,
								asset: { delegate: { username: delegate2.username } },
							}),
						) as never,
					)
					.calledWith('chain:burntFee')
					.mockResolvedValue(burntFeeBuffer as never);
				await chainInstance.apply(block, stateStore);
			});

			it('should call apply for the transaction', () => {
				expect(validTxApplySpy).toHaveBeenCalledTimes(1);
				expect(validTx2ApplySpy).toHaveBeenCalledTimes(1);
			});

			it('should update generator balance with rewards and fees - minFee', async () => {
				const generator = await stateStore.account.get(
					getAddressFromPublicKey(block.header.generatorPublicKey),
				);
				let expected = block.header.reward;
				for (const tx of block.payload) {
					expected += tx.fee - tx.minFee;
				}
				expect(generator.balance.toString()).toEqual(expected.toString());
			});

			it('should update burntFee in the chain state', async () => {
				const burntFee = await stateStore.chain.get(CHAIN_STATE_BURNT_FEE);
				let expected = BigInt(0);
				for (const tx of block.payload) {
					expected += tx.minFee;
				}
				const expectedBuffer = Buffer.alloc(8);
				expectedBuffer.writeBigInt64BE(BigInt(defaultBurntFee) + expected);
				expect(burntFee).toEqual(expectedBuffer);
			});
		});
	});
});
