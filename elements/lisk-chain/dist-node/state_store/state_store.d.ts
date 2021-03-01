/// <reference types="node" />
import { BatchChain } from '@liskhq/lisk-db';
import { BlockHeader } from '../types';
import { AccountStore } from './account_store';
import { ChainStateStore } from './chain_state_store';
import { ConsensusStateStore } from './consensus_state_store';
import { DataAccess } from '../data_access';
interface AdditionalInformation {
    readonly lastBlockHeaders: ReadonlyArray<BlockHeader>;
    readonly networkIdentifier: Buffer;
    readonly lastBlockReward: bigint;
    readonly defaultAccount: Record<string, unknown>;
}
export declare class StateStore {
    readonly account: AccountStore;
    readonly chain: ChainStateStore;
    readonly consensus: ConsensusStateStore;
    constructor(dataAccess: DataAccess, additionalInformation: AdditionalInformation);
    createSnapshot(): void;
    restoreSnapshot(): void;
    finalize(height: string, batch: BatchChain): void;
}
export {};
