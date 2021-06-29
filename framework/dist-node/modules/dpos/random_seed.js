"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomSeeds = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const NUMBER_BYTE_SIZE = 4;
const RANDOM_SEED_BYTE_SIZE = 16;
const strippedHash = (data) => {
    if (!(data instanceof Buffer)) {
        throw new Error('Hash input is not a valid type');
    }
    return lisk_cryptography_1.hash(data).slice(0, RANDOM_SEED_BYTE_SIZE);
};
const bitwiseXOR = (bufferArray) => {
    if (bufferArray.length === 1) {
        return bufferArray[0];
    }
    const bufferSizes = new Set(bufferArray.map(buffer => buffer.length));
    if (bufferSizes.size > 1) {
        throw new Error('All input for XOR should be same size');
    }
    const outputSize = [...bufferSizes][0];
    const result = Buffer.alloc(outputSize, 0);
    for (let i = 0; i < outputSize; i += 1) {
        result[i] = bufferArray.map(b => b[i]).reduce((a, b) => a ^ b, 0);
    }
    return result;
};
const findPreviousHeaderOfDelegate = (header, searchTillHeight, headersMap) => {
    const { height, generatorPublicKey } = header;
    const searchTill = Math.max(searchTillHeight, 1);
    for (let i = height - 1; i >= searchTill; i -= 1) {
        if (headersMap[i].generatorPublicKey.equals(generatorPublicKey)) {
            return headersMap[i];
        }
    }
    return undefined;
};
const isValidSeedReveal = (seedReveal, previousSeedReveal) => strippedHash(seedReveal).equals(previousSeedReveal);
const selectSeedReveals = ({ fromHeight, toHeight, headersMap, rounds, }) => {
    const selected = [];
    for (let i = fromHeight; i >= toHeight; i -= 1) {
        const header = headersMap[i];
        if (!header) {
            continue;
        }
        const blockRound = rounds.calcRound(header.height);
        const lastForgedBlock = findPreviousHeaderOfDelegate(header, rounds.calcRoundStartHeight(blockRound - 1), headersMap);
        if (!lastForgedBlock) {
            continue;
        }
        if (!isValidSeedReveal(header.asset.seedReveal, lastForgedBlock.asset.seedReveal)) {
            continue;
        }
        selected.push(header.asset.seedReveal);
    }
    return selected;
};
const generateRandomSeeds = ({ round, rounds, headers, logger, }) => {
    const middleThreshold = Math.floor(rounds.blocksPerRound / 2);
    const startOfRound = rounds.calcRoundStartHeight(round);
    const middleOfRound = rounds.calcRoundMiddleHeight(round);
    const startOfLastRound = rounds.calcRoundStartHeight(round - 1);
    const endOfLastRound = rounds.calcRoundEndHeight(round - 1);
    const startOfSecondLastRound = rounds.calcRoundStartHeight(round - 2);
    const headersMap = headers.reduce((acc, header) => {
        if (header.height >= startOfSecondLastRound && header.height <= middleOfRound) {
            acc[header.height] = header;
        }
        return acc;
    }, {});
    logger.debug({
        fromHeight: startOfRound + middleThreshold,
        toHeight: startOfRound - middleThreshold,
    }, 'Fetching seed reveals for random seed 1');
    const seedRevealsForRandomSeed1 = selectSeedReveals({
        fromHeight: startOfRound + middleThreshold,
        toHeight: startOfRound - middleThreshold,
        headersMap,
        rounds,
    });
    logger.debug({
        fromHeight: endOfLastRound,
        toHeight: startOfLastRound,
    }, 'Fetching seed reveals for random seed 2');
    const seedRevealsForRandomSeed2 = selectSeedReveals({
        fromHeight: endOfLastRound,
        toHeight: startOfLastRound,
        headersMap,
        rounds,
    });
    const randomSeed1 = bitwiseXOR([
        strippedHash(lisk_cryptography_1.intToBuffer(startOfRound + middleThreshold, NUMBER_BYTE_SIZE)),
        ...seedRevealsForRandomSeed1,
    ]);
    const randomSeed2 = bitwiseXOR([
        strippedHash(lisk_cryptography_1.intToBuffer(endOfLastRound, NUMBER_BYTE_SIZE)),
        ...seedRevealsForRandomSeed2,
    ]);
    return [randomSeed1, randomSeed2];
};
exports.generateRandomSeeds = generateRandomSeeds;
//# sourceMappingURL=random_seed.js.map