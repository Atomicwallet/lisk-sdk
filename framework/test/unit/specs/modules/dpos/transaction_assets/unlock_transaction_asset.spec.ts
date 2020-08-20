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

import { Account } from '@liskhq/lisk-chain';
import { validator } from '@liskhq/lisk-validator';
import { objects } from '@liskhq/lisk-utils';
import { ApplyAssetInput, ValidateAssetInput } from '../../../../../../src';
import { createFakeDefaultAccount } from '../../../../../utils/node';
import { StateStoreMock } from '../../../../../utils/node/state_store_mock';
import { UnlockTransactionAsset } from '../../../../../../src/modules/dpos/transaction_assets/unlock_transaction_asset';
import {
	DPOSAccountProps,
	UnlockingAccountAsset,
	UnlockTransactionAssetInput,
} from '../../../../../../src/modules/dpos';
import { liskToBeddows } from '../../../../../utils/assets';

const setupUnlocks = ({
	unVoteHeight,
	pomHeight,
	lastBlockHeight,
	sender,
	delegate,
	applyInput,
}: {
	unVoteHeight: number;
	pomHeight: number;
	lastBlockHeight: number;
	sender: Account<DPOSAccountProps>;
	delegate: Account<DPOSAccountProps>;
	applyInput: ApplyAssetInput<UnlockTransactionAssetInput>;
}) => {
	const unlockObj = {
		delegateAddress: delegate.address,
		amount: liskToBeddows(120),
		unvoteHeight: unVoteHeight,
	};
	const stateStore = new StateStoreMock([] as any, {
		lastBlockHeaders: [{ height: lastBlockHeight }] as any,
	});

	if (sender.address.equals(delegate.address)) {
		const updatedSender = objects.cloneDeep(sender);
		updatedSender.dpos.unlocking = [unlockObj];
		// Make sure delegate is registered as delegate
		updatedSender.dpos.delegate.username = 'delegate';
		updatedSender.dpos.delegate.pomHeights = [pomHeight];

		stateStore.account.set(sender.address, updatedSender);
	} else {
		const updatedSender = objects.cloneDeep(sender);
		updatedSender.dpos.unlocking = [unlockObj];

		const updatedDelegate = objects.cloneDeep(delegate);
		// Make sure delegate is registered as delegate
		updatedDelegate.dpos.delegate.username = 'delegate';
		updatedDelegate.dpos.delegate.pomHeights = [pomHeight];

		stateStore.account.set(sender.address, updatedSender);
		stateStore.account.set(delegate.address, updatedDelegate);
	}

	return {
		...applyInput,
		stateStore: stateStore as any,
		asset: { unlockObjects: [unlockObj] },
	};
};

describe('UnlockTransactionAsset', () => {
	const lastBlockHeight = 8760000;
	let transactionAsset: UnlockTransactionAsset;
	let applyInput: ApplyAssetInput<UnlockTransactionAssetInput>;
	let validateInput: ValidateAssetInput<UnlockTransactionAssetInput>;
	let sender: any;
	let stateStoreMock: StateStoreMock;
	const delegate1 = createFakeDefaultAccount({ dpos: { delegate: { username: 'delegate1' } } });
	const delegate2 = createFakeDefaultAccount({ dpos: { delegate: { username: 'delegate2' } } });
	const delegate3 = createFakeDefaultAccount({ dpos: { delegate: { username: 'delegate3' } } });
	const unlockAmount1 = liskToBeddows(100);
	const unlockAmount2 = liskToBeddows(120);
	const unlockAmount3 = liskToBeddows(80);

	beforeEach(() => {
		sender = createFakeDefaultAccount({});
		stateStoreMock = new StateStoreMock(
			objects.cloneDeep([sender, delegate1, delegate2, delegate3]),
			{
				lastBlockHeaders: [{ height: lastBlockHeight }] as any,
			},
		);
		transactionAsset = new UnlockTransactionAsset();
		applyInput = {
			senderID: sender.address,
			asset: {
				unlockObjects: [],
			},
			stateStore: stateStoreMock as any,
			reducerHandler: {
				invoke: jest.fn(),
			},
		} as any;
		validateInput = { asset: { unlockObjects: [] } } as any;

		jest.spyOn(stateStoreMock.account, 'get');
		jest.spyOn(stateStoreMock.account, 'set');
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(2);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('unlock');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});

		it('should have valid baseFee', () => {
			expect(transactionAsset.baseFee).toEqual(BigInt(0));
		});
	});

	describe('validateAsset', () => {
		describe('schema validation', () => {
			describe('when asset.unlockObjects does not include any unlockingObject', () => {
				it('should return errors', () => {
					// Arrange
					validateInput.asset = { unlockObjects: [] };

					const errors = validator.validate(transactionAsset.schema, validateInput.asset);
					expect(errors).toHaveLength(1);
					expect(errors[0].message).toInclude('should NOT have fewer than 1 items');
				});
			});

			describe('when asset.unlockObjects includes more than 20 unlockObjects', () => {
				it('should return errors', () => {
					// Arrange
					validateInput.asset = {
						unlockObjects: Array(21)
							.fill(0)
							.map(() => ({
								delegateAddress: delegate1.address,
								amount: liskToBeddows(20),
								unvoteHeight: lastBlockHeight,
							})),
					};

					const errors = validator.validate(transactionAsset.schema, validateInput.asset);
					expect(errors).toHaveLength(1);
					expect(errors[0].message).toInclude('should NOT have more than 20 items');
				});
			});

			describe('when asset.unlockObjects includes negative amount', () => {
				it('should return errors', () => {
					// Arrange
					validateInput.asset = {
						unlockObjects: [
							{
								delegateAddress: delegate1.address,
								amount: liskToBeddows(-20),
								unvoteHeight: lastBlockHeight,
							},
						],
					};

					const errors = validator.validate(transactionAsset.schema, validateInput.asset);

					expect(errors).toHaveLength(1);
					expect(errors[0].message).toInclude('should pass "dataType" keyword validation');
				});
			});

			describe('when asset.unlockObjects includes negative unvoteHeight', () => {
				it('should return errors', () => {
					// Arrange
					validateInput.asset = {
						unlockObjects: [
							{ delegateAddress: delegate1.address, amount: liskToBeddows(20), unvoteHeight: -1 },
						],
					};

					const errors = validator.validate(transactionAsset.schema, validateInput.asset);

					expect(errors).toHaveLength(1);
					expect(errors[0].message).toInclude('should pass "dataType" keyword validation');
				});
			});
		});

		describe('when asset.votes contains valid contents', () => {
			it('should not return errors', () => {
				// Arrange
				validateInput.asset = {
					unlockObjects: [
						{
							delegateAddress: delegate1.address,
							amount: liskToBeddows(20),
							unvoteHeight: lastBlockHeight,
						},
					],
				};

				// Act & Assert
				expect(() => transactionAsset.validateAsset(validateInput)).not.toThrow();
			});
		});

		describe('when asset.unlockObjects includes zero amount', () => {
			it('should throw error', () => {
				// Arrange
				validateInput.asset = {
					unlockObjects: [
						{
							delegateAddress: delegate1.address,
							amount: liskToBeddows(0),
							unvoteHeight: lastBlockHeight,
						},
					],
				};

				// Act & Assert
				expect(() => transactionAsset.validateAsset(validateInput)).toThrow(
					'Amount cannot be less than or equal to zero',
				);
			});
		});

		describe('when asset.unlockObjects includes amount which is not multiple of 10 * 10^8', () => {
			it('should throw error', () => {
				// Arrange
				validateInput.asset = {
					unlockObjects: [
						{
							delegateAddress: delegate1.address,
							amount: BigInt(88),
							unvoteHeight: lastBlockHeight,
						},
					],
				};

				// Act & Assert
				expect(() => transactionAsset.validateAsset(validateInput)).toThrow(
					'Amount should be multiple of 10 * 10^8',
				);
			});
		});
	});

	describe('apply', () => {
		describe('given the delegate is not being punished', () => {
			describe('when asset.unlockObjects contain valid entries, and voter account has waited 2000 blocks', () => {
				let unlockTrsObj1: UnlockingAccountAsset;
				let unlockTrsObj2: UnlockingAccountAsset;
				let unlockObjNotPassed: UnlockingAccountAsset;

				beforeEach(() => {
					unlockTrsObj1 = {
						delegateAddress: delegate1.address,
						amount: unlockAmount1,
						unvoteHeight: lastBlockHeight - 2001,
					};
					unlockTrsObj2 = {
						delegateAddress: delegate2.address,
						amount: unlockAmount2,
						unvoteHeight: lastBlockHeight - 2000,
					};
					unlockObjNotPassed = {
						delegateAddress: delegate3.address,
						amount: unlockAmount3,
						unvoteHeight: lastBlockHeight - 3001,
					};

					sender.dpos.unlocking = objects.cloneDeep([
						unlockTrsObj1,
						unlockTrsObj2,
						unlockObjNotPassed,
					]);

					applyInput.asset = { unlockObjects: objects.cloneDeep([unlockTrsObj1, unlockTrsObj2]) };

					stateStoreMock.account.set(sender.address, sender);
				});

				it('should not return error', async () => {
					await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
				});

				it('should make account to have correct balance', async () => {
					await transactionAsset.apply(applyInput);

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: unlockTrsObj1.amount,
					});

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: unlockTrsObj2.amount,
					});
				});

				it('should remove unlocking from the sender', async () => {
					await transactionAsset.apply(applyInput);

					// Assert
					const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
						sender.address,
					);

					expect(updatedSender.dpos.unlocking).toHaveLength(1);
					expect(updatedSender.dpos.unlocking).toEqual([unlockObjNotPassed]);
				});

				describe('when asset.unlockObjects contain valid entries, and voter account has not waited 2000 blocks', () => {
					it('should throw error', async () => {
						stateStoreMock = new StateStoreMock(objects.cloneDeep(stateStoreMock.accountData), {
							lastBlockHeaders: [{ height: 4000 }] as any,
						});
						applyInput = {
							...applyInput,
							stateStore: stateStoreMock as any,
						};

						await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
							'Unlocking is not permitted as it is still within the waiting period',
						);
					});
				});
			});

			describe('when asset.unlockObjects contain valid entries, and self-voting account has waited 260,000 blocks', () => {
				let unlockTrsObj1: UnlockingAccountAsset;
				let unlockTrsObj2: UnlockingAccountAsset;
				let unlockObjNotPassed: UnlockingAccountAsset;

				beforeEach(() => {
					unlockTrsObj1 = {
						delegateAddress: sender.address,
						amount: unlockAmount1,
						unvoteHeight: lastBlockHeight - 260001,
					};
					unlockTrsObj2 = {
						delegateAddress: sender.address,
						amount: unlockAmount2,
						unvoteHeight: lastBlockHeight - 260000,
					};
					unlockObjNotPassed = {
						delegateAddress: sender.address,
						amount: unlockAmount3,
						unvoteHeight: lastBlockHeight - 260600,
					};

					sender.dpos.unlocking = objects.cloneDeep([
						unlockTrsObj1,
						unlockTrsObj2,
						unlockObjNotPassed,
					]);

					applyInput.asset = { unlockObjects: objects.cloneDeep([unlockTrsObj1, unlockTrsObj2]) };

					// Make sender a delegate as well
					sender.dpos.delegate.username = 'sender';
					stateStoreMock.account.set(sender.address, sender);
				});

				it('should not return error', async () => {
					await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
				});

				it('should make account to have correct balance', async () => {
					await transactionAsset.apply(applyInput);

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: unlockTrsObj1.amount,
					});

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: unlockTrsObj2.amount,
					});
				});

				it('should remove unlocking from the sender', async () => {
					await transactionAsset.apply(applyInput);

					// Assert
					const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
						sender.address,
					);

					expect(updatedSender.dpos.unlocking).toHaveLength(1);
					expect(updatedSender.dpos.unlocking).toEqual([unlockObjNotPassed]);
				});

				describe('when asset.unlockObjects contain valid entries, and self-voting account has not waited 260,000 blocks', () => {
					it('should throw error', async () => {
						stateStoreMock = new StateStoreMock([...stateStoreMock.accountData], {
							lastBlockHeaders: [{ height: lastBlockHeight - 5000 }] as any,
						});
						applyInput = {
							...applyInput,
							stateStore: stateStoreMock as any,
						};

						await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
							'Unlocking is not permitted as it is still within the waiting period',
						);
					});
				});
			});
		});

		describe('given the delegate is currently being punished', () => {
			describe('when asset.unlockObjects contain valid entries, and self-voting account has waited pomHeight + 780,000 and unvoteHeight + 260,000 blocks', () => {
				beforeEach(async () => {
					const pomHeight = 45968;
					const unVoteHeight = pomHeight + 780000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: Math.max(pomHeight + 780000, unVoteHeight + 260000),
						sender,
						delegate: sender,
						applyInput,
					});
				});

				it('should not return error', async () => {
					await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
				});

				it('should make account to have correct balance', async () => {
					await transactionAsset.apply(applyInput);

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: applyInput.asset.unlockObjects[0].amount,
					});
				});

				it('should remove unlocking from the sender', async () => {
					await transactionAsset.apply(applyInput);

					// Assert
					const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
						sender.address,
					);

					expect(updatedSender.dpos.unlocking).toHaveLength(0);
				});
			});

			describe('when asset.unlockObjects contain valid entries, and voter account has waited pomHeight + 260,000 and unvoteHeight + 2,000 blocks', () => {
				beforeEach(() => {
					const pomHeight = 45968;
					const unVoteHeight = pomHeight + 260000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: Math.max(pomHeight + 260000, unVoteHeight + 2000),
						sender,
						delegate: delegate1,
						applyInput,
					});
				});

				it('should not return error', async () => {
					await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
				});

				it('should make account to have correct balance', async () => {
					await transactionAsset.apply(applyInput);

					expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
						address: sender.address,
						amount: applyInput.asset.unlockObjects[0].amount,
					});
				});

				it('should remove unlocking from the sender', async () => {
					await transactionAsset.apply(applyInput);

					// Assert
					const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
						sender.address,
					);

					expect(updatedSender.dpos.unlocking).toHaveLength(0);
				});
			});

			describe('when asset.unlockObjects contain valid entries, and voter account has waited pomHeight + 260,000 blocks but not waited for unlockHeight + 2,000 blocks', () => {
				beforeEach(() => {
					const pomHeight = 45968;
					const unVoteHeight = pomHeight + 260000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: pomHeight + 260000 + 5,
						sender,
						delegate: delegate1,
						applyInput,
					});
				});

				it('should throw error', async () => {
					await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
						'Unlocking is not permitted as it is still within the waiting period',
					);
				});
			});

			describe('when asset.unlockObjects contain valid entries, and voter account has not waited pomHeight + 260,000 blocks but waited unlockHeight + 2000 blocks', () => {
				beforeEach(() => {
					const unVoteHeight = 45968;
					const pomHeight = unVoteHeight + 260000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: unVoteHeight + 260000 + 5,
						sender,
						delegate: delegate1,
						applyInput,
					});
				});

				it('should throw error', async () => {
					await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
						'Unlocking is not permitted as delegate is currently being punished',
					);
				});
			});

			describe('when asset.unlockObjects contain valid entries, and self-voting account has waited pomHeight + 780,000 blocks but not waited unvoteHeight + 260,000 blocks', () => {
				beforeEach(() => {
					const pomHeight = 45968;
					const unVoteHeight = pomHeight + 780000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: pomHeight + 780000 + 5,
						sender,
						delegate: sender,
						applyInput,
					});
				});

				it('should throw error', async () => {
					await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
						'Unlocking is not permitted as it is still within the waiting period',
					);
				});
			});

			describe('when asset.unlockObjects contain valid entries, and self-voting account has not waited pomHeight + 780,000 blocks but waited unvoteHeight + 260,000 blocks', () => {
				beforeEach(() => {
					const unVoteHeight = 45968;
					const pomHeight = unVoteHeight + 780000 + 10;

					applyInput = setupUnlocks({
						pomHeight,
						unVoteHeight,
						lastBlockHeight: unVoteHeight + 780000 + 5,
						sender,
						delegate: sender,
						applyInput,
					});
				});

				it('should throw error', async () => {
					await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
						'Unlocking is not permitted as delegate is currently being punished',
					);
				});
			});
		});

		describe('when asset.unlockObjects contain duplicate entries', () => {
			beforeEach(() => {
				const unlocking = [
					{ delegateAddress: delegate1.address, amount: liskToBeddows(90), unvoteHeight: 56 },
					{ delegateAddress: delegate1.address, amount: liskToBeddows(78), unvoteHeight: 98 },
				];

				sender.dpos.unlocking = unlocking;
				stateStoreMock.account.set(sender.address, sender);

				applyInput.asset = {
					unlockObjects: objects.cloneDeep(unlocking),
				};
			});

			it('should not return error', async () => {
				await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
			});

			it('should make account to have correct balance', async () => {
				await transactionAsset.apply(applyInput);

				expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
					address: sender.address,
					amount: applyInput.asset.unlockObjects[0].amount,
				});

				expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
					address: sender.address,
					amount: applyInput.asset.unlockObjects[1].amount,
				});
			});

			it('should remove unlocking from the sender', async () => {
				await transactionAsset.apply(applyInput);

				// Assert
				const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
					sender.address,
				);

				expect(updatedSender.dpos.unlocking).toHaveLength(0);
			});
		});

		describe('when account contain duplicate unlocking entries but asset.unlockObjects only contains one', () => {
			beforeEach(() => {
				const unlocking = [
					{ delegateAddress: delegate1.address, amount: liskToBeddows(90), unvoteHeight: 56 },
					{ delegateAddress: delegate1.address, amount: liskToBeddows(78), unvoteHeight: 98 },
				];

				sender.dpos.unlocking = unlocking;
				stateStoreMock.account.set(sender.address, sender);

				applyInput.asset = {
					unlockObjects: [objects.cloneDeep(unlocking[0])],
				};
			});

			it('should not return error', async () => {
				await expect(transactionAsset.apply(applyInput)).resolves.toBeUndefined();
			});

			it('should make account to have correct balance', async () => {
				await transactionAsset.apply(applyInput);

				expect(applyInput.reducerHandler.invoke).toHaveBeenCalledTimes(1);
				expect(applyInput.reducerHandler.invoke).toHaveBeenCalledWith('token:credit', {
					address: sender.address,
					amount: applyInput.asset.unlockObjects[0].amount,
				});
			});

			it('should keep the duplicated unlocking from the sender', async () => {
				await transactionAsset.apply(applyInput);

				// Assert
				const updatedSender = await stateStoreMock.account.get<Account<DPOSAccountProps>>(
					sender.address,
				);

				expect(updatedSender.dpos.unlocking).toHaveLength(1);
			});
		});

		describe('when account.dpos.unlocking does not have corresponding unlockingObject', () => {
			beforeEach(() => {
				sender.dpos.unlocking = [
					{ delegateAddress: delegate1.address, amount: liskToBeddows(90), unvoteHeight: 56 },
				];
				stateStoreMock.account.set(sender.address, sender);

				applyInput.asset = {
					unlockObjects: [
						{ delegateAddress: delegate2.address, amount: liskToBeddows(78), unvoteHeight: 98 },
					],
				};
			});

			it('should throw error', async () => {
				await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
					'Corresponding unlocking object not found',
				);
			});
		});

		describe('when account.dpos.unlocking has one entry but it has multiple corresponding unlockObjects', () => {
			beforeEach(() => {
				sender.dpos.unlocking = [
					{ delegateAddress: delegate1.address, amount: liskToBeddows(90), unvoteHeight: 56 },
				];
				stateStoreMock.account.set(sender.address, sender);

				applyInput.asset = {
					unlockObjects: [
						{ delegateAddress: delegate1.address, amount: liskToBeddows(40), unvoteHeight: 56 },
						{ delegateAddress: delegate1.address, amount: liskToBeddows(50), unvoteHeight: 56 },
					],
				};
			});

			it('should throw error', async () => {
				await expect(transactionAsset.apply(applyInput)).rejects.toThrow(
					'Corresponding unlocking object not found',
				);
			});
		});
	});
});
