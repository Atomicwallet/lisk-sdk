"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOnion = exports.generateHashOnionSeed = void 0;
const hash_1 = require("./hash");
const nacl_1 = require("./nacl");
const HASH_SIZE = 16;
const INPUT_SIZE = 64;
const defaultCount = 1000000;
const defaultDistance = 1000;
const generateHashOnionSeed = () => hash_1.hash(nacl_1.getRandomBytes(INPUT_SIZE)).slice(0, HASH_SIZE);
exports.generateHashOnionSeed = generateHashOnionSeed;
const hashOnion = (seed, count = defaultCount, distance = defaultDistance) => {
    if (count < distance) {
        throw new Error('Invalid count or distance. Count must be greater than distance');
    }
    if (count % distance !== 0) {
        throw new Error('Invalid count. Count must be multiple of distance');
    }
    let previousHash = seed;
    const hashes = [seed];
    for (let i = 1; i <= count; i += 1) {
        const nextHash = hash_1.hash(previousHash).slice(0, HASH_SIZE);
        if (i % distance === 0) {
            hashes.push(nextHash);
        }
        previousHash = nextHash;
    }
    return hashes.reverse();
};
exports.hashOnion = hashOnion;
//# sourceMappingURL=hash_onion.js.map