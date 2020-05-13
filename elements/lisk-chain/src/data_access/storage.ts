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

import {
	KVStore,
	formatInt,
	getFirstPrefix,
	getLastPrefix,
	NotFoundError,
} from '@liskhq/lisk-db';
import { TransactionJSON } from '@liskhq/lisk-transactions';
import { getAddressFromPublicKey } from '@liskhq/lisk-cryptography';

import { AccountJSON, BlockJSON, BlockHeaderJSON } from '../types';

import {
	DB_KEY_BLOCKS_ID,
	DB_KEY_BLOCKS_HEIGHT,
	DB_KEY_TRANSACTIONS_BLOCK_ID,
	DB_KEY_TRANSACTIONS_ID,
	DB_KEY_TEMPBLOCKS_HEIGHT,
	DB_KEY_ACCOUNTS_ADDRESS,
	DB_KEY_CHAIN_STATE,
	DB_KEY_CONSENSUS_STATE,
} from './constants';
import { StateStore } from '../state_store';

export class Storage {
	private readonly _db: KVStore;

	public constructor(db: KVStore) {
		this._db = db;
	}

	/*
		Block headers
	*/
	public async getBlockHeaderByID(id: string): Promise<BlockHeaderJSON> {
		const block = await this._db.get<BlockHeaderJSON>(
			`${DB_KEY_BLOCKS_ID}${id}`,
		);
		return block;
	}

	public async getBlockHeadersByIDs(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockHeaderJSON[]> {
		const blocks = [];
		for (const id of arrayOfBlockIds) {
			const block = await this._db.get<BlockHeaderJSON>(
				`${DB_KEY_BLOCKS_ID}${id}`,
			);
			blocks.push(block);
		}
		return blocks;
	}

	public async getBlockHeaderByHeight(
		height: number,
	): Promise<BlockHeaderJSON> {
		const stringHeight = formatInt(height);
		const id = await this._db.get<string>(
			`${DB_KEY_BLOCKS_HEIGHT}${stringHeight}`,
		);
		return this.getBlockHeaderByID(id);
	}

	public async getBlockHeadersByHeightBetween(
		fromHeight: number,
		toHeight: number,
	): Promise<BlockHeaderJSON[]> {
		const stream = this._db.createReadStream({
			gte: `${DB_KEY_BLOCKS_HEIGHT}${formatInt(fromHeight)}`,
			lte: `${DB_KEY_BLOCKS_HEIGHT}${formatInt(toHeight)}`,
			reverse: true,
		});
		const blockIDs = await new Promise<string[]>((resolve, reject) => {
			const ids: string[] = [];
			stream
				.on('data', ({ value }) => {
					ids.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(ids);
				});
		});

		return this.getBlockHeadersByIDs(blockIDs);
	}

	public async getBlockHeadersWithHeights(
		heightList: ReadonlyArray<number>,
	): Promise<BlockHeaderJSON[]> {
		const blocks = [];
		for (const height of heightList) {
			const block = await this.getBlockHeaderByHeight(height);
			blocks.push(block);
		}
		return blocks;
	}

	public async getLastBlockHeader(): Promise<BlockHeaderJSON> {
		const stream = this._db.createReadStream({
			gte: getFirstPrefix(DB_KEY_BLOCKS_HEIGHT),
			lte: getLastPrefix(DB_KEY_BLOCKS_HEIGHT),
			reverse: true,
			limit: 1,
		});
		const [blockID] = await new Promise<string[]>((resolve, reject) => {
			const ids: string[] = [];
			stream
				.on('data', ({ value }) => {
					ids.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(ids);
				});
		});

		return this.getBlockHeaderByID(blockID);
	}

	public async getLastCommonBlockHeader(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockHeaderJSON> {
		const blocks = [];
		for (const id of arrayOfBlockIds) {
			try {
				const block = await this.getBlockHeaderByID(id);
				blocks.push(block);
			} catch (error) {
				if (!(error instanceof NotFoundError)) {
					throw error;
				}
			}
		}
		blocks.sort((a, b) => b.height - a.height);

		return blocks[0];
	}

	public async getBlocksCount(): Promise<number> {
		const lastBlock = await this.getLastBlockHeader();
		return lastBlock.height;
	}

	/*
		Extended blocks with transaction payload
	*/

	public async getBlockByID(id: string): Promise<BlockJSON> {
		const blockHeader = await this.getBlockHeaderByID(id);
		const transactions = await this._getTransactions(id);

		return {
			...blockHeader,
			transactions,
		};
	}

	public async getBlocksByIDs(
		arrayOfBlockIds: ReadonlyArray<string>,
	): Promise<BlockJSON[]> {
		const blocks = [];
		for (const id of arrayOfBlockIds) {
			const block = await this.getBlockByID(id);
			blocks.push(block);
		}

		return blocks;
	}

	public async getBlockByHeight(height: number): Promise<BlockJSON> {
		const header = await this.getBlockHeaderByHeight(height);
		const transactions = await this._getTransactions(header.id);

		return {
			...header,
			transactions,
		};
	}

	public async getBlocksByHeightBetween(
		fromHeight: number,
		toHeight: number,
	): Promise<BlockJSON[]> {
		const headers = await this.getBlockHeadersByHeightBetween(
			fromHeight,
			toHeight,
		);
		const blocks = [];
		for (const header of headers) {
			const transactions = await this._getTransactions(header.id);
			blocks.push({ ...header, transactions });
		}

		return blocks;
	}

	public async getLastBlock(): Promise<BlockJSON> {
		const header = await this.getLastBlockHeader();
		const transactions = await this._getTransactions(header.id);

		return {
			...header,
			transactions,
		};
	}

	public async getTempBlocks(): Promise<BlockJSON[]> {
		const stream = this._db.createReadStream({
			gte: getFirstPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
			lte: getLastPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
			reverse: true,
		});
		const tempBlocks = await new Promise<BlockJSON[]>((resolve, reject) => {
			const blocks: BlockJSON[] = [];
			stream
				.on('data', ({ value }) => {
					blocks.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(blocks);
				});
		});

		return tempBlocks;
	}

	public async isTempBlockEmpty(): Promise<boolean> {
		const stream = this._db.createReadStream({
			gte: getFirstPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
			lte: getLastPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
			limit: 1,
		});
		const tempBlocks = await new Promise<BlockJSON[]>((resolve, reject) => {
			const blocks: BlockJSON[] = [];
			stream
				.on('data', ({ value }) => {
					blocks.push(value);
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(blocks);
				});
		});

		return tempBlocks.length === 0;
	}

	public async clearTempBlocks(): Promise<void> {
		await this._db.clear({
			gte: getFirstPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
			lte: getLastPrefix(DB_KEY_TEMPBLOCKS_HEIGHT),
		});
	}

	public async deleteBlocksWithHeightGreaterThan(
		height: number,
	): Promise<void> {
		const lastBlockHeader = await this.getLastBlockHeader();
		const batchSize = 5000;
		const loops = Math.ceil((lastBlockHeader.height - height + 1) / batchSize);
		const start = height + 1;
		// tslint:disable-next-line no-let
		for (let i = 0; i < loops; i += 1) {
			// Get all the required info
			const startHeight = i * batchSize + start + i;
			const endHeight = startHeight + batchSize - 1;
			const headers = await this.getBlockHeadersByHeightBetween(
				startHeight,
				endHeight,
			);
			const blockIDs = headers.map(header => header.id);
			const transactionIDs = [];
			const batch = this._db.batch();
			for (const blockID of blockIDs) {
				try {
					const ids = await this._db.get<string[]>(
						`${DB_KEY_TRANSACTIONS_BLOCK_ID}${blockID}`,
					);
					transactionIDs.push(...ids);
				} catch (error) {
					if (!(error instanceof NotFoundError)) {
						throw error;
					}
				}
				batch.del(`${DB_KEY_BLOCKS_ID}${blockID}`);
				batch.del(`${DB_KEY_TRANSACTIONS_BLOCK_ID}${blockID}`);
			}
			// tslint:disable-next-line no-let
			for (let j = startHeight; j <= endHeight; j += 1) {
				batch.del(`${DB_KEY_BLOCKS_HEIGHT}${formatInt(j)}`);
			}
			for (const txID of transactionIDs) {
				batch.del(`${DB_KEY_TRANSACTIONS_ID}${txID}`);
			}
			await batch.write();
		}
	}

	public async isBlockPersisted(blockID: string): Promise<boolean> {
		return this._db.exists(`${DB_KEY_BLOCKS_ID}${blockID}`);
	}

	/*
		ChainState
	*/
	public async getChainState(key: string): Promise<string | undefined> {
		try {
			const value = await this._db.get<string>(`${DB_KEY_CHAIN_STATE}${key}`);

			return value;
		} catch (error) {
			if (error instanceof NotFoundError) {
				return undefined;
			}
			throw error;
		}
	}

	/*
		ConsensusState
	*/
	public async getConsensusState(key: string): Promise<string | undefined> {
		try {
			const value = await this._db.get<string>(
				`${DB_KEY_CONSENSUS_STATE}${key}`,
			);

			return value;
		} catch (error) {
			if (error instanceof NotFoundError) {
				return undefined;
			}
			throw error;
		}
	}

	/*
		Accounts
	*/
	public async getAccountByAddress(address: string): Promise<AccountJSON> {
		const account = await this._db.get<AccountJSON>(
			`${DB_KEY_ACCOUNTS_ADDRESS}${address}`,
		);

		return account;
	}

	public async getAccountsByPublicKey(
		arrayOfPublicKeys: ReadonlyArray<string>,
	): Promise<AccountJSON[]> {
		const addresses = arrayOfPublicKeys.map(getAddressFromPublicKey);

		return this.getAccountsByAddress(addresses);
	}

	public async getAccountsByAddress(
		arrayOfAddresses: ReadonlyArray<string>,
	): Promise<AccountJSON[]> {
		const accounts = [];
		for (const address of arrayOfAddresses) {
			const account = await this.getAccountByAddress(address);
			accounts.push(account);
		}

		return accounts;
	}

	// TODO: Remove this with issue #5259
	public async getDelegates(): Promise<AccountJSON[]> {
		const stream = this._db.createReadStream({
			gte: getFirstPrefix(DB_KEY_ACCOUNTS_ADDRESS),
			lte: getLastPrefix(DB_KEY_ACCOUNTS_ADDRESS),
		});
		const accounts = await new Promise<AccountJSON[]>((resolve, reject) => {
			const accountJSONs: AccountJSON[] = [];
			stream
				.on('data', ({ value }) => {
					const { username } = value as AccountJSON;
					if (username) {
						accountJSONs.push(value);
					}
				})
				.on('error', error => {
					reject(error);
				})
				.on('end', () => {
					resolve(accountJSONs);
				});
		});
		accounts.sort((a, b) => {
			const diff = BigInt(b.totalVotesReceived) - BigInt(a.totalVotesReceived);
			if (diff > BigInt(0)) {
				return 1;
			}
			if (diff < BigInt(0)) {
				return -1;
			}
			return a.address.localeCompare(b.address);
		});

		return accounts;
	}

	public async resetMemTables(): Promise<void> {
		await this._db.clear({
			gte: getFirstPrefix(DB_KEY_ACCOUNTS_ADDRESS),
			lte: getLastPrefix(DB_KEY_ACCOUNTS_ADDRESS),
		});
		await this._db.clear({
			gte: getFirstPrefix(DB_KEY_CHAIN_STATE),
			lte: getLastPrefix(DB_KEY_CHAIN_STATE),
		});
		await this._db.clear({
			gte: getFirstPrefix(DB_KEY_CONSENSUS_STATE),
			lte: getLastPrefix(DB_KEY_CONSENSUS_STATE),
		});
	}

	/*
		Transactions
	*/
	public async getTransactionByID(id: string): Promise<TransactionJSON> {
		const transaction = this._db.get<TransactionJSON>(
			`${DB_KEY_TRANSACTIONS_ID}${id}`,
		);

		return transaction;
	}

	public async getTransactionsByIDs(
		arrayOfTransactionIds: ReadonlyArray<string>,
	): Promise<TransactionJSON[]> {
		const transactions = [];
		for (const id of arrayOfTransactionIds) {
			const transaction = await this.getTransactionByID(id);
			transactions.push(transaction);
		}

		return transactions;
	}

	public async isTransactionPersisted(transactionId: string): Promise<boolean> {
		return this._db.exists(`${DB_KEY_TRANSACTIONS_ID}${transactionId}`);
	}

	/*
		Save Block
	*/
	public async saveBlock(
		blockJSON: BlockJSON,
		stateStore: StateStore,
		removeFromTemp = false,
	): Promise<void> {
		const batch = this._db.batch();
		const { transactions, ...header } = blockJSON;
		batch.put(`${DB_KEY_BLOCKS_ID}${header.id}`, header);
		batch.put(`${DB_KEY_BLOCKS_HEIGHT}${formatInt(header.height)}`, header.id);
		if (transactions.length > 0) {
			const ids = [];
			for (const tx of transactions) {
				ids.push(tx.id);
				batch.put(`${DB_KEY_TRANSACTIONS_ID}${tx.id as string}`, tx);
			}
			batch.put(`${DB_KEY_TRANSACTIONS_BLOCK_ID}${header.id}`, ids);
		}
		if (removeFromTemp) {
			batch.del(`${DB_KEY_TEMPBLOCKS_HEIGHT}${formatInt(blockJSON.height)}`);
		}
		stateStore.finalize(batch);
		await batch.write();
	}

	public async deleteBlock(
		blockJSON: BlockJSON,
		stateStore: StateStore,
		saveToTemp = false,
	): Promise<void> {
		const batch = this._db.batch();
		const { transactions, ...header } = blockJSON;
		batch.del(`${DB_KEY_BLOCKS_ID}${header.id}`);
		batch.del(`${DB_KEY_BLOCKS_HEIGHT}${formatInt(header.height)}`);
		if (transactions.length > 0) {
			for (const tx of transactions) {
				batch.del(`${DB_KEY_TRANSACTIONS_ID}${tx.id as string}`);
			}
			batch.del(`${DB_KEY_TRANSACTIONS_BLOCK_ID}${header.id}`);
		}
		if (saveToTemp) {
			batch.put(
				`${DB_KEY_TEMPBLOCKS_HEIGHT}${formatInt(blockJSON.height)}`,
				blockJSON,
			);
		}
		stateStore.finalize(batch);
		await batch.write();
	}

	private async _getTransactions(blockID: string): Promise<TransactionJSON[]> {
		const txIDs = [];
		try {
			const ids = await this._db.get<string[]>(
				`${DB_KEY_TRANSACTIONS_BLOCK_ID}${blockID}`,
			);
			txIDs.push(...ids);
		} catch (error) {
			if (!(error instanceof NotFoundError)) {
				throw error;
			}
		}
		if (txIDs.length === 0) {
			return [];
		}
		const transactions = [];
		for (const txID of txIDs) {
			const tx = await this._db.get<TransactionJSON>(
				`${DB_KEY_TRANSACTIONS_ID}${txID}`,
			);
			transactions.push(tx);
		}

		return transactions;
	}
}
