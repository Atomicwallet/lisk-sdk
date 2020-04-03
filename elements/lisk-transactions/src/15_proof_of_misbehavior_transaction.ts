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
 *
 */
import {
	getAddressFromPublicKey,
	hexToBuffer,
} from '@liskhq/lisk-cryptography';
import { validator } from '@liskhq/lisk-validator';

import {
	BaseTransaction,
	StateStore,
	StateStorePrepare,
} from './base_transaction';
import { convertToAssetError, TransactionError } from './errors';
import { Account, BlockHeader, TransactionJSON } from './transaction_types';
import {
	getBlockBytes,
	getBlockBytesWithSignature,
	isPunished,
	validateSignature,
} from './utils';

const proofOfMisbehaviorAssetFormatSchema = {
	type: 'object',
	required: ['header1', 'header2'],
	properties: {
		header1: {
			type: 'object',
			required: [
				'version',
				'totalAmount',
				'seedReveal',
				'totalFee',
				'reward',
				'payloadHash',
				'timestamp',
				'numberOfTransactions',
				'payloadLength',
				'generatorPublicKey',
				'transactions',
				'blockSignature',
			],
			properties: {
				version: {
					type: 'integer',
					minimum: 0,
				},
				totalAmount: {
					type: 'string',
					format: 'amount',
				},
				totalFee: {
					type: 'string',
					format: 'amount',
				},
				reward: {
					type: 'string',
					format: 'amount',
				},
				seedReveal: {
					type: 'string',
					format: 'hex',
				},
				payloadHash: {
					type: 'string',
					format: 'hex',
				},
				timestamp: {
					type: 'integer',
					minimum: 0,
				},
				numberOfTransactions: {
					type: 'integer',
					minimum: 0,
				},
				payloadLength: {
					type: 'integer',
					minimum: 0,
				},
				previousBlockId: {
					type: ['null', 'string'],
					format: 'id',
					minLength: 1,
					maxLength: 20,
				},
				generatorPublicKey: {
					type: 'string',
					format: 'publicKey',
				},
				maxHeightPrevoted: {
					type: 'integer',
					minimum: 0,
				},
				maxHeightPreviouslyForged: {
					type: 'integer',
					minimum: 0,
				},
				height: {
					type: 'integer',
					minimum: 1,
				},
				blockSignature: {
					type: 'string',
					format: 'signature',
				},
			},
		},
	},
};

export interface ProofOfMisbehaviorAsset {
	readonly header1: BlockHeader;
	readonly header2: BlockHeader;
}

export class ProofOfMisbehaviorTransaction extends BaseTransaction {
	public readonly asset: ProofOfMisbehaviorAsset;
	public static TYPE = 15;

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<TransactionJSON>;
		this.asset = (tx.asset || {}) as ProofOfMisbehaviorAsset;
	}

	public assetToJSON(): ProofOfMisbehaviorAsset {
		return {
			header1: this.asset.header1,
			header2: this.asset.header2,
		};
	}

	protected assetToBytes(): Buffer {
		return Buffer.concat([
			getBlockBytesWithSignature(this.asset.header1),
			getBlockBytesWithSignature(this.asset.header1),
		]);
	}

	public async prepare(store: StateStorePrepare): Promise<void> {
		const delegateId = getAddressFromPublicKey(
			this.asset.header1.generatorPublicKey,
		);

		const filterArray = [
			{
				address: this.senderId,
			},
			{
				address: delegateId,
			},
		];

		await store.account.cache(filterArray);
	}

	protected validateAsset(): ReadonlyArray<TransactionError> {
		const asset = this.assetToJSON();
		const schemaErrors = validator.validate(
			proofOfMisbehaviorAssetFormatSchema,
			asset,
		);
		const errors = convertToAssetError(
			this.id,
			schemaErrors,
		) as TransactionError[];

		if (
			this.asset.header1.generatorPublicKey !==
			this.asset.header2.generatorPublicKey
		) {
			errors.push(
				new TransactionError(
					'GeneratorPublickey of each blockheader must be matching.',
					this.id,
					'.asset.header1',
				),
			);
		}

		if (this.asset.header1.id === this.asset.header2.id) {
			errors.push(
				new TransactionError(
					'Blockheader ids are identical. No contradiction detected.',
					this.id,
					'.asset.header1',
				),
			);
		}

		/*
            Check for BFT violations:
                1. Double forging
                2. Disjointness 
                3. Branch is not the one with largest maxHeighPrevoted
        */

		// tslint:disable-next-line no-let
		let b1 = asset.header1;
		// tslint:disable-next-line no-let
		let b2 = asset.header2;

		// Order the two block headers such that b1 must be forged first
		if (
			b1.maxHeightPreviouslyForged > b2.maxHeightPreviouslyForged ||
			(b1.maxHeightPreviouslyForged === b2.maxHeightPreviouslyForged &&
				b1.maxHeightPrevoted > b2.maxHeightPrevoted) ||
			(b1.maxHeightPreviouslyForged === b2.maxHeightPreviouslyForged &&
				b1.maxHeightPrevoted === b2.maxHeightPrevoted &&
				b1.height > b2.height)
		) {
			b1 = asset.header2;
			b2 = asset.header1;
		}

		if (
			!(
				b1.maxHeightPrevoted === b2.maxHeightPrevoted && b1.height >= b2.height
			) &&
			!(b1.height > b2.maxHeightPreviouslyForged) &&
			!(b1.maxHeightPrevoted > b2.maxHeightPrevoted)
		) {
			errors.push(
				new TransactionError(
					'Blockheaders are not contradicting as per BFT violation rules.',
					this.id,
					'.asset.header1',
				),
			);
		}

		return errors;
	}

	protected async applyAsset(
		store: StateStore,
	): Promise<ReadonlyArray<TransactionError>> {
		const errors = [];
		const currentHeight = store.chain.lastBlockHeader.height + 1;
		const delegateId = getAddressFromPublicKey(
			this.asset.header1.generatorPublicKey,
		);
		const delegateAccount = await store.account.get(delegateId);
		const senderAccount = await store.account.get(this.senderId);
		const { networkIdentifier } = store.chain;

		/*
			|header1.height - h| < 260,000.
			|header2.height - h| < 260,000.
		*/

		// tslint:disable-next-line no-magic-numbers
		if (Math.abs(this.asset.header1.height - currentHeight) < 260000) {
			errors.push(
				new TransactionError(
					'Difference between header1.height and current height must be less than 260000.',
					this.id,
					'.asset.header1',
					this.asset.header1.height,
				),
			);
		}

		// tslint:disable-next-line no-magic-numbers
		if (Math.abs(this.asset.header2.height - currentHeight) < 260000) {
			errors.push(
				new TransactionError(
					'Difference between header2.height and current height must be less than 260000.',
					this.id,
					'.asset.header2',
					this.asset.header2.height,
				),
			);
		}

		/*
			Check if delegate is eligible to be punished
		*/

		if (delegateAccount.delegate.isBanned) {
			errors.push(
				new TransactionError(
					'Cannot apply proof-of-misbehavior. Delegate is banned.',
					this.id,
					'.asset.header1.generatorPublicKey',
					this.asset.header1.generatorPublicKey,
				),
			);
		}

		if (
			isPunished(
				delegateAccount,
				delegateAccount,
				store.chain.lastBlockHeader.height,
			)
		) {
			errors.push(
				new TransactionError(
					'Cannot apply proof-of-misbehavior. Delegate is already punished. ',
					this.id,
					'.asset.header1.generatorPublicKey',
					this.asset.header1.generatorPublicKey,
				),
			);
		}

		/* 
			Check block signatures validity 
		*/

		const blockHeader1Bytes = Buffer.concat([
			Buffer.from(networkIdentifier, 'hex'),
			getBlockBytes(this.asset.header1),
		]);
		const blockHeader2Bytes = Buffer.concat([
			Buffer.from(networkIdentifier, 'hex'),
			getBlockBytes(this.asset.header2),
		]);

		const { valid: validHeader1Signature } = validateSignature(
			this.asset.header1.generatorPublicKey,
			this.asset.header1.blockSignature,
			blockHeader1Bytes,
		);

		if (!validHeader1Signature) {
			errors.push(
				new TransactionError(
					'Invalid block signature for header 1.',
					this.id,
					'.asset.header1.blockSignature',
					this.asset.header1.blockSignature,
				),
			);
		}

		const { valid: validHeader2Signature } = validateSignature(
			this.asset.header2.generatorPublicKey,
			this.asset.header2.blockSignature,
			blockHeader2Bytes,
		);

		if (!validHeader2Signature) {
			errors.push(
				new TransactionError(
					'Invalid block signature for header 2.',
					this.id,
					'.asset.header2.blockSignature',
					this.asset.header2.blockSignature,
				),
			);
		}
	}
}
