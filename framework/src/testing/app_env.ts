/*
 * Copyright © 2021 Lisk Foundation
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

import { APIClient, createIPCClient } from '@liskhq/lisk-api-client';
import { codec } from '@liskhq/lisk-codec';
import { join } from 'path';
import { ModuleClass, PluginClass } from './types';
import { defaultConfig } from './fixtures';
import { createGenesisBlockWithAccounts } from './fixtures/genesis_block';
import { PartialApplicationConfig } from '../types';
import { Application } from '../application';
import { DPoSModule } from '../modules/dpos';

interface GetApplicationEnv {
	modules: ModuleClass[];
	plugins?: PluginClass[];
	config?: PartialApplicationConfig;
	genesisBlock?: Record<string, unknown>;
}

interface ApplicationEnv {
	apiClient: APIClient;
	application: Application;
}

export const getApplicationEnv = async (params: GetApplicationEnv): Promise<ApplicationEnv> => {
	// As we can call this function with different configuration
	// so we need to make sure existing schemas are already clear
	codec.clearCache();

	// TODO: Remove this dependency in future
	if (!params.modules.includes(DPoSModule)) {
		params.modules.push(DPoSModule);
	}
	const { genesisBlockJSON } = createGenesisBlockWithAccounts(params.modules);
	const config = params.config ?? (defaultConfig as PartialApplicationConfig);
	const { label } = config;

	const application = new Application(params.genesisBlock ?? genesisBlockJSON, config);
	params.modules.map(module => application.registerModule(module));
	params.plugins?.map(plugin => application.registerPlugin(plugin));
	await Promise.race([application.run(), new Promise(resolve => setTimeout(resolve, 3000))]);

	const dataPath = join(application.config.rootPath, label as string);
	const apiClient = await createIPCClient(dataPath);

	return {
		apiClient,
		application,
	};
};

/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable dot-notation */

export const clearApplicationEnv = async (appEnv: ApplicationEnv): Promise<void> => {
	await appEnv.application['_forgerDB'].clear();
	await appEnv.application['_blockchainDB'].clear();
	await appEnv.application['_nodeDB'].clear();
	await appEnv.application.shutdown();
};
