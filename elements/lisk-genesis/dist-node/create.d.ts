import { Schema } from '@liskhq/lisk-codec';
import { GenesisBlock, AccountDefaultProps } from '@liskhq/lisk-chain';
import { GenesisBlockParams, GenesisBlockJSONParams, accountAssetSchemas } from './types';
export declare const getGenesisBlockSchema: (accountSchema: accountAssetSchemas) => Schema;
export declare const createGenesisBlock: <T = AccountDefaultProps>(params: GenesisBlockParams<T>) => GenesisBlock<T>;
export declare const getGenesisBlockJSON: (params: GenesisBlockJSONParams) => Record<string, unknown>;
