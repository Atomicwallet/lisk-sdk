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
import {
	Application,
	KeysModule,
	PartialApplicationConfig,
	SequenceModule,
	testing,
	TokenModule,
} from 'lisk-framework';
import { getAddressFromPublicKey } from '@liskhq/lisk-cryptography';
import { validator } from '@liskhq/lisk-validator';
import * as configJSON from '../fixtures/config.json';
import { ForgerPlugin } from '../../src';
import { getForgerInfo as getForgerInfoFromDB } from '../../src/db';
import { getGenesisBlockJSON } from './genesis_block';
import { ForgerInfo } from '../../src/types';

const forgerApiPort = 5001;

export const getForgerPlugin = (app: Application): ForgerPlugin => {
	return app['_controller']['_inMemoryPlugins'][ForgerPlugin.alias]['plugin'];
};

export const createApplicationEnv = (
	label: string,
	options: {
		consoleLogLevel?: string;
		clearDB?: boolean;
		appConfig?: { plugins: { forger: object } };
	} = {
		clearDB: true,
		consoleLogLevel: 'fatal',
		appConfig: { plugins: { forger: {} } },
	},
): testing.ApplicationEnv => {
	const rootPath = '~/.lisk/forger-plugin';
	const config = {
		...configJSON,
		rootPath,
		label,
		logger: {
			consoleLogLevel: options.consoleLogLevel ?? 'fatal',
			fileLogLevel: 'fatal',
			logFileName: 'lisk.log',
		},
		network: {
			...configJSON.network,
			maxInboundConnections: 0,
		},
		plugins: {
			forger: {
				port: forgerApiPort,
				...options.appConfig?.plugins.forger,
			},
		},
		rpc: {
			enable: true,
			port: 8080,
			mode: 'ipc',
		},
	} as PartialApplicationConfig;

	// Update the genesis block JSON to avoid having very long calculations of missed blocks in tests
	const genesisBlock = getGenesisBlockJSON({
		timestamp: Math.floor(Date.now() / 1000) - 30,
	});

	const appEnv = new testing.ApplicationEnv({
		modules: [TokenModule, SequenceModule, KeysModule],
		config,
		plugins: [ForgerPlugin],
		genesisBlock,
	});
	// const appEnv = await testing.getApplicationEnv();
	validator.removeSchema('/block/header');

	return appEnv;
};
export const closeApplicationEnv = async (
	appEnv: testing.ApplicationEnv,
	options: { clearDB: boolean } = { clearDB: true },
) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
	await appEnv.stopApplication(options);
};

export const waitTill = async (ms: number): Promise<void> =>
	new Promise(r =>
		setTimeout(() => {
			r();
		}, ms),
	);

export const callNetwork = async (
	promise: Promise<any>,
): Promise<{ status: number; response: any }> => {
	let response;
	let status;

	try {
		const result = await promise;
		response = result.data;
		status = result.status;
	} catch (error) {
		status = error.response.status;
		response = error.response.data;
	}

	return { status, response };
};

export const getForgerInfoByPublicKey = async (
	forgerPluginInstance: ForgerPlugin,
	generatorPublicKey: string,
): Promise<ForgerInfo> => {
	const forgerAddress = getAddressFromPublicKey(Buffer.from(generatorPublicKey, 'hex')).toString(
		'binary',
	);

	const forgerInfo = await getForgerInfoFromDB(
		forgerPluginInstance['_forgerPluginDB'],
		forgerAddress,
	);

	return forgerInfo;
};

export const getForgerInfoByAddress = async (
	forgerPluginInstance: ForgerPlugin,
	forgerAddress: string,
): Promise<ForgerInfo> => {
	const forgerInfo = await getForgerInfoFromDB(
		forgerPluginInstance['_forgerPluginDB'],
		forgerAddress,
	);

	return forgerInfo;
};
