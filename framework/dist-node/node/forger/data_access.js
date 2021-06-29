"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMaxHeightPreviouslyForged = exports.setPreviouslyForgedMap = exports.getPreviouslyForgedMap = exports.setUsedHashOnions = exports.getUsedHashOnions = exports.setRegisteredHashOnionSeeds = exports.getRegisteredHashOnionSeeds = exports.previouslyForgedInfoSchema = exports.usedHashOnionsStoreSchema = exports.registeredHashOnionsStoreSchema = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constant_1 = require("./constant");
exports.registeredHashOnionsStoreSchema = {
    title: 'Used hash onion',
    $id: '/node/forger/registered_hash_onion',
    type: 'object',
    required: ['registeredHashOnions'],
    properties: {
        registeredHashOnions: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['address', 'seedHash'],
                properties: {
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    seedHash: {
                        dataType: 'bytes',
                        fieldNumber: 2,
                    },
                },
            },
        },
    },
};
exports.usedHashOnionsStoreSchema = {
    title: 'Used hash onion',
    $id: '/node/forger/used_hash_onion',
    type: 'object',
    required: ['usedHashOnions'],
    properties: {
        usedHashOnions: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['address', 'count', 'height'],
                properties: {
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    count: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                    height: {
                        dataType: 'uint32',
                        fieldNumber: 3,
                    },
                },
            },
        },
    },
};
exports.previouslyForgedInfoSchema = {
    title: 'Previously Forged Info',
    $id: '/node/forger/previously_forged_info',
    type: 'object',
    required: ['previouslyForgedInfo'],
    properties: {
        previouslyForgedInfo: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['generatorAddress', 'height', 'maxHeightPrevoted', 'maxHeightPreviouslyForged'],
                properties: {
                    generatorAddress: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    height: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                    maxHeightPrevoted: {
                        dataType: 'uint32',
                        fieldNumber: 3,
                    },
                    maxHeightPreviouslyForged: {
                        dataType: 'uint32',
                        fieldNumber: 4,
                    },
                },
            },
        },
    },
};
lisk_codec_1.codec.addSchema(exports.registeredHashOnionsStoreSchema);
lisk_codec_1.codec.addSchema(exports.usedHashOnionsStoreSchema);
lisk_codec_1.codec.addSchema(exports.previouslyForgedInfoSchema);
const getRegisteredHashOnionSeeds = async (db) => {
    try {
        const registeredHashes = lisk_codec_1.codec.decode(exports.registeredHashOnionsStoreSchema, await db.get(constant_1.DB_KEY_FORGER_REGISTERED_HASH_ONION_SEEDS));
        const result = new lisk_utils_1.dataStructures.BufferMap();
        for (const registeredHash of registeredHashes.registeredHashOnions) {
            result.set(registeredHash.address, registeredHash.seedHash);
        }
        return result;
    }
    catch (error) {
        return new lisk_utils_1.dataStructures.BufferMap();
    }
};
exports.getRegisteredHashOnionSeeds = getRegisteredHashOnionSeeds;
const setRegisteredHashOnionSeeds = async (db, registeredHashOnionSeeds) => {
    const savingData = {
        registeredHashOnions: [],
    };
    for (const [address, seedHash] of registeredHashOnionSeeds.entries()) {
        savingData.registeredHashOnions.push({
            address,
            seedHash,
        });
    }
    const registeredHashOnionSeedsBuffer = lisk_codec_1.codec.encode(exports.registeredHashOnionsStoreSchema, savingData);
    await db.put(constant_1.DB_KEY_FORGER_REGISTERED_HASH_ONION_SEEDS, registeredHashOnionSeedsBuffer);
};
exports.setRegisteredHashOnionSeeds = setRegisteredHashOnionSeeds;
const getUsedHashOnions = async (db) => {
    try {
        return lisk_codec_1.codec.decode(exports.usedHashOnionsStoreSchema, await db.get(constant_1.DB_KEY_FORGER_USED_HASH_ONION)).usedHashOnions;
    }
    catch (error) {
        return [];
    }
};
exports.getUsedHashOnions = getUsedHashOnions;
const setUsedHashOnions = async (db, usedHashOnions) => {
    const usedHashOnionObject = { usedHashOnions };
    await db.put(constant_1.DB_KEY_FORGER_USED_HASH_ONION, lisk_codec_1.codec.encode(exports.usedHashOnionsStoreSchema, usedHashOnionObject));
};
exports.setUsedHashOnions = setUsedHashOnions;
const getPreviouslyForgedMap = async (db) => {
    try {
        const previouslyForgedBuffer = await db.get(constant_1.DB_KEY_FORGER_PREVIOUSLY_FORGED);
        const parsedMap = lisk_codec_1.codec.decode(exports.previouslyForgedInfoSchema, previouslyForgedBuffer);
        const result = new lisk_utils_1.dataStructures.BufferMap();
        for (const object of parsedMap.previouslyForgedInfo) {
            const { generatorAddress, ...forgedInfo } = object;
            result.set(generatorAddress, forgedInfo);
        }
        return result;
    }
    catch (error) {
        if (!(error instanceof lisk_db_1.NotFoundError)) {
            throw error;
        }
        return new lisk_utils_1.dataStructures.BufferMap();
    }
};
exports.getPreviouslyForgedMap = getPreviouslyForgedMap;
const setPreviouslyForgedMap = async (db, previouslyForgedMap) => {
    const previouslyForgedStoreObject = { previouslyForgedInfo: [] };
    for (const [key, value] of previouslyForgedMap.entries()) {
        previouslyForgedStoreObject.previouslyForgedInfo.push({ generatorAddress: key, ...value });
    }
    previouslyForgedStoreObject.previouslyForgedInfo.sort((a, b) => a.generatorAddress.compare(b.generatorAddress));
    await db.put(constant_1.DB_KEY_FORGER_PREVIOUSLY_FORGED, lisk_codec_1.codec.encode(exports.previouslyForgedInfoSchema, previouslyForgedStoreObject));
};
exports.setPreviouslyForgedMap = setPreviouslyForgedMap;
const saveMaxHeightPreviouslyForged = async (db, header, previouslyForgedMap) => {
    var _a;
    const generatorAddress = lisk_cryptography_1.getAddressFromPublicKey(header.generatorPublicKey);
    const previouslyForged = previouslyForgedMap.get(generatorAddress);
    const previouslyForgedHeightByDelegate = (_a = previouslyForged === null || previouslyForged === void 0 ? void 0 : previouslyForged.height) !== null && _a !== void 0 ? _a : 0;
    if (header.height <= previouslyForgedHeightByDelegate) {
        return;
    }
    previouslyForgedMap.set(generatorAddress, {
        height: header.height,
        maxHeightPrevoted: header.asset.maxHeightPrevoted,
        maxHeightPreviouslyForged: header.asset.maxHeightPreviouslyForged,
    });
    await exports.setPreviouslyForgedMap(db, previouslyForgedMap);
};
exports.saveMaxHeightPreviouslyForged = saveMaxHeightPreviouslyForged;
//# sourceMappingURL=data_access.js.map