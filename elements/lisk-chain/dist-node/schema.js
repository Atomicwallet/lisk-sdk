"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegisteredBlockAssetSchema = exports.getGenesisBlockHeaderAssetSchema = exports.validatorsSchema = exports.stateDiffSchema = exports.blockHeaderAssetSchema = exports.baseAccountSchema = exports.baseGenesisBlockHeaderAssetSchema = exports.blockHeaderSchema = exports.signingBlockHeaderSchema = exports.blockSchema = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
exports.blockSchema = {
    $id: '/block',
    type: 'object',
    properties: {
        header: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
        payload: {
            type: 'array',
            items: {
                dataType: 'bytes',
            },
            fieldNumber: 2,
        },
    },
    required: ['header', 'payload'],
};
exports.signingBlockHeaderSchema = {
    $id: '/block/header/signing',
    type: 'object',
    properties: {
        version: { dataType: 'uint32', fieldNumber: 1 },
        timestamp: { dataType: 'uint32', fieldNumber: 2 },
        height: { dataType: 'uint32', fieldNumber: 3 },
        previousBlockID: { dataType: 'bytes', fieldNumber: 4 },
        transactionRoot: { dataType: 'bytes', fieldNumber: 5 },
        generatorPublicKey: { dataType: 'bytes', fieldNumber: 6 },
        reward: { dataType: 'uint64', fieldNumber: 7 },
        asset: { dataType: 'bytes', fieldNumber: 8 },
    },
    required: [
        'version',
        'timestamp',
        'height',
        'previousBlockID',
        'transactionRoot',
        'generatorPublicKey',
        'reward',
        'asset',
    ],
};
exports.blockHeaderSchema = {
    ...exports.signingBlockHeaderSchema,
    $id: '/block/header',
    properties: {
        ...exports.signingBlockHeaderSchema.properties,
        signature: { dataType: 'bytes', fieldNumber: 9 },
    },
};
exports.baseGenesisBlockHeaderAssetSchema = {
    $id: '/genesisBlock/header/asset',
    type: 'object',
    required: ['accounts', 'initDelegates', 'initRounds'],
    properties: {
        accounts: {
            type: 'array',
            fieldNumber: 1,
        },
        initDelegates: {
            type: 'array',
            items: {
                dataType: 'bytes',
            },
            fieldNumber: 2,
            minItems: 1,
        },
        initRounds: {
            dataType: 'uint32',
            fieldNumber: 3,
            minimum: 3,
        },
    },
};
exports.baseAccountSchema = {
    $id: '/account/base',
    type: 'object',
    properties: {
        address: { dataType: 'bytes', fieldNumber: 1 },
    },
    required: ['address'],
};
exports.blockHeaderAssetSchema = {
    $id: '/blockHeader/asset/v2',
    type: 'object',
    properties: {
        maxHeightPreviouslyForged: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
        maxHeightPrevoted: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
        seedReveal: {
            dataType: 'bytes',
            minLength: 16,
            maxLength: 16,
            fieldNumber: 3,
        },
    },
    required: ['maxHeightPreviouslyForged', 'maxHeightPrevoted', 'seedReveal'],
};
exports.stateDiffSchema = {
    $id: '/state/diff',
    type: 'object',
    required: ['updated', 'created'],
    properties: {
        updated: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                properties: {
                    key: {
                        dataType: 'string',
                        fieldNumber: 1,
                    },
                    value: {
                        dataType: 'bytes',
                        fieldNumber: 2,
                    },
                },
            },
        },
        created: {
            type: 'array',
            fieldNumber: 2,
            items: {
                dataType: 'string',
            },
        },
        deleted: {
            type: 'array',
            fieldNumber: 3,
            items: {
                type: 'object',
                properties: {
                    key: {
                        dataType: 'string',
                        fieldNumber: 1,
                    },
                    value: {
                        dataType: 'bytes',
                        fieldNumber: 2,
                    },
                },
            },
        },
    },
};
exports.validatorsSchema = {
    $id: '/state/validators',
    type: 'object',
    required: ['validators'],
    properties: {
        validators: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                properties: {
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    minActiveHeight: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                    isConsensusParticipant: {
                        dataType: 'boolean',
                        fieldNumber: 3,
                    },
                },
                required: ['address', 'minActiveHeight', 'isConsensusParticipant'],
            },
        },
    },
};
const getGenesisBlockHeaderAssetSchema = (accountSchema) => lisk_utils_1.objects.mergeDeep({}, exports.baseGenesisBlockHeaderAssetSchema, {
    properties: {
        accounts: {
            items: {
                ...accountSchema,
            },
        },
    },
});
exports.getGenesisBlockHeaderAssetSchema = getGenesisBlockHeaderAssetSchema;
const getRegisteredBlockAssetSchema = (accountSchema) => ({
    0: exports.getGenesisBlockHeaderAssetSchema(accountSchema),
    2: exports.blockHeaderAssetSchema,
});
exports.getRegisteredBlockAssetSchema = getRegisteredBlockAssetSchema;
//# sourceMappingURL=schema.js.map