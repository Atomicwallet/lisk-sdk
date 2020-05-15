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

import { applicationConfigSchema } from '../../../src/application/schema/application_config_schema';
import { ApplicationConfig } from '../../../src/application/application';

export const nodeConfig = (
	overriddenConfigProperties: Partial<ApplicationConfig> = {},
): ApplicationConfig =>
	({
		...applicationConfigSchema.default,
		...overriddenConfigProperties,
	} as ApplicationConfig);
