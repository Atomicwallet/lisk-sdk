import { BlockHeader } from '@liskhq/lisk-chain';
import { Logger } from '../../logger/logger';
import { Rounds } from './rounds';
import { FixedLengthArray, RandomSeed } from './types';
export declare const generateRandomSeeds: ({ round, rounds, headers, logger, }: {
    round: number;
    rounds: Rounds;
    headers: ReadonlyArray<BlockHeader>;
    logger: Logger;
}) => FixedLengthArray<RandomSeed, 2>;
