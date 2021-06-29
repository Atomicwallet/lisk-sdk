"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readGenesisBlockJSON = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const schema_1 = require("../schema");
const readGenesisBlockJSON = (genesisBlockJSON, accountSchemas) => {
    const accountSchema = lisk_utils_1.objects.cloneDeep(schema_1.baseAccountSchema);
    for (const [name, schema] of Object.entries(accountSchemas)) {
        const { default: defaultProps, ...others } = schema;
        accountSchema.properties[name] = others;
    }
    const assetSchema = {
        ...schema_1.blockHeaderSchema.properties.asset,
        ...schema_1.getGenesisBlockHeaderAssetSchema(accountSchema),
        dataType: undefined,
    };
    delete assetSchema.dataType;
    delete assetSchema.fieldNumber;
    const genesisBlockSchema = {
        ...schema_1.blockSchema,
        properties: {
            ...schema_1.blockSchema.properties,
            header: {
                ...schema_1.blockHeaderSchema,
                properties: {
                    ...schema_1.blockHeaderSchema.properties,
                    asset: assetSchema,
                },
            },
        },
    };
    const cloned = lisk_utils_1.objects.cloneDeep(genesisBlockJSON);
    if (typeof cloned.header === 'object' && cloned.header !== null) {
        delete cloned.header.id;
    }
    const genesisBlock = lisk_codec_1.codec.fromJSON(genesisBlockSchema, cloned);
    const genesisAssetBuffer = lisk_codec_1.codec.encode(assetSchema, genesisBlock.header.asset);
    const id = lisk_cryptography_1.hash(lisk_codec_1.codec.encode(schema_1.blockHeaderSchema, {
        ...genesisBlock.header,
        asset: genesisAssetBuffer,
    }));
    return {
        ...genesisBlock,
        header: {
            ...genesisBlock.header,
            id,
        },
    };
};
exports.readGenesisBlockJSON = readGenesisBlockJSON;
//# sourceMappingURL=genesis_block.js.map