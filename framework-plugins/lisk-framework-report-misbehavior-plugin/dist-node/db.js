"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBlockHeaders = exports.getContradictingBlockHeader = exports.saveBlockHeaders = exports.decodeBlockHeader = exports.getBlockHeaders = exports.getDBInstance = exports.blockHeadersSchema = void 0;
const lisk_db_1 = require("@liskhq/lisk-db");
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_bft_1 = require("@liskhq/lisk-bft");
const os = require("os");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
exports.blockHeadersSchema = {
    $id: 'lisk/reportMisbehavior/blockHeaders',
    type: 'object',
    required: ['blockHeaders'],
    properties: {
        blockHeaders: {
            type: 'array',
            fieldNumber: 1,
            items: {
                dataType: 'bytes',
            },
        },
    },
};
const getDBInstance = async (dataPath, dbName = 'lisk-framework-report-misbehavior-plugin.db') => {
    const dirPath = path_1.join(dataPath.replace('~', os.homedir()), 'plugins/data', dbName);
    await fs_extra_1.ensureDir(dirPath);
    return new lisk_db_1.KVStore(dirPath);
};
exports.getDBInstance = getDBInstance;
const getBlockHeaders = async (db, dbKeyBlockHeader) => {
    try {
        const encodedBlockHeaders = await db.get(dbKeyBlockHeader);
        return lisk_codec_1.codec.decode(exports.blockHeadersSchema, encodedBlockHeaders);
    }
    catch (error) {
        return { blockHeaders: [] };
    }
};
exports.getBlockHeaders = getBlockHeaders;
const decodeBlockHeader = (encodedHeader, schema) => {
    const id = lisk_cryptography_1.hash(encodedHeader);
    const blockHeader = lisk_codec_1.codec.decode(schema.blockHeader, encodedHeader);
    const assetSchema = schema.blockHeadersAssets[blockHeader.version];
    const asset = lisk_codec_1.codec.decode(assetSchema, blockHeader.asset);
    return {
        ...blockHeader,
        asset,
        id,
    };
};
exports.decodeBlockHeader = decodeBlockHeader;
const saveBlockHeaders = async (db, schemas, header) => {
    const blockId = lisk_cryptography_1.hash(header);
    const { generatorPublicKey, height } = lisk_codec_1.codec.decode(schemas.blockHeader, header);
    const dbKey = `${generatorPublicKey.toString('binary')}:${lisk_db_1.formatInt(height)}`;
    const { blockHeaders } = await exports.getBlockHeaders(db, dbKey);
    if (!blockHeaders.find(blockHeader => lisk_cryptography_1.hash(blockHeader).equals(blockId))) {
        await db.put(dbKey, lisk_codec_1.codec.encode(exports.blockHeadersSchema, {
            blockHeaders: [...blockHeaders, header],
        }));
        return true;
    }
    return false;
};
exports.saveBlockHeaders = saveBlockHeaders;
const getContradictingBlockHeader = async (db, blockHeader, schemas) => new Promise((resolve, reject) => {
    const stream = db.createReadStream({
        gte: lisk_db_1.getFirstPrefix(blockHeader.generatorPublicKey.toString('binary')),
        lte: lisk_db_1.getLastPrefix(blockHeader.generatorPublicKey.toString('binary')),
    });
    stream
        .on('data', ({ value }) => {
        const { blockHeaders } = lisk_codec_1.codec.decode(exports.blockHeadersSchema, value);
        for (const encodedHeader of blockHeaders) {
            const decodedBlockHeader = exports.decodeBlockHeader(encodedHeader, schemas);
            if (lisk_bft_1.areHeadersContradicting(blockHeader, decodedBlockHeader)) {
                stream.destroy();
                resolve(decodedBlockHeader);
            }
        }
    })
        .on('error', error => {
        reject(error);
    })
        .on('end', () => {
        resolve(undefined);
    });
});
exports.getContradictingBlockHeader = getContradictingBlockHeader;
const clearBlockHeaders = async (db, schemas, currentHeight) => {
    const keys = await new Promise((resolve, reject) => {
        const stream = db.createReadStream();
        const res = [];
        stream
            .on('data', ({ key, value }) => {
            const { blockHeaders } = lisk_codec_1.codec.decode(exports.blockHeadersSchema, value);
            for (const encodedHeader of blockHeaders) {
                const decodedBlockHeader = exports.decodeBlockHeader(encodedHeader, schemas);
                if (decodedBlockHeader.height < currentHeight - 260000) {
                    res.push(key);
                }
            }
        })
            .on('error', error => {
            reject(error);
        })
            .on('end', () => {
            resolve(res);
        });
    });
    const batch = db.batch();
    for (const k of keys) {
        batch.del(k);
    }
    await batch.write();
};
exports.clearBlockHeaders = clearBlockHeaders;
//# sourceMappingURL=db.js.map