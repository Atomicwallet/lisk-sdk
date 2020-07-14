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

import { when } from 'jest-when';

import {
	getAddressFromPublicKey,
	getPrivateAndPublicKeyFromPassphrase,
	hashOnion,
} from '@liskhq/lisk-cryptography';
import { codec } from '@liskhq/lisk-codec';
import { Forger } from '../../../../../../src/application/node/forger';
import {
	registeredHashOnionsStoreSchema,
	UsedHashOnionStoreObject,
	usedHashOnionsStoreSchema,
} from '../../../../../../src/application/node/forger/data_access';
import {
	DB_KEY_FORGER_REGISTERED_HASH_ONION_SEEDS,
	DB_KEY_FORGER_USED_HASH_ONION,
} from '../../../../../../src/application/node/forger/constant';
import * as genesisDelegates from './genesis_delegates.json';
import * as delegatesRoundsList from './delegates_rounds_list.json';
import { genesis } from '../../../../../fixtures/accounts';

const convertDelegateFixture = (delegates: typeof genesisDelegates.delegates) =>
	delegates.map(delegate => ({
		...delegate,
		address: Buffer.from(delegate.address, 'base64'),
		hashOnion: {
			...delegate.hashOnion,
			hashes: delegate.hashOnion.hashes.map(h => Buffer.from(h, 'base64')),
		},
	}));

describe('forger', () => {
	const testDelegate = genesisDelegates.delegates[0];
	const delegatesPerRound = 103;
	const forgingWaitThreshold = 2;

	let forgeModule: Forger;
	let loggerStub: any;
	let mockStrategy: any;
	let defaultPassword: string;
	let dbStub: any;
	let bftModuleStub: any;
	let chainModuleStub: any;
	let dposModuleStub: any;
	let transactionPoolModuleStub: any;
	let processorModuleStub: any;

	beforeEach(() => {
		loggerStub = {
			trace: jest.fn(),
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			fatal: jest.fn(),
		};
		mockStrategy = {
			getTransactionsForBlock: jest.fn().mockResolvedValue([]),
		};
		dbStub = {
			get: jest.fn(),
			put: jest.fn(),
		};
		bftModuleStub = {
			finalizedHeight: 1,
		};
		dposModuleStub = {
			getForgerAddressesForRound: jest.fn(),
			delegatesPerRound,
			rounds: {
				calcRound: jest.fn(),
			},
		};
		transactionPoolModuleStub = {
			getUnconfirmedTransactionList: jest.fn(),
		};
		chainModuleStub = {
			filterReadyTransactions: jest.fn().mockReturnValue([]),
			slots: {
				getSlotNumber: jest.fn(),
				getRealTime: jest.fn(),
				getSlotTime: jest.fn(),
			},
			dataAccess: {
				getAccountsByAddress: jest.fn().mockReturnValue([
					{
						address: testDelegate.address,
						asset: {
							delegate: {
								username: 'genesis_007',
							},
						},
					},
				]),
				getAccountsByPublicKey: jest.fn().mockReturnValue([
					{
						address: Buffer.from(testDelegate.address, 'base64'),
						asset: {
							delegate: {
								username: 'genesis_007',
							},
						},
					},
				]),
			},
		};
		processorModuleStub = {
			create: jest.fn(),
			process: jest.fn(),
		};

		forgeModule = new Forger({
			forgingStrategy: mockStrategy,
			maxPayloadLength: 15 * 1024,
			logger: loggerStub,
			db: dbStub,
			forgingDelegates: convertDelegateFixture(genesisDelegates.delegates),
			forgingForce: false,
			forgingDefaultPassword: testDelegate.password,
			forgingWaitThreshold,
			bftModule: bftModuleStub,
			dposModule: dposModuleStub,
			transactionPoolModule: transactionPoolModuleStub,
			chainModule: chainModuleStub,
			processorModule: processorModuleStub,
		});
	});

	describe('Forger', () => {
		describe('updateForgingStatus', () => {
			it('should return error with invalid password', async () => {
				await expect(
					forgeModule.updateForgingStatus(
						getAddressFromPublicKey(Buffer.from(testDelegate.publicKey, 'base64')),
						'Invalid password',
						true,
					),
				).rejects.toThrow('Invalid password and public key combination');
			});

			it('should return error with invalid publicKey', async () => {
				const invalidPublicKey = Buffer.from(
					'9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9fff0a',
				);
				const invalidAddress = getAddressFromPublicKey(invalidPublicKey);

				await expect(
					forgeModule.updateForgingStatus(invalidAddress, defaultPassword, true),
				).rejects.toThrow(`Delegate with address: ${invalidAddress.toString('base64')} not found`);
			});

			it('should return error with non delegate account', async () => {
				const invalidAddress = getAddressFromPublicKey(genesis.publicKey);
				await expect(
					forgeModule.updateForgingStatus(invalidAddress, genesis.password, true),
				).rejects.toThrow(`Delegate with address: ${invalidAddress.toString('base64')} not found`);
			});

			it('should update forging from enabled to disabled', async () => {
				// Arrange
				chainModuleStub.dataAccess.getAccountsByAddress.mockResolvedValue([
					{
						address: testDelegate.address,
						asset: {
							delegate: {
								username: 'genesis_001',
							},
						},
					},
				]);
				(forgeModule as any)._keypairs.set(
					getAddressFromPublicKey(Buffer.from(testDelegate.publicKey, 'base64')),
					Buffer.from('privateKey', 'utf8'),
				);

				// Act
				const data = await forgeModule.updateForgingStatus(
					getAddressFromPublicKey(Buffer.from(testDelegate.publicKey, 'base64')),
					testDelegate.password,
					false,
				);

				// Assert
				expect(
					(forgeModule as any)._keypairs.get(Buffer.from(testDelegate.address, 'base64')),
				).toBeUndefined();
				expect(data.address.toString('base64')).toEqual(testDelegate.address);
			});

			it('should update forging from disabled to enabled', async () => {
				const data = await forgeModule.updateForgingStatus(
					getAddressFromPublicKey(Buffer.from(testDelegate.publicKey, 'base64')),
					testDelegate.password,
					true,
				);

				expect(
					(forgeModule as any)._keypairs.get(Buffer.from(testDelegate.address, 'base64')),
				).not.toBeUndefined();
				expect(data.address.toString('base64')).toEqual(testDelegate.address);
			});
		});

		describe('loadDelegates', () => {
			const delegates = [
				{
					publicKey: Buffer.from(
						'9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f',
						'hex',
					),
					address: getAddressFromPublicKey(
						Buffer.from('9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f', 'hex'),
					),
					encryptedPassphrase:
						'iterations=1&salt=8c79d754416acccb567a42cf62b2e3bb&cipherText=73f5827fcd8eeab475abff71476cbce3b1ecacdeac55a738bb2f0a676d8e543bb92c91e1c1e3ddb6cef07a503f034dc7718e39657218d5a955859c5524be06de5954a5875b4c7b1cd11835e3477f1d04&iv=aac6a3b77c0594552bd9c932&tag=86231fb20e7b263264ca68b3585967ca&version=1',
					hashOnion: {
						count: 10,
						distance: 10,
						hashes: [Buffer.from('c50ed554ac69bbd1549d786459343625', 'hex')],
					},
				},
				{
					publicKey: Buffer.from(
						'141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a',
						'hex',
					),
					address: getAddressFromPublicKey(
						Buffer.from('141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a', 'hex'),
					),
					encryptedPassphrase:
						'iterations=1&salt=5c709afdae35d43d4090e9ef31d14d85&cipherText=c205189b91f797c3914f5d82ccc7cccfb3c620cef512c3bf8f50cd280bd5ff1450e8b9be997179582e62bec0cb655ca2eb8ff6833892f9e350dc5182b61bd648cd02f7f95468c7ec51aa3b43&iv=bfae7a255077c6de61a1ec59&tag=59cfd0a55d39a765a84725f4be464179&version=1',
					hashOnion: {
						count: 10,
						distance: 10,
						hashes: [Buffer.from('e8d91cbf913d7535bf473896e552da01', 'hex')],
					},
				},
				{
					publicKey: Buffer.from(
						'3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135',
						'hex',
					),
					address: getAddressFromPublicKey(
						Buffer.from('3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135', 'hex'),
					),
					encryptedPassphrase:
						'iterations=1&salt=588600600cd7660cf2346cd390093900&cipherText=6469aca1fe386e709c89c9a1d644abd969e64326f0f27f7be25248727892ec860e1e2dae54d283e65b1d21657a74047fb46ba732d1c83b93c8e2c0c96e98c2a9c4d87d0ac23db6dec9e3728426e3&iv=357d723a607f5baaf1fb218a&tag=f42bc3722b2964806d83a8ca3da2f94d&version=1',
					hashOnion: {
						count: 10,
						distance: 10,
						hashes: [Buffer.from('f479c5e45912908d919ac0a44479fa86', 'hex')],
					},
				},
			];

			let accountDetails: {
				readonly address: Buffer;
				readonly encryptedPassphrase: string;
			};

			beforeEach(() => {
				accountDetails = {
					address: getAddressFromPublicKey(
						Buffer.from('9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f'),
					),
					encryptedPassphrase:
						'salt=8c79d754416acccb567a42cf62b2e3bb&cipherText=73f5827fcd8eeab475abff71476cbce3b1ecacdeac55a738bb2f0a676d8e543bb92c91e1c1e3ddb6cef07a503f034dc7718e39657218d5a955859c5524be06de5954a5875b4c7b1cd11835e3477f1d04&iv=aac6a3b77c0594552bd9c932&tag=86231fb20e7b263264ca68b3585967ca&version=1',
				};

				(forgeModule as any)._config.forging.force = true;
				(forgeModule as any)._config.forging.delegates = [];
				chainModuleStub.dataAccess.getAccountsByAddress.mockResolvedValue([
					{
						address: Buffer.from(testDelegate.address, 'base64'),
						asset: {
							delegate: {
								username: 'genesis_002',
							},
						},
					},
				]);
				when(chainModuleStub.dataAccess.getAccountsByPublicKey)
					.calledWith([delegates[0].publicKey])
					.mockResolvedValue([
						{
							address: getAddressFromPublicKey(delegates[0].publicKey),
							asset: {
								delegate: {
									username: 'genesis_003',
								},
							},
						},
					] as never)
					.calledWith([delegates[1].publicKey])
					.mockResolvedValue([
						{
							address: getAddressFromPublicKey(delegates[1].publicKey),
							asset: {
								delegate: {
									username: 'genesis_004',
								},
							},
						},
					] as never)
					.calledWith([delegates[2].publicKey])
					.mockResolvedValue([
						{
							address: getAddressFromPublicKey(delegates[2].publicKey),
							asset: {
								delegate: {
									username: 'genesis_005',
								},
							},
						},
					] as never);
			});

			it('should not load any delegates when forging.force is false', async () => {
				(forgeModule as any)._config.forging.force = false;
				(forgeModule as any)._config.forging.delegates = delegates;

				await forgeModule.loadDelegates();
				return expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should not load any delegates when forging.delegates array is empty', async () => {
				(forgeModule as any)._config.forging.force = true;
				(forgeModule as any)._config.forging.delegates = [];

				await forgeModule.loadDelegates();
				return expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should not load any delegates when forging.delegates list is undefined', async () => {
				(forgeModule as any)._config.forging.delegates = undefined;

				await forgeModule.loadDelegates();
				return expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if number of iterations is omitted', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('should return error if number of iterations is incorrect', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('should return error if encrypted passphrase has no salt', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						...accountDetails,
						encryptedPassphrase:
							'iterations=1&cipherText=73f5827fcd8eeab475abff71476cbce3b1ecacdeac55a738bb2f0a676d8e543bb92c91e1c1e3ddb6cef07a503f034dc7718e39657218d5a955859c5524be06de5954a5875b4c7b1cd11835e3477f1d04&iv=aac6a3b77c0594552bd9c932&tag=86231fb20e7b263264ca68b3585967ca&version=1',
					},
				];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Encrypted passphrase to parse must have only one value per key.`,
				);
			});

			it('if encrypted passphrase has no salt forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has a modified salt', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('if encrypted passphrase has a modified salt forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has no cipher text', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						...accountDetails,
						encryptedPassphrase:
							'iterations=1&salt=8c79d754416acccb567a42cf62b2e3bb&iv=aac6a3b77c0594552bd9c932&tag=86231fb20e7b263264ca68b3585967ca&version=1',
					},
				];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Encrypted passphrase to parse must have only one value per key.`,
				);
			});

			it('if encrypted passphrase has no cipher text forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has a modified cipher text', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('if encrypted passphrase has a modified cipher text forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has no iv', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('if encrypted passphrase has no iv forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has a modified iv', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('if encrypted passphrase has a modified iv forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has no tag', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						...accountDetails,
						encryptedPassphrase:
							'iterations=1&salt=8c79d754416acccb567a42cf62b2e3bb&cipherText=73f5827fcd8eeab475abff71476cbce3b1ecacdeac55a738bb2f0a676d8e543bb92c91e1c1e3ddb6cef07a503f034dc7718e39657218d5a955859c5524be06de5954a5875b4c7b1cd11835e3477f1d04&iv=aac6a3b77c0594552bd9c932&version=1',
					},
				];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Encrypted passphrase to parse must have only one value per key.`,
				);
			});

			it('if encrypted passphrase has no tag forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has invalid tag', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Unsupported state or unable to authenticate data`,
				);
			});

			it('if encrypted passphrase has invalid tag forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if encrypted passphrase has shortened tag', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						...accountDetails,
						encryptedPassphrase:
							'iterations=1&salt=8c79d754416acccb567a42cf62b2e3bb&cipherText=73f5827fcd8eeab475abff71476cbce3b1ecacdeac55a738bb2f0a676d8e543bb92c91e1c1e3ddb6cef07a503f034dc7718e39657218d5a955859c5524be06de5954a5875b4c7b1cd11835e3477f1d04&iv=aac6a3b77c0594552bd9c932&tag=86231fb20e7b263264ca68b35859&version=1',
					},
				];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					`Invalid encryptedPassphrase for address: ${accountDetails.address.toString(
						'base64',
					)}. Tag must be 16 bytes.`,
				);
			});

			it('if encrypted passphrase has shortened tag forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('if publicKeys do not match forgeModule.keypairs should be empty', async () => {
				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should return error if account does not exist', async () => {
				const randomAccount = {
					passphrase: 'robust swift deputy enable forget peasant grocery road convince',
					publicKey: Buffer.from(
						'35b9364d1733e503599a1e9eefdb4994dd07bb9924acebfec06195cf1a0fa6db',
						'hex',
					),
					encryptedPassphrase:
						'iterations=1&salt=b51aba5a50cc44a8badd26bb89eb19c9&cipherText=9e345573201d8d064409deaa9d4125f85974c1309f7bd5087ea84b77cb0d46f1fc71b6f317bcd14de0f1cf76fd25293671273f57266876dc6afd4732b24db6&iv=ecc42c613ad6a72e4320231a&tag=7febd325fbcd7f81f3cd39f055ef356a&version=1',
				};
				accountDetails = {
					encryptedPassphrase: randomAccount.encryptedPassphrase,
					address: getAddressFromPublicKey(randomAccount.publicKey),
				};

				chainModuleStub.dataAccess.getAccountsByPublicKey.mockResolvedValue([]);

				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow(
					[
						'Account with public key:',
						randomAccount.publicKey.toString('base64'),
						'not found',
					].join(' '),
				);
			});

			it('if account does not exist forgeModule.keypairs should be empty', async () => {
				const randomAccount = {
					passphrase: 'robust swift deputy enable forget peasant grocery road convince',
					publicKey: Buffer.from(
						'35b9364d1733e503599a1e9eefdb4994dd07bb9924acebfec06195cf1a0fa6db',
						'hex',
					),
					encryptedPassphrase:
						'iterations=1&salt=b51aba5a50cc44a8badd26bb89eb19c9&cipherText=9e345573201d8d064409deaa9d4125f85974c1309f7bd5087ea84b77cb0d46f1fc71b6f317bcd14de0f1cf76fd25293671273f57266876dc6afd4732b24db6&iv=ecc42c613ad6a72e4320231a&tag=7febd325fbcd7f81f3cd39f055ef356a&version=1',
				};
				accountDetails = {
					encryptedPassphrase: randomAccount.encryptedPassphrase,
					address: getAddressFromPublicKey(randomAccount.publicKey),
				};

				chainModuleStub.dataAccess.getAccountsByPublicKey.mockResolvedValue([]);

				(forgeModule as any)._config.forging.delegates = [accountDetails];

				await expect(forgeModule.loadDelegates()).rejects.toThrow();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should ignore passphrases which do not belong to a delegate', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						encryptedPassphrase: genesis.encryptedPassphrase,
						address: getAddressFromPublicKey(genesis.publicKey),
						hashOnion: {
							count: 10,
							distance: 10,
							hashes: [Buffer.from('f479c5e45912908d919ac0a44479fa86', 'hex')],
						},
					},
				];
				chainModuleStub.dataAccess.getAccountsByPublicKey.mockResolvedValue([
					{
						address: genesis.address,
						asset: {
							delegate: {
								username: '',
							},
						},
					},
				]);

				await forgeModule.loadDelegates();
				expect(forgeModule['_keypairs'].values()).toHaveLength(0);
			});

			it('should load delegates in encrypted format with the key', async () => {
				(forgeModule as any)._config.forging.delegates = delegates;

				await forgeModule.loadDelegates();
				expect(forgeModule['_keypairs'].values()).toHaveLength(delegates.length);
			});

			it('should load delegates in encrypted format with the key with default 1e6 iterations if not set', async () => {
				(forgeModule as any)._config.forging.delegates = [
					{
						address: getAddressFromPublicKey(
							Buffer.from(
								'9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f',
								'hex',
							),
						),
						encryptedPassphrase:
							'salt=2a9e020d122c1209024b6e8403caf19c&cipherText=d284aeb944666a50acf2bd305b8c7079e20501604529cf89ccf58f5b26f266c5d82f164bc811d39c027bd88aed7e770ce921cf3f362ed3ff0f15a58b48a5646690fab5e9a23a21a799013618b7c59fbd&iv=4e539dfb9a44be708aa17837&tag=8edbb37ca097b772373da97ad00c33b3&version=1',
						hashOnion: {
							count: 10,
							distance: 5,
							hashes: [
								Buffer.from('c2d2e5afe00b6388d495365debab4a4e', 'hex'),
								Buffer.from('c04ecc8875400b2f51110f76cbb3dc28', 'hex'),
								Buffer.from('d6b7b63cbe08d8000edabb6c983048d4', 'hex'),
							],
						},
					},
					{
						address: getAddressFromPublicKey(
							Buffer.from(
								'141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a',
								'hex',
							),
						),
						encryptedPassphrase:
							'salt=ef9a589ad0a075ac193430695cc232d6&cipherText=67065a7f32cc2fda559c49c34d1263b90571adb36ddf6b733daa52bd6b69e406a302e04b8a48246bf7d617be0145a020c1d50e58bd9db1f825bf363699fe49148038d10d1b74bf42f8de6423&iv=fd598c901751805b524fd33f&tag=90bd6525ba1d23ea2983ccbbb3d87a10&version=1',
						hashOnion: {
							count: 10,
							distance: 10,
							hashes: [Buffer.from('e8d91cbf913d7535bf473896e552da01', 'hex')],
						},
					},
					{
						address: getAddressFromPublicKey(
							Buffer.from(
								'3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135',
								'hex',
							),
						),
						encryptedPassphrase:
							'salt=bed21effed5c283bb137a97077bfd7bf&cipherText=be1937d2aacf07a1f2134ad41d6e2eb0cced3c43ae34b04fba8104a3b19b0a9acf3228fbf1807f21d6ddce32fee226889e1f49f4e7a7b316395b09db7bb36b3aef34f4beef5ac519a2f2a9366227&iv=c22c6fd26486de0de00e5ad9&tag=82bea097c4f4f5fab5fe64c62a92ed89&version=1',
						hashOnion: {
							count: 10,
							distance: 10,
							hashes: [Buffer.from('f479c5e45912908d919ac0a44479fa86', 'hex')],
						},
					},
				];

				await forgeModule.loadDelegates();
				expect(forgeModule['_keypairs'].values()).toHaveLength(delegates.length);
			});

			it('should load all 101 delegates', async () => {
				for (const delegate of genesisDelegates.delegates) {
					when(chainModuleStub.dataAccess.getAccountsByPublicKey)
						.calledWith([Buffer.from(delegate.publicKey, 'base64')])
						.mockResolvedValue([
							{
								address: Buffer.from(delegate.address, 'base64'),
								asset: {
									delegate: {
										username: 'genesis_006',
									},
								},
							},
						] as never);
				}
				(forgeModule as any)._config.forging.delegates = genesisDelegates.delegates.map(
					delegate => ({
						encryptedPassphrase: delegate.encryptedPassphrase,
						address: Buffer.from(delegate.address, 'base64'),
						hashOnion: {
							...delegate.hashOnion,
							hashes: delegate.hashOnion.hashes.map(h => Buffer.from(h, 'base64')),
						},
					}),
				);

				await forgeModule.loadDelegates();
				expect(forgeModule['_keypairs'].values()).toHaveLength(103);
			});

			it('should update registered hash onion when seed is different', async () => {
				// Arrange
				const newSeed = Buffer.from('00000000000000000000000000000001', 'hex');
				const { publicKey } = delegates[0];
				const address = getAddressFromPublicKey(publicKey);
				const registeredHashOnions = {
					registeredHashOnions: [{ address, seedHash: newSeed }],
				};
				const registeredHashOnionsBuffer = codec.encode(
					registeredHashOnionsStoreSchema,
					registeredHashOnions,
				);

				(forgeModule as any)._config.forging.delegates = delegates;
				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_REGISTERED_HASH_ONION_SEEDS)
					.mockResolvedValue(registeredHashOnionsBuffer as never);

				// Act
				await forgeModule.loadDelegates();

				const originalKey: any = { registeredHashOnions: [] };
				for (const delegate of delegates) {
					originalKey.registeredHashOnions.push({
						address: getAddressFromPublicKey(delegate.publicKey),
						seedHash: delegate.hashOnion.hashes[delegate.hashOnion.hashes.length - 1],
					});
				}

				// Assert
				expect(loggerStub.warn).toHaveBeenCalledTimes(1);
				expect(loggerStub.warn).toHaveBeenCalledWith(
					expect.stringContaining('Overwriting with new hash onion'),
				);
				expect(dbStub.put).toHaveBeenCalledWith(
					DB_KEY_FORGER_REGISTERED_HASH_ONION_SEEDS,
					codec.encode(registeredHashOnionsStoreSchema, originalKey),
				);
			});

			it('should warn if hash onion used is at the last checkpoint', async () => {
				(forgeModule as any)._config.forging.delegates = delegates;
				const usedHashOnions: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: 8,
							height: 100,
							address: getAddressFromPublicKey(delegates[0].publicKey),
						},
					],
				};
				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(codec.encode(usedHashOnionsStoreSchema, usedHashOnions) as never);

				// Act
				await forgeModule.loadDelegates();

				// Assert
				expect(loggerStub.warn).toHaveBeenCalledTimes(1);
				expect(loggerStub.warn).toHaveBeenCalledWith(
					expect.any(Object),
					expect.stringContaining('Please update to the new hash onion'),
				);
			});

			it('should throw an error if all hash onion are used already', async () => {
				(forgeModule as any)._config.forging.delegates = delegates;
				const usedHashOnion: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: 10,
							height: 100,
							address: getAddressFromPublicKey(delegates[0].publicKey),
						},
					],
				};
				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(codec.encode(usedHashOnionsStoreSchema, usedHashOnion) as never);

				// Act
				await expect(forgeModule.loadDelegates()).rejects.toThrow('All of the hash onion is used');
			});
		});

		describe('forge', () => {
			let getSlotNumberStub: jest.MockInstance<unknown, any[]>;

			const lastBlock = {
				header: {
					id: Buffer.from('6846255774763267134'),
					height: 9187702,
					timestamp: 93716450,
				},
			};
			const currentSlot = 5;
			const lastBlockSlot = 4;
			const forgedBlock = {
				header: {
					height: 10,
					id: Buffer.from('1'),
					timestamp: Date.now(),
					reward: 1,
				},
			};

			beforeEach(() => {
				chainModuleStub.lastBlock = lastBlock;
				processorModuleStub.create.mockResolvedValue(forgedBlock);
				getSlotNumberStub = chainModuleStub.slots.getSlotNumber;

				when(getSlotNumberStub).calledWith(undefined).mockReturnValue(currentSlot);
				when(getSlotNumberStub)
					.calledWith(lastBlock.header.timestamp)
					.mockReturnValue(lastBlockSlot);
				(forgeModule as any)._keypairs[testDelegate.publicKey] = Buffer.from('privateKey', 'utf8');
			});

			it('should log message and return if current block slot is same as last block slot', async () => {
				when(getSlotNumberStub).calledWith(undefined).mockReturnValue(currentSlot);
				when(getSlotNumberStub).calledWith(lastBlock.header.timestamp).mockReturnValue(currentSlot);

				const data = await forgeModule.forge();

				expect(data).toBeUndefined();
				expect(loggerStub.trace).toHaveBeenCalledTimes(1);
				expect(loggerStub.trace).toHaveBeenCalledWith(
					{ slot: 5 },
					'Block already forged for the current slot',
				);
			});

			it('should log message and return if forgeModule._getDelegateKeypairForCurrentSlot failed', async () => {
				const rejectionError = new Error('CustomKeypairForCurrentError');
				jest
					.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot')
					.mockReturnValue(Promise.reject(rejectionError));

				await expect(forgeModule.forge()).rejects.toThrow();

				expect(loggerStub.error).toHaveBeenCalledTimes(1);
				expect(loggerStub.error).toHaveBeenLastCalledWith(
					{ err: rejectionError },
					'Skipping delegate slot',
				);
			});

			it('should log message and return if forgeModule._getDelegateKeypairForCurrentSlot return no result', async () => {
				jest
					.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot')
					.mockResolvedValue(undefined);

				const data = await forgeModule.forge();
				expect(data).toBeUndefined();
				expect(loggerStub.trace).toHaveBeenCalledTimes(1);
				expect(loggerStub.trace).toHaveBeenCalledWith(
					{ currentSlot: 5 },
					'Waiting for delegate slot',
				);
			});

			it('should wait for threshold time if last block not received', async () => {
				jest
					.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot')
					.mockResolvedValue(testDelegate);

				const currentSlotTime = new Date(2019, 0, 1, 0, 0, 0).getTime() / 1000;
				const currentTime = new Date(2019, 0, 1, 0, 0, 2).getTime();

				const dateNowMockFn = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime);

				chainModuleStub.slots.getSlotTime.mockReturnValue(currentSlotTime);

				const changedLastBlockSlot = currentSlot - 2;
				when(getSlotNumberStub)
					.calledWith(lastBlock.header.timestamp)
					.mockReturnValue(changedLastBlockSlot);

				await forgeModule.forge();
				expect(processorModuleStub.create).not.toHaveBeenCalled();
				expect(loggerStub.debug).toHaveBeenCalledWith(
					{
						currentSlot,
						lastBlockSlot: changedLastBlockSlot,
						waitThreshold: forgingWaitThreshold,
					},
					'Slot information',
				);

				dateNowMockFn.mockRestore();
			});

			it('should not wait if threshold time passed and last block not received', async () => {
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(testDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(testDelegate.privateKey, 'base64'),
				});
				const currentSlotTime = new Date(2019, 0, 1, 0, 0, 0).getTime();
				const currentTime = new Date(2019, 0, 1, 0, 0, 3).getTime();

				const dateNowMockFn = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime);

				const changedLastBlockSlot = currentSlot - 2;

				chainModuleStub.slots.getRealTime.mockReturnValue(currentSlotTime);
				when(getSlotNumberStub)
					.calledWith(lastBlock.header.timestamp)
					.mockReturnValue(changedLastBlockSlot);

				await forgeModule.forge();
				expect(processorModuleStub.create).toHaveBeenCalledTimes(1);

				dateNowMockFn.mockRestore();
			});

			it('should not wait if threshold remaining but last block already received', async () => {
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(testDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(testDelegate.privateKey, 'base64'),
				});
				const currentSlotTime = new Date(2019, 0, 1, 0, 0, 0).getTime();
				const currentTime = new Date(2019, 0, 1, 0, 0, 1).getTime();

				const dateNowMockFn = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime);

				const lastBlockSlotChanged = currentSlot - 1;
				chainModuleStub.slots.getRealTime.mockReturnValue(currentSlotTime);
				when(getSlotNumberStub)
					.calledWith(lastBlock.header.timestamp)
					.mockReturnValue(lastBlockSlotChanged);

				await forgeModule.forge();
				expect(processorModuleStub.create).toHaveBeenCalledTimes(1);

				dateNowMockFn.mockRestore();
			});

			it('should get transactions from the forging strategy', async () => {
				// Arrange
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(testDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(testDelegate.privateKey, 'base64'),
				});

				// Act
				await forgeModule.forge();

				// Assert
				expect(mockStrategy.getTransactionsForBlock).toHaveBeenCalledTimes(1);
			});

			it('should set the seedReveal to the next hash onion', async () => {
				// Arrange
				const targetDelegate = genesisDelegates.delegates[0];
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(testDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(testDelegate.privateKey, 'base64'),
				});
				(forgeModule as any)._config.forging.delegates = convertDelegateFixture(
					genesisDelegates.delegates,
				);

				const usedHashOnion: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: 5,
							height: 9,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
						{
							count: 6,
							height: 12,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
					],
				};

				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(codec.encode(usedHashOnionsStoreSchema, usedHashOnion) as never);

				// Act
				await forgeModule.forge();
				const seed = targetDelegate.hashOnion.hashes[1];
				// Assert
				const hashes = hashOnion(Buffer.from(seed, 'base64'), targetDelegate.hashOnion.distance, 1);
				expect(processorModuleStub.create).toHaveBeenCalledTimes(1);
				expect(processorModuleStub.create).toHaveBeenCalledWith(
					expect.objectContaining({
						seedReveal: hashes[7],
					}),
				);
			});

			it('should update the used hash onion', async () => {
				// Arrange
				const targetDelegate = genesisDelegates.delegates[0];
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(targetDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(targetDelegate.privateKey, 'base64'),
				});
				(forgeModule as any)._config.forging.delegates = convertDelegateFixture(
					genesisDelegates.delegates,
				);

				const usedHashOnionInput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: 5,
							height: 9,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
						{
							count: 6,
							height: 12,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
					],
				};
				const usedHashOnionInputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionInput,
				);

				const usedHashOnionOutput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 5,
							height: 9,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 6,
							height: 12,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 7,
							height: lastBlock.header.height + 1,
						},
					],
				};
				const usedHashOnionOutputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionOutput,
				);

				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(usedHashOnionInputBuffer as never);

				// Act
				await forgeModule.forge();
				// Assert
				expect(dbStub.put).toHaveBeenCalledWith(
					DB_KEY_FORGER_USED_HASH_ONION,
					usedHashOnionOutputBuffer,
				);
			});

			it('should overwrite the used hash onion when forging the same height', async () => {
				const targetDelegate = genesisDelegates.delegates[0];
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(targetDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(targetDelegate.privateKey, 'base64'),
				});
				(forgeModule as any)._config.forging.delegates = convertDelegateFixture(
					genesisDelegates.delegates,
				);

				const usedHashOnionInput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: 5,
							height: 9,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
						{
							count: 6,
							height: 12,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
						{
							count: 7,
							height: lastBlock.header.height + 1,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
					],
				};
				const usedHashOnionInputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionInput,
				);
				const usedHashOnionOutput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 5,
							height: 9,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 6,
							height: 12,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 7,
							height: lastBlock.header.height + 1,
						},
					],
				};
				const usedHashOnionOutputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionOutput,
				);

				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(usedHashOnionInputBuffer as never);

				// Act
				await forgeModule.forge();
				// Assert
				expect(dbStub.put).toHaveBeenCalledWith(
					DB_KEY_FORGER_USED_HASH_ONION,
					usedHashOnionOutputBuffer,
				);
			});

			it('should remove all used hash onions before finality height', async () => {
				// Arrange
				const targetDelegate = genesisDelegates.delegates[0];
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(targetDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(targetDelegate.privateKey, 'base64'),
				});
				(forgeModule as any)._config.forging.delegates = convertDelegateFixture(
					genesisDelegates.delegates,
				);

				const usedHashOnionInput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 5,
							height: 9,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 6,
							height: 412,
						},
					],
				};
				const usedHashOnionInputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionInput,
				);

				const usedHashOnionOutput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 6,
							height: 412,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 7,
							height: lastBlock.header.height + 1,
						},
					],
				};
				const usedHashOnionOutputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionOutput,
				);

				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(usedHashOnionInputBuffer as never);
				(forgeModule as any)._bftModule.finalizedHeight = 318;

				// Act
				await forgeModule.forge();
				// Assert
				expect(dbStub.put).toHaveBeenCalledWith(
					DB_KEY_FORGER_USED_HASH_ONION,
					usedHashOnionOutputBuffer,
				);
			});

			it('should use random seedReveal when all seedReveal are used', async () => {
				const targetDelegate = genesisDelegates.delegates[0];
				jest.spyOn(forgeModule as any, '_getDelegateKeypairForCurrentSlot').mockResolvedValue({
					publicKey: Buffer.from(targetDelegate.publicKey, 'base64'),
					privateKey: Buffer.from(targetDelegate.privateKey, 'base64'),
				});
				(forgeModule as any)._config.forging.delegates = convertDelegateFixture(
					genesisDelegates.delegates,
				);
				const maxCount = (forgeModule as any)._config.forging.delegates.find(
					(d: { publicKey: Buffer }) => d.publicKey.toString('base64') === targetDelegate.publicKey,
				).hashOnion.count;

				const usedHashOnionInput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							count: maxCount,
							height: 10,
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
						},
					],
				};
				const usedHashOnionInputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionInput,
				);

				const usedHashOnionOutput: UsedHashOnionStoreObject = {
					usedHashOnions: [
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: maxCount,
							height: 10,
						},
						{
							address: getAddressFromPublicKey(Buffer.from(targetDelegate.publicKey, 'base64')),
							count: 0,
							height: lastBlock.header.height + 1,
						},
					],
				};
				const usedHashOnionOutputBuffer = codec.encode(
					usedHashOnionsStoreSchema,
					usedHashOnionOutput,
				);

				when(dbStub.get)
					.calledWith(DB_KEY_FORGER_USED_HASH_ONION)
					.mockResolvedValue(usedHashOnionInputBuffer as never);

				// Act
				await forgeModule.forge();
				// Assert
				expect(loggerStub.warn).toHaveBeenCalledWith(
					'All of the hash onion has been used already. Please update to the new hash onion.',
				);
				expect(dbStub.put).toHaveBeenCalledWith(
					DB_KEY_FORGER_USED_HASH_ONION,
					usedHashOnionOutputBuffer,
				);
			});
		});
	});

	describe('forgeModule._getDelegateKeypairForCurrentSlot', () => {
		const genesis1 = {
			passphrase:
				'robust swift grocery peasant forget share enable convince deputy road keep cheap',
			publicKey: Buffer.from(
				'9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f',
				'hex',
			),
		};

		const genesis2 = {
			passphrase: 'weapon van trap again sustain write useless great pottery urge month nominee',
			publicKey: Buffer.from(
				'141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a',
				'hex',
			),
		};

		const genesis3 = {
			passphrase: 'course genuine appear elite library fabric armed chat pipe scissors mask novel',
			publicKey: Buffer.from(
				'3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135',
				'hex',
			),
		};

		let genesis1Keypair: { publicKey: any; privateKey: any };
		let genesis2Keypair: { publicKey: any; privateKey: any };
		let genesis3Keypair: { publicKey: any; privateKey: any };

		beforeEach(() => {
			const genesis1KeypairBuffer = getPrivateAndPublicKeyFromPassphrase(genesis1.passphrase);
			genesis1Keypair = {
				publicKey: genesis1KeypairBuffer.publicKey,
				privateKey: genesis1KeypairBuffer.privateKey,
			};
			const genesis2KeypairBuffer = getPrivateAndPublicKeyFromPassphrase(genesis2.passphrase);
			genesis2Keypair = {
				publicKey: genesis2KeypairBuffer.publicKey,
				privateKey: genesis2KeypairBuffer.privateKey,
			};
			const genesis3KeypairBuffer = getPrivateAndPublicKeyFromPassphrase(genesis3.passphrase);
			genesis3Keypair = {
				publicKey: genesis3KeypairBuffer.publicKey,
				privateKey: genesis3KeypairBuffer.privateKey,
			};

			(forgeModule as any)._keypairs.set(
				getAddressFromPublicKey(genesis1.publicKey),
				genesis1Keypair,
			);
			(forgeModule as any)._keypairs.set(
				getAddressFromPublicKey(genesis2.publicKey),
				genesis2Keypair,
			);
			(forgeModule as any)._keypairs.set(
				getAddressFromPublicKey(genesis3.publicKey),
				genesis3Keypair,
			);
		});

		it('should return genesis_1 keypair for slot N where (N % 101 === 35) in the first round', async () => {
			// For round 1, delegates genesis_1, genesis_2 and genesis_3 should forge for slots 35, 53 and 16 respectively.
			const currentSlot = 35;
			const round = 1;

			when(dposModuleStub.getForgerAddressesForRound)
				.calledWith(round)
				.mockResolvedValue(
					delegatesRoundsList[round].map(pk =>
						getAddressFromPublicKey(Buffer.from(pk, 'base64')),
					) as never,
				);

			const {
				publicKey,
				privateKey,
			} = await (forgeModule as any)._getDelegateKeypairForCurrentSlot(currentSlot, round);
			expect(publicKey).toBe(genesis1Keypair.publicKey);
			expect(privateKey).toBe(genesis1Keypair.privateKey);
		});

		it('should return genesis_2 keypair for slot N where (N % 101 === 73) in the second round', async () => {
			// For round 2, delegates genesis_1, genesis_2 and genesis_3 should forge for slots 50, 73 and 100 respectively.
			const currentSlot = 578;
			const round = 2;

			dposModuleStub.getForgerAddressesForRound.mockResolvedValue(
				delegatesRoundsList[round].map(pk => getAddressFromPublicKey(Buffer.from(pk, 'base64'))),
			);

			const {
				publicKey,
				privateKey,
			} = await (forgeModule as any)._getDelegateKeypairForCurrentSlot(currentSlot, round);
			expect(publicKey).toBe(genesis2Keypair.publicKey);
			expect(privateKey).toBe(genesis2Keypair.privateKey);
		});

		it('should return genesis_3 keypair for slot N where (N % 101 === 41) in the third round', async () => {
			// For round 3, delegates genesis_1, genesis_2 and genesis_3 should forge for slots 12, 16 and 41 respectively.
			const currentSlot = 1051;
			const round = 3;

			dposModuleStub.getForgerAddressesForRound.mockResolvedValue(
				delegatesRoundsList[round].map(pk => getAddressFromPublicKey(Buffer.from(pk, 'base64'))),
			);

			const {
				publicKey,
				privateKey,
			} = await (forgeModule as any)._getDelegateKeypairForCurrentSlot(currentSlot, round);
			expect(publicKey).toBe(genesis3Keypair.publicKey);
			expect(privateKey).toBe(genesis3Keypair.privateKey);
		});

		it('should return null when the slot does not belong to a public key set in keypairs', async () => {
			// For round 4, delegates genesis_1, genesis_2 and genesis_3 should forge for slots 93, 68 and 87 respectively.
			// Any other slot should return null as genesis_1, genesis_2 and genesis_3 are the only one forging delegates set for this test
			const currentSlot = 1;
			const round = 4;

			dposModuleStub.getForgerAddressesForRound.mockResolvedValue(
				delegatesRoundsList[round].map(pk => getAddressFromPublicKey(Buffer.from(pk, 'base64'))),
			);

			const keyPair = await (forgeModule as any)._getDelegateKeypairForCurrentSlot(
				currentSlot,
				round,
			);
			expect(keyPair).toBeUndefined();
		});

		it('should return error when `getForgerAddressesForRound` fails', async () => {
			const currentSlot = 1;
			const round = 4;

			const expectedError = new Error('getForgerAddressesForRound error');

			dposModuleStub.getForgerAddressesForRound.mockReturnValue(Promise.reject(expectedError));

			await expect(
				(forgeModule as any)._getDelegateKeypairForCurrentSlot(currentSlot, round),
			).rejects.toThrow(expectedError);
		});
	});
});
