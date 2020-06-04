/*
 * Copyright © 2018 Lisk Foundation
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

'use strict';

const { signData } = require('@liskhq/lisk-cryptography');
const { Codec } = require('@liskhq/lisk-codec');
const BaseGenerator = require('../base_generator');

const codec = new Codec();

const accounts = [
	{
		passphrase:
			'wear protect skill sentence lift enter wild sting lottery power floor neglect',
		privateKey: Buffer.from(
			'8f41ff1e75c4f0f8a71bae4952266928d0e91660fc513566ac694fed61157497efaf1d977897cb60d7db9d30e8fd668dee070ac0db1fb8d184c06152a8b75f8d',
			'hex',
		),
		publicKey: Buffer.from(
			'efaf1d977897cb60d7db9d30e8fd668dee070ac0db1fb8d184c06152a8b75f8d',
			'hex',
		),
		address: Buffer.from('4621f6e5fb351eefbe82b90e29ba400fd8f71cb4', 'hex'),
		nonce: BigInt(2),
	},
	{
		passphrase:
			'inherit moon normal relief spring bargain hobby join baby flash fog blood',
		privateKey: Buffer.from(
			'de4a28610239ceac2ec3f592e36a2ead8ed4ac93cb16aa0d996ab6bb0249da2c0b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe',
			'hex',
		),
		publicKey: Buffer.from(
			'0b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe',
			'hex',
		),
		address: Buffer.from('0fa1c01eb5cab297b0970a51657cd7322f2c8a5c', 'hex'),
		nonce: BigInt(2),
	},
	{
		passphrase:
			'better across runway mansion jar route valid crack panic favorite smooth sword',
		privateKey: Buffer.from(
			'de1520f8589408e76a97643ba7d27f20009b06899816c8af20f9b03f4a4bd8a66766ce280eb99e45d2cc7d9c8c852720940dab5d69f480e80477a97b4255d5d8',
			'hex',
		),
		publicKey: Buffer.from(
			'6766ce280eb99e45d2cc7d9c8c852720940dab5d69f480e80477a97b4255d5d8',
			'hex',
		),
		address: Buffer.from('ea8731ee308273e61c1854261be3b46da2f4f24f', 'hex'),
		nonce: BigInt(2),
	},
	{
		passphrase:
			'mirror swap middle hunt angle furnace maid scheme amazing box bachelor debris',
		privateKey: Buffer.from(
			'ad7462eb8f682b0c3424213ead044381ba0007bb65ce26287fc308027c871d951387d8ec6306807ffd6fe27ea3443985765c1157928bb09904307956f46a9972',
			'hex',
		),
		publicKey: Buffer.from(
			'1387d8ec6306807ffd6fe27ea3443985765c1157928bb09904307956f46a9972',
			'hex',
		),
		address: Buffer.from('48e8edbf0fe066108c467c6941bad717980e4f4f', 'hex'),
		nonce: BigInt(2),
	},
];

const networkIdentifier = Buffer.from(
	'e48feb88db5b5cf5ad71d93cdcd1d879b6d5ed187a36b0002cc34e0ef9883255',
	'hex',
);

const baseSchema = {
	$id: 'baseSchema',
	type: 'object',
	required: ['type', 'nonce', 'fee', 'senderPublicKey', 'asset'],
	properties: {
		type: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		nonce: {
			dataType: 'uint64',
			fieldNumber: 2,
		},
		fee: {
			dataType: 'uint64',
			fieldNumber: 3,
		},
		senderPublicKey: {
			dataType: 'bytes',
			fieldNumber: 4,
		},
		asset: {
			dataType: 'bytes',
			fieldNumber: 5,
		},
		signatures: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 6,
		},
	},
};

const balanceTransferAsset = {
	type: 'object',
	properties: {
		amount: { dataType: 'uint64', fieldNumber: 1 },
		recipientAddress: { dataType: 'bytes', fieldNumber: 2 },
		data: { dataType: 'string', fieldNumber: 3 },
	},
	required: ['amount', 'recipientAddress', 'data'],
};

const delegateRegAsset = {
	type: 'object',
	properties: { username: { dataType: 'string', fieldNumber: 1 } },
	required: ['username'],
};

const generateValidTransferTransaction = () => {
	const tx = {
		type: 8,
		senderPublicKey: accounts[0].publicKey,
		nonce: BigInt(2),
		fee: BigInt('100000000'),
		asset: {
			recipientAddress: accounts[1].address,
			amount: BigInt('1234567890'),
			data: 'random data',
		},
	};

	const assetBytes = codec.encode(balanceTransferAsset, tx.asset);
	const signingTx = {
		...tx,
		asset: assetBytes,
		signatures: [],
	};
	const signingBytes = codec.encode(baseSchema, signingTx);

	const signature = Buffer.from(
		signData(
			Buffer.concat([networkIdentifier, signingBytes]),
			accounts[0].passphrase,
		),
		'hex',
	);

	const encodedTx = codec.encode(baseSchema, {
		...tx,
		asset: assetBytes,
		signatures: [signature],
	});

	return {
		description: 'A valid transfer transaction',
		input: {
			account: {
				...accounts[0],
				nonce: accounts[0].nonce.toString(),
				publicKey: accounts[0].publicKey.toString('base64'),
				privateKey: accounts[0].privateKey.toString('base64'),
				address: accounts[0].address.toString('base64'),
			},
			networkIdentifier: networkIdentifier.toString('base64'),
		},
		output: {
			transaction: encodedTx.toString('base64'),
		},
	};
};

const generateValidDelegateTransaction = () => {
	const tx = {
		type: 10,
		senderPublicKey: accounts[0].publicKey,
		nonce: BigInt('2'),
		fee: BigInt('100000000'),
		asset: {
			username: 'new_delegate',
		},
	};

	const assetBytes = codec.encode(delegateRegAsset, tx.asset);
	const signingTx = {
		...tx,
		asset: assetBytes,
		signatures: [],
	};
	const signingBytes = codec.encode(baseSchema, signingTx);

	const signature = Buffer.from(
		signData(
			Buffer.concat([networkIdentifier, signingBytes]),
			accounts[0].passphrase,
		),
		'hex',
	);

	const encodedTx = codec.encode(baseSchema, {
		...tx,
		asset: assetBytes,
		signatures: [signature],
	});

	return {
		description: 'A valid delegate transaction',
		input: {
			account: {
				...accounts[0],
				nonce: accounts[0].nonce.toString(),
				publicKey: accounts[0].publicKey.toString('base64'),
				privateKey: accounts[0].privateKey.toString('base64'),
				address: accounts[0].address.toString('base64'),
			},
			networkIdentifier: networkIdentifier.toString('base64'),
		},
		output: {
			transaction: encodedTx.toString('base64'),
		},
	};
};

const validTransferSuite = () => ({
	title: 'Valid transfer transaction',
	summary: 'A valid transfer transaction',
	config: { network: 'devnet' },
	runner: 'transaction_network_id_and_change_order',
	handler: 'transfer_transaction_validate',
	testCases: [generateValidTransferTransaction()],
});

const validDelegateSuite = () => ({
	title: 'Valid delegate transaction',
	summary: 'A valid delegate transaction',
	config: { network: 'devnet' },
	runner: 'transaction_network_id_and_change_order',
	handler: 'delegate_transaction_validate',
	testCases: [generateValidDelegateTransaction()],
});

module.exports = BaseGenerator.runGenerator(
	'transaction_network_id_and_change_order',
	[validTransferSuite, validDelegateSuite],
);
