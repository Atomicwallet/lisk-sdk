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
import { APIClient } from '@liskhq/lisk-api-client';
import { Account, AccountDefaultProps } from '@liskhq/lisk-chain';
import { GenesisConfig } from '..';
import { BaseAsset, BaseModule } from '../modules';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AssetClass<T = any> = new (args?: T) => BaseAsset;
export type ModuleClass = new (genesisConfig: GenesisConfig) => BaseModule;
export type PartialAccount<T = AccountDefaultProps> = Partial<Account<T>> & { address: Buffer };
export interface Data {
	readonly block: string;
}
export interface WaitOptions {
	apiClient: APIClient;
	height: number;
	timeout?: number;
}
