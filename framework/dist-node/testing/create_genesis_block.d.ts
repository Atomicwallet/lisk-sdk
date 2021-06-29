/// <reference types="node" />
import { AccountDefaultProps, GenesisBlock } from '@liskhq/lisk-chain';
import { ModuleClass, PartialAccount } from './types';
import { GenesisConfig } from '../types';
interface CreateGenesisBlock<T> {
    modules: ModuleClass[];
    accounts?: PartialAccount<T>[];
    genesisConfig?: GenesisConfig;
    initDelegates?: ReadonlyArray<Buffer>;
    height?: number;
    initRounds?: number;
    timestamp?: number;
    previousBlockID?: Buffer;
}
export declare const createGenesisBlock: <T = AccountDefaultProps>(params: CreateGenesisBlock<T>) => {
    genesisBlock: GenesisBlock<T>;
    genesisBlockJSON: Record<string, unknown>;
};
export {};
