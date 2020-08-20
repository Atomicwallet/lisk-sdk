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
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { LiskValidationError } from '@liskhq/lisk-validator';
import { codec } from '@liskhq/lisk-codec';
import {
	getRandomBytes,
	getPrivateAndPublicKeyFromPassphrase,
	hash,
	getAddressFromPublicKey,
	signDataWithPassphrase,
} from '@liskhq/lisk-cryptography';
import { Account, GenesisBlock, Transaction, transactionSchema } from '@liskhq/lisk-chain';
import { objects as ObjectUtils } from '@liskhq/lisk-utils';
import { KeysModule } from '../../../../../src/modules/keys/keys_module';
import {
	createFakeDefaultAccount,
	StateStoreMock,
	defaultNetworkIdentifier,
} from '../../../../utils/node';
import * as fixtures from './fixtures.json';
import { GenesisConfig } from '../../../../../src';
import { genesisBlock as createGenesisBlock } from '../../../../fixtures/blocks';
import { AccountKeys } from '../../../../../src/modules/keys/types';

describe('keys module', () => {
	let decodedMultiSignature: any;
	let validTestTransaction: any;
	let targetMultisigAccount: any;
	let stateStore: any;
	let keysModule: KeysModule;
	let reducerHandler: any;
	let decodedBaseTransaction: any;
	let singleSignatureAccount: any;
	let passphrase: any;
	let passphraseDerivedKeys: any;

	const { cloneDeep } = ObjectUtils;

	const defualtTestCase = fixtures.testCases[0];

	const genesisConfig: GenesisConfig = {
		baseFees: [
			{
				assetID: 0,
				baseFee: '1',
				moduleType: 3,
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

	beforeEach(() => {
		keysModule = new KeysModule(genesisConfig);
		const buffer = Buffer.from(defualtTestCase.output.transaction, 'base64');
		const id = hash(buffer);
		decodedBaseTransaction = codec.decode<Transaction>(transactionSchema, buffer);
		decodedMultiSignature = {
			...decodedBaseTransaction,
			id,
		};
		validTestTransaction = new Transaction(decodedMultiSignature);

		targetMultisigAccount = createFakeDefaultAccount({
			address: Buffer.from(defualtTestCase.input.account.address, 'base64'),
			balance: BigInt('94378900000'),
		});

		passphrase = Mnemonic.generateMnemonic();
		passphraseDerivedKeys = getPrivateAndPublicKeyFromPassphrase(passphrase);
		const address = getAddressFromPublicKey(passphraseDerivedKeys.publicKey);

		singleSignatureAccount = createFakeDefaultAccount({ address });

		stateStore = new StateStoreMock();

		stateStore.account = {
			get: jest.fn().mockResolvedValue(targetMultisigAccount),
			getOrDefault: jest.fn().mockResolvedValue(
				createFakeDefaultAccount({
					address: Buffer.from(defualtTestCase.input.account.address, 'base64'),
				}) as never,
			),
		};

		reducerHandler = {};
	});

	describe('beforeTransactionApply', () => {
		describe('Multi-signature registration transaction', () => {
			it('should not throw for valid transaction', async () => {
				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: validTestTransaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should throw if number of provided signatures is smaller than number of optional, mandatory and sender keys', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// remove one signature making the registration asset invalid
				invalidTransaction.signatures.pop();

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error('There are missing signatures. Expected: 5 signatures but got: 4.'),
				);
			});

			it('should throw if number of provided signatures is bigger than number of optional, mandatory and sender keys', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// add one signature making the registration asset invalid
				invalidTransaction.signatures.push(getRandomBytes(32));

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error('There are missing signatures. Expected: 5 signatures but got: 6.'),
				);
			});

			it('should throw if any of the signatures is empty', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// this is the first mandatory signature we set it to an empty buffer
				invalidTransaction.signatures[1] = Buffer.from('');

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error('A valid signature is required for each registered key.'),
				);
			});

			it('should throw error if any of the mandatory signatures is not valid', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// this is the first mandatory signature from the fixture; we change a byte
				invalidTransaction.signatures[1][10] = 10;

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						"Failed to validate signature '3myu7/4VBi/m/gr/V1nXFTO80a9ndZ+7mM0lv9m81CfmJiWneNnJ5mVkaEfDcAK7g0KfkGczwUTKnzb7Wlw+BQ==' for transaction with id '0uM910NbJpiK3LgYj6STQAN09MxfJnKGjkXYjME3cRg='",
					),
				);
			});

			it('should throw error if any of the optional signatures is not valid', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// this is the first optional signature from the fixture; we change a byte
				invalidTransaction.signatures[3][10] = 9;

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						"Failed to validate signature 'HBBoFdFZusEi+gmRDRCRHJa5U10zkf4lc6whdaqqYnn1wjZkuc9mzIYinsREFK30q8MVpQF91HOh7/zcao1sDw==' for transaction with id 'QGBPNpD0ubTtZss+Ci5xNlDSniS3/D7P+bQxq4d4/+A='",
					),
				);
			});

			it('should throw error if mandatory signatures are not in order', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// Swap mandatory keys
				[invalidTransaction.signatures[1], invalidTransaction.signatures[2]] = [
					invalidTransaction.signatures[2],
					invalidTransaction.signatures[1],
				];

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						"Failed to validate signature 'qZt+mbegQn+dohrZsVfmVISkX+x3V7n4+ZCXmyixpwE6zxeiDIfUFige2Wpd9mLmzrt/ZKY5xLJ6pXEKBIMhCw==' for transaction with id '6ftLshO2zqVil4zUIqVZfxAoeQfy19AHAk4JIzntoxk='",
					),
				);
			});

			it('should throw error if optional signatures are not in order', async () => {
				const invalidTransaction = {
					...validTestTransaction,
					signatures: [...validTestTransaction.signatures],
				};

				// Swap optional keys
				[invalidTransaction.signatures[3], invalidTransaction.signatures[4]] = [
					invalidTransaction.signatures[4],
					invalidTransaction.signatures[3],
				];

				const invalidTransactionInstance = new Transaction(invalidTransaction);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction: invalidTransactionInstance as any,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						"Failed to validate signature '25OKrycZqAAXhE8ZaONc6ScSTc98BKCw2SaKp8mtHOUOYZBcG7ipArmC4lNDwjL65fBs2Ci30RylPxiCDq2MCA==' for transaction with id 'cbHb8mt8DpG8sf6VcMwIdaphbeSjuSf8VEBFvfN4ibw='",
					),
				);
			});
		});

		describe('Transaction from single signatures account', () => {
			it('should not throw for valid transaction', async () => {
				const transaction = new Transaction({
					moduleType: 2,
					assetID: 0,
					nonce: BigInt('0'),
					fee: BigInt('100000000'),
					senderPublicKey: passphraseDerivedKeys.publicKey,
					asset: getRandomBytes(100),
					signatures: [],
				});

				const signature = signDataWithPassphrase(
					Buffer.concat([Buffer.from(defaultNetworkIdentifier, 'hex'), transaction.getBytes()]),
					passphrase,
				);

				(transaction.signatures as any).push(signature);

				stateStore.account.get = jest.fn().mockResolvedValue(singleSignatureAccount);
				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should throw if signatue is missing', async () => {
				const transaction = new Transaction({
					moduleType: 2,
					assetID: 0,
					nonce: BigInt('0'),
					fee: BigInt('100000000'),
					senderPublicKey: passphraseDerivedKeys.publicKey,
					asset: getRandomBytes(100),
					signatures: [],
				});

				stateStore.account.get = jest.fn().mockResolvedValue(singleSignatureAccount);
				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						'Transactions from a single signature account should have exactly one signature. Found 0 signatures.',
					),
				);
			});

			it('should throw error if account is not multi signature and more than one signature present', async () => {
				const transaction = new Transaction({
					moduleType: 2,
					assetID: 0,
					nonce: BigInt('0'),
					fee: BigInt('100000000'),
					senderPublicKey: passphraseDerivedKeys.publicKey,
					asset: getRandomBytes(100),
					signatures: [],
				});

				const signature = signDataWithPassphrase(
					Buffer.concat([Buffer.from(defaultNetworkIdentifier, 'hex'), transaction.getBytes()]),
					passphrase,
				);

				(transaction.signatures as any).push(signature);
				(transaction.signatures as any).push(signature);

				stateStore.account.get = jest.fn().mockResolvedValue(singleSignatureAccount);
				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toStrictEqual(
					new Error(
						'Transactions from a single signature account should have exactly one signature. Found 2 signatures.',
					),
				);
			});
		});

		describe('Transaction from multi-signatures account', () => {
			interface memberFixture {
				passphrase: string;
				keys?: {
					privateKey: Buffer;
					publicKey: Buffer;
				};
				address?: Buffer;
			}

			interface membersFixture {
				[key: string]: memberFixture;
			}

			const members: membersFixture = {
				mainAccount: {
					passphrase: 'order trip this crop race amused climb rather taxi morning holiday team',
				},
				mandatoryA: {
					passphrase:
						'clock cradle permit opinion hobby excite athlete weird soap mesh valley belt',
				},
				mandatoryB: {
					passphrase:
						'team dignity frost rookie gesture gaze piano daring fruit patrol chalk hidden',
				},
				optionalA: {
					passphrase:
						'welcome hello ostrich country drive car river jaguar warfare color tell risk',
				},
				optionalB: {
					passphrase: 'beef volcano emotion say lab reject small repeat reveal napkin bunker make',
				},
			};

			for (const aMember of Object.values(members)) {
				aMember.keys = { ...getPrivateAndPublicKeyFromPassphrase(aMember.passphrase) };
				aMember.address = getAddressFromPublicKey(aMember.keys.publicKey);
			}

			const multisigAccount = createFakeDefaultAccount({
				address: members.mainAccount.address,
				token: {
					balance: BigInt(100000000000000),
				},
				keys: {
					numberOfSignatures: 3,
					mandatoryKeys: [members.mandatoryA.keys?.publicKey, members.mandatoryB.keys?.publicKey],
					optionalKeys: [members.optionalA.keys?.publicKey, members.optionalB.keys?.publicKey],
				},
			});

			let transaction: Transaction;

			beforeEach(() => {
				stateStore.account.get = jest.fn().mockResolvedValue(multisigAccount);

				transaction = new Transaction({
					moduleType: 2,
					assetID: 0,
					nonce: BigInt('0'),
					fee: BigInt('100000000'),
					senderPublicKey: (members as any).mainAccount.keys.publicKey,
					asset: getRandomBytes(100),
					signatures: [],
				});
			});

			it('should not throw for valid transaction', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should not throw for valid transaction when first optional is present', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should not throw for valid transaction when second optional is present', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalB.passphrase,
					),
				);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should throw for transaction where non optional absent signature is not empty buffer', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalB.passphrase,
					),
				);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Transaction signatures does not match required number of signatures: '3' for transaction with id '${transaction.id.toString(
							'base64',
						)}'`,
					),
				);
			});

			it('should throw error if number of provided signatures is bigger than numberOfSignatures in account asset', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalB.passphrase,
					),
				);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Transaction signatures does not match required number of signatures: '3' for transaction with id '${transaction.id.toString(
							'base64',
						)}'`,
					),
				);
			});

			it('should throw error if number of provided signatures is smaller than numberOfSignatures in account asset', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Transaction signatures does not match required number of signatures: '3' for transaction with id '${transaction.id.toString(
							'base64',
						)}'`,
					),
				);
			});

			it('should throw for transaction with valid numberOfSignatures but missing mandatory key signature', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalB.passphrase,
					),
				);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(new Error('Invalid signature. Empty buffer is not a valid signature.'));
			});

			it('should throw error if any of the mandatory signatures is not valid', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).resolves.toBeUndefined();
			});

			it('should throw error if any of the optional signatures is not valid', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalB.passphrase,
					),
				);

				// We change the first byte of the 2nd optional signature
				(transaction.signatures as any)[3][0] = 10;

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Failed to validate signature '${transaction.signatures[3].toString(
							'base64',
						)}' for transaction with id '${transaction.id.toString('base64')}'`,
					),
				);
			});

			it('should throw error if mandatory signatures are not in order', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Failed to validate signature '${transaction.signatures[0].toString(
							'base64',
						)}' for transaction with id '${transaction.id.toString('base64')}'`,
					),
				);
			});

			it('should throw error if optional signatures are not in order', async () => {
				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryA.passphrase,
					),
				);

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).mandatoryB.passphrase,
					),
				);

				(transaction.signatures as any).push(Buffer.from(''));

				(transaction.signatures as any).push(
					signDataWithPassphrase(
						Buffer.concat([
							Buffer.from(defaultNetworkIdentifier, 'hex'),
							transaction.getSigningBytes(),
						]),
						(members as any).optionalA.passphrase,
					),
				);

				return expect(
					keysModule.beforeTransactionApply({
						stateStore,
						transaction,
						reducerHandler,
					}),
				).rejects.toThrow(
					new Error(
						`Failed to validate signature '${transaction.signatures[3].toString(
							'base64',
						)}' for transaction with id '${transaction.id.toString('base64')}'`,
					),
				);
			});
		});
	});

	describe('afterGenesisBlockApply', () => {
		const genesisBlock = (createGenesisBlock() as unknown) as GenesisBlock<Account<AccountKeys>>;
		it('should fail if "mandatoryKeys" are not ordered lexicographically', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			const mandatoryKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			mandatoryKeys.sort((a, b) => b.compare(a));
			accounts[0].keys.numberOfSignatures = 3;
			accounts[0].keys.mandatoryKeys = mandatoryKeys;

			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				message: 'should be lexicographically ordered',
				keyword: 'mandatoryKeys',
				dataPath: '.accounts[0].keys.mandatoryKeys',
				schemaPath: '#/properties/accounts/items/properties/keys/properties/mandatoryKeys',
				params: { mandatoryKeys },
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if "optionalKeys" are not ordered lexicographically', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			const optionalKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			optionalKeys.sort((a, b) => b.compare(a));
			accounts[0].keys.numberOfSignatures = 1;
			accounts[0].keys.optionalKeys = optionalKeys;
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				message: 'should be lexicographically ordered',
				keyword: 'optionalKeys',
				dataPath: '.accounts[0].keys.optionalKeys',
				schemaPath: '#/properties/accounts/items/properties/keys/properties/optionalKeys',
				params: { optionalKeys },
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if "mandatoryKeys" are not unique', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			let mandatoryKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			mandatoryKeys = [...cloneDeep(mandatoryKeys), ...cloneDeep(mandatoryKeys)];
			mandatoryKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.numberOfSignatures = 6;
			accounts[0].keys.mandatoryKeys = mandatoryKeys;
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.mandatoryKeys',
				keyword: 'uniqueItems',
				message: 'should NOT have duplicate items',
				params: {},
				schemaPath:
					'#/properties/accounts/items/properties/keys/properties/mandatoryKeys/uniqueItems',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if "optionalKeys" are not unique', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			let optionalKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			optionalKeys = [...cloneDeep(optionalKeys), ...cloneDeep(optionalKeys)];
			optionalKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.numberOfSignatures = 1;
			accounts[0].keys.optionalKeys = optionalKeys;
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.optionalKeys',
				keyword: 'uniqueItems',
				message: 'should NOT have duplicate items',
				params: {},
				schemaPath:
					'#/properties/accounts/items/properties/keys/properties/optionalKeys/uniqueItems',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if set of "mandatoryKeys" and "optionalKeys" are not unique', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			const commonKey = getRandomBytes(32);
			const optionalKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32), commonKey];
			const mandatoryKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32), commonKey];
			mandatoryKeys.sort((a, b) => a.compare(b));
			optionalKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.numberOfSignatures = mandatoryKeys.length;
			accounts[0].keys.mandatoryKeys = mandatoryKeys;
			accounts[0].keys.optionalKeys = optionalKeys;
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.mandatoryKeys,.accounts[0].keys.optionalKeys',
				keyword: 'uniqueItems',
				message: 'should NOT have duplicate items among mandatoryKeys and optionalKeys',
				params: {},
				schemaPath: '#/properties/accounts/items/properties/keys',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if set of "mandatoryKeys" and "optionalKeys" is empty', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			accounts[0].keys.numberOfSignatures = 1;
			accounts[0].keys.mandatoryKeys = [];
			accounts[0].keys.optionalKeys = [];
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.numberOfSignatures',
				keyword: 'max',
				message: 'should be maximum of length of mandatoryKeys and optionalKeys',
				params: {
					max: 0,
				},
				schemaPath: '#/properties/accounts/items/properties/keys/properties/numberOfSignatures',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if set of "mandatoryKeys" and "optionalKeys" contains more than 64 elements', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			accounts[0].keys.mandatoryKeys = Array(33)
				.fill(0)
				.map(() => getRandomBytes(32));
			accounts[0].keys.mandatoryKeys.sort((a, b) => a.compare(b));

			accounts[0].keys.optionalKeys = Array(33)
				.fill(0)
				.map(() => getRandomBytes(32));
			accounts[0].keys.optionalKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.numberOfSignatures = accounts[0].keys.mandatoryKeys.length;
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.mandatoryKeys,.accounts[0].keys.optionalKeys',
				keyword: 'maxItems',
				message: 'should not have more than 64 keys',
				params: { maxItems: 64 },
				schemaPath: '#/properties/accounts/items/properties/keys',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if "numberOfSignatures" is less than length of "mandatoryKeys"', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			accounts[0].keys.numberOfSignatures = 2;
			accounts[0].keys.mandatoryKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			accounts[0].keys.mandatoryKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.optionalKeys = [];
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.numberOfSignatures',
				keyword: 'min',
				message: 'should be minimum of length of mandatoryKeys',
				params: {
					min: 3,
				},
				schemaPath: '#/properties/accounts/items/properties/keys/properties/numberOfSignatures',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});

		it('should fail if "numberOfSignatures" is greater than length of "mandatoryKeys" + "optionalKeys"', async () => {
			// Arrange
			const accounts = cloneDeep(genesisBlock.header.asset.accounts);
			accounts[0].keys.numberOfSignatures = 7;
			accounts[0].keys.mandatoryKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			accounts[0].keys.mandatoryKeys.sort((a, b) => a.compare(b));
			accounts[0].keys.optionalKeys = [getRandomBytes(32), getRandomBytes(32), getRandomBytes(32)];
			accounts[0].keys.optionalKeys.sort((a, b) => a.compare(b));
			const gb = (ObjectUtils.mergeDeep({}, genesisBlock, {
				header: {
					asset: {
						accounts,
					},
				},
			}) as unknown) as GenesisBlock<Account<AccountKeys>>;

			const expectedError = {
				dataPath: '.accounts[0].keys.numberOfSignatures',
				keyword: 'max',
				message: 'should be maximum of length of mandatoryKeys and optionalKeys',
				params: {
					max: 6,
				},
				schemaPath: '#/properties/accounts/items/properties/keys/properties/numberOfSignatures',
			};

			// Act & Assert
			return expect(
				keysModule.afterGenesisBlockApply({ genesisBlock: gb } as any),
			).rejects.toStrictEqual(new LiskValidationError([expectedError]));
		});
	});
});
