/// <reference types="node" />
import { Logger } from '../../logger/logger';
import { Consensus, StateStore } from '../../types';
import { DelegateWeight } from './types';
export declare const shuffleDelegateList: (previousRoundSeed1: Buffer, addresses: ReadonlyArray<Buffer>) => ReadonlyArray<Buffer>;
export declare const pickStandByDelegate: (delegateWeights: ReadonlyArray<DelegateWeight>, randomSeed: Buffer) => number;
export declare const updateDelegateList: ({ round, randomSeeds, stateStore, activeDelegates, standbyDelegates, consensus, }: {
    round: number;
    randomSeeds: ReadonlyArray<Buffer>;
    consensus: Consensus;
    stateStore: StateStore;
    activeDelegates: number;
    standbyDelegates: number;
}) => Promise<void>;
export declare const createVoteWeightsSnapshot: ({ height, stateStore, round, logger, voteWeightCapRate, activeDelegates, standbyDelegates, standbyThreshold, }: {
    height: number;
    stateStore: StateStore;
    round: number;
    voteWeightCapRate?: number | undefined;
    activeDelegates?: number | undefined;
    standbyDelegates?: number | undefined;
    standbyThreshold?: bigint | undefined;
    logger: Logger;
}) => Promise<void>;
export declare const updateDelegateProductivity: ({ height, blockTime, generatorPublicKey, blockTimestamp, stateStore, consensus, }: {
    height: number;
    blockTime: number;
    generatorPublicKey: Buffer;
    blockTimestamp: number;
    stateStore: StateStore;
    consensus: Consensus;
}) => Promise<void>;
