import { Schema } from '@liskhq/lisk-codec';
import { GenesisBlock } from '@liskhq/lisk-chain';
import { GenesisBlockParams, GenesisBlockJSONParams, accountAssetSchemas } from './types';
export declare const getGenesisBlockSchema: (accountSchema: accountAssetSchemas) => Schema;
export declare const createGenesisBlock: (params: GenesisBlockParams) => GenesisBlock<import("@liskhq/lisk-chain").AccountDefaultProps>;
export declare const getGenesisBlockJSON: (params: GenesisBlockJSONParams) => Record<string, unknown>;
