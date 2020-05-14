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
 *
 */

'use strict';

const { constantsConfig, nodeConfig } = require('../configs');
const {
	registeredTransactions,
} = require('../../utils/registered_transactions');
const { createMockChannel } = require('../channel');
const { Node } = require('../../../src/application/node');
const genesisBlock = require('../../fixtures/config/devnet/genesis_block.json');
const config = require('../../fixtures/config/devnet/config.json');

const { components, modules, ...rootConfigs } = config;
const { network, ...nodeConfigs } = rootConfigs;

const createNode = ({ storage, forgerDB, logger, channel, options = {} }) => {
	const nodeOptions = {
		...nodeConfig(),
		...nodeConfigs,
		...options,
		constants: constantsConfig(),
		genesisBlock,
		registeredTransactions: { ...registeredTransactions },
	};
	return new Node({
		channel: channel || createMockChannel(),
		options: nodeOptions,
		logger,
		storage,
		forgerDB,
		applicationState: null,
	});
};

/* eslint-disable @typescript-eslint/no-empty-function */
const fakeLogger = {
	trace: () => {},
	debug: () => {},
	info: () => {},
	error: () => {},
	warn: () => {},
	fatal: () => {},
};
/* eslint-enable @typescript-eslint/no-empty-function */

const createAndLoadNode = async (
	storage,
	forgerDB,
	logger = fakeLogger,
	channel = undefined,
	options = {},
) => {
	const chainModule = createNode({
		storage,
		forgerDB,
		logger,
		channel,
		options,
	});
	await chainModule.bootstrap();
	return chainModule;
};

module.exports = {
	createNode,
	createAndLoadNode,
	fakeLogger,
};
