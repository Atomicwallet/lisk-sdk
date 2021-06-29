/// <reference types="node" />
import { Block, Chain, DataAccess, Validator, BlockHeader, Transaction, AccountDefaultProps } from '@liskhq/lisk-chain';
import { KVStore } from '@liskhq/lisk-db';
import { Processor } from '../node/processor';
import { GenesisConfig } from '../types';
import { ModuleClass, PartialAccount } from './types';
declare type Options = {
    genesisConfig?: GenesisConfig;
    databasePath?: string;
    passphrase?: string;
};
interface BlockProcessingParams<T = AccountDefaultProps> {
    modules?: ModuleClass[];
    options?: Options;
    accounts?: PartialAccount<T>[];
    initDelegates?: Buffer[];
}
export interface BlockProcessingEnv {
    createBlock: (payload?: Transaction[], timestamp?: number) => Promise<Block>;
    getProcessor: () => Processor;
    getChain: () => Chain;
    getBlockchainDB: () => KVStore;
    process: (block: Block) => Promise<void>;
    processUntilHeight: (height: number) => Promise<void>;
    getLastBlock: () => Block;
    getValidators: () => Promise<Validator[]>;
    getNextValidatorPassphrase: (blockHeader: BlockHeader) => Promise<string>;
    getDataAccess: () => DataAccess;
    getNetworkId: () => Buffer;
    cleanup: (config: Options) => Promise<void>;
}
export declare const getBlockProcessingEnv: (params: BlockProcessingParams) => Promise<BlockProcessingEnv>;
export {};
