import { Block, GenesisBlock, Transaction } from '@liskhq/lisk-chain';
import { AfterBlockApplyContext, AfterGenesisBlockApplyContext, ApplyAssetContext, BeforeBlockApplyContext, Consensus, ReducerHandler, StateStore, TransactionApplyContext, ValidateAssetContext } from '../types';
import { ModuleClass } from './types';
export declare const createAfterGenesisBlockApplyContext: <T = unknown>(params: {
    modules?: ModuleClass<import("..").BaseModule>[] | undefined;
    genesisBlock?: GenesisBlock<T> | undefined;
    reducerHandler?: ReducerHandler | undefined;
    stateStore?: StateStore | undefined;
}) => AfterGenesisBlockApplyContext<T>;
export declare const createBeforeBlockApplyContext: (params: {
    block: Block;
    reducerHandler?: ReducerHandler;
    stateStore?: StateStore;
}) => BeforeBlockApplyContext;
export declare const createAfterBlockApplyContext: (params: {
    block: Block;
    reducerHandler?: ReducerHandler;
    stateStore?: StateStore;
    consensus?: Consensus;
}) => AfterBlockApplyContext;
export declare const createTransactionApplyContext: (params: {
    transaction: Transaction;
    reducerHandler?: ReducerHandler;
    stateStore?: StateStore;
}) => TransactionApplyContext;
export declare const createApplyAssetContext: <T>(params: {
    transaction: Transaction;
    asset: T;
    reducerHandler?: ReducerHandler | undefined;
    stateStore?: StateStore | undefined;
}) => ApplyAssetContext<T>;
export declare const createValidateAssetContext: <T>(params: {
    transaction: Transaction;
    asset: T;
}) => ValidateAssetContext<T>;
