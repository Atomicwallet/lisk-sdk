/// <reference types="node" />
import { BlockHeader } from '@liskhq/lisk-chain';
import { Logger } from '../../logger/logger';
import { Rounds } from './rounds';
export declare const generateRandomSeeds: ({ round, rounds, headers, logger, }: {
    round: number;
    rounds: Rounds;
    headers: readonly BlockHeader<import("@liskhq/lisk-chain/dist-node/types").BlockHeaderAsset>[];
    logger: Logger;
}) => [Buffer, Buffer];
