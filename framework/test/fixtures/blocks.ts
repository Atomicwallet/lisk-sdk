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
	getRandomBytes,
	hash,
	signDataWithPrivateKey,
	getPrivateAndPublicKeyFromPassphrase,
} from '@liskhq/lisk-cryptography';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { MerkleTree } from '@liskhq/lisk-tree';
import { Block, BlockHeader, Chain } from '@liskhq/lisk-chain';
import { GenesisBlock } from '@liskhq/lisk-genesis';
import { BaseTransaction } from '@liskhq/lisk-transactions';
import * as genesisBlockJSON from './config/devnet/genesis_block.json';
import { BlockProcessorV2 } from '../../src/application/node/block_processor_v2';
import { genesisBlockFromJSON } from '../../src/application/genesis_block';
import { AccountAsset } from '../../src/application/node/account';
import { BlockProcessorV0 } from '../../src/application/node/block_processor_v0';

export const defaultNetworkIdentifier = Buffer.from(
	'93d00fe5be70d90e7ae247936a2e7d83b50809c79b73fa14285f02c842348b3e',
	'hex',
);

export const genesisBlock = (): GenesisBlock<AccountAsset> =>
	genesisBlockFromJSON(genesisBlockJSON);

const getKeyPair = (): { publicKey: Buffer; privateKey: Buffer } => {
	const passphrase = Mnemonic.generateMnemonic();
	return getPrivateAndPublicKeyFromPassphrase(passphrase);
};

export const defaultBlockHeaderAssetSchema = {
	$id: 'test/defaultBlockHeaderAssetSchema',
	type: 'object',
	properties: {
		maxHeightPreviouslyForged: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		maxHeightPrevoted: {
			dataType: 'uint32',
			fieldNumber: 2,
		},
		seedReveal: {
			dataType: 'bytes',
			fieldNumber: 3,
		},
	},
	required: ['maxHeightPreviouslyForged', 'maxHeightPrevoted', 'seedReveal'],
};

export const encodeValidBlockHeader = (header: BlockHeader): Buffer => {
	const chain = new Chain({
		registeredBlocks: {
			2: BlockProcessorV2.schema,
			0: BlockProcessorV0.schema,
		},
		accountAsset: { schema: {}, default: {} },
		genesisBlock: {
			header: {
				timestamp: 0,
			},
		},
	} as any);
	return chain.dataAccess.encodeBlockHeader(header);
};

export const createFakeBlockHeader = (header?: Partial<BlockHeader>): BlockHeader => {
	const blockHeader = {
		id: hash(getRandomBytes(8)),
		version: 2,
		timestamp: header?.timestamp ?? 0,
		height: header?.height ?? 0,
		previousBlockID: header?.previousBlockID ?? hash(getRandomBytes(4)),
		transactionRoot: header?.transactionRoot ?? hash(getRandomBytes(4)),
		generatorPublicKey: header?.generatorPublicKey ?? getRandomBytes(32),
		reward: header?.reward ?? BigInt(500000000),
		asset: header?.asset ?? {
			maxHeightPreviouslyForged: 0,
			maxHeightPrevoted: 0,
			seedReveal: getRandomBytes(16),
		},
		signature: header?.signature ?? getRandomBytes(64),
	};
	const id = hash(encodeValidBlockHeader(blockHeader));

	return {
		...blockHeader,
		id,
	};
};

/**
 * Utility function to create a block object with valid computed properties while any property can be overridden
 * Calculates the signature, transactionRoot etc. internally. Facilitating the creation of block with valid signature and other properties
 */
export const createValidDefaultBlock = (
	block?: { header?: Partial<BlockHeader>; payload?: BaseTransaction[] },
	networkIdentifier: Buffer = defaultNetworkIdentifier,
): Block => {
	const keypair = getKeyPair();
	const payload = block?.payload ?? [];
	const txTree = new MerkleTree(payload.map(tx => tx.id));

	const asset = {
		maxHeightPreviouslyForged: 0,
		maxHeightPrevoted: 0,
		seedReveal: getRandomBytes(16),
		...block?.header?.asset,
	};

	const blockHeader = createFakeBlockHeader({
		version: 2,
		height: 1,
		previousBlockID: genesisBlock().header.id,
		reward: BigInt(0),
		timestamp: 1000,
		transactionRoot: txTree.root,
		generatorPublicKey: keypair.publicKey,
		...block?.header,
		asset,
	});

	const chain = new Chain({
		registeredBlocks: {
			2: BlockProcessorV2.schema,
			0: BlockProcessorV0.schema,
		},
		accountAsset: { schema: {}, default: {} },
		genesisBlock: {
			header: {
				timestamp: 0,
			},
		},
	} as any);

	const encodedHeaderWithoutSignature = chain.dataAccess.encodeBlockHeader(blockHeader, true);

	const signature = signDataWithPrivateKey(
		Buffer.concat([networkIdentifier, encodedHeaderWithoutSignature]),
		keypair.privateKey,
	);
	const header = { ...blockHeader, signature };
	const encodedHeader = chain.dataAccess.encodeBlockHeader(header);
	const id = hash(encodedHeader);

	return {
		header: {
			...header,
			asset,
			id,
		},
		payload,
	};
};

export const encodeValidBlock = (block: Block): Buffer => {
	const chain = new Chain({
		registeredBlocks: {
			2: BlockProcessorV2.schema,
			0: BlockProcessorV0.schema,
		},
		accountAsset: { schema: {}, default: {} },
		genesisBlock: {
			header: {
				timestamp: 0,
			},
		},
	} as any);
	return chain.dataAccess.encode(block);
};
