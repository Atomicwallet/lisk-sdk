"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteWeightsSchema = exports.dposAccountSchema = exports.dposModuleParamsSchema = exports.delegatesUserNamesSchema = void 0;
exports.delegatesUserNamesSchema = {
    $id: '/dpos/userNames',
    type: 'object',
    properties: {
        registeredDelegates: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['username', 'address'],
                properties: {
                    username: {
                        dataType: 'string',
                        fieldNumber: 1,
                    },
                    address: {
                        dataType: 'bytes',
                        fieldNumber: 2,
                    },
                },
            },
        },
    },
    required: ['registeredDelegates'],
};
exports.dposModuleParamsSchema = {
    $id: '/dpos/params',
    type: 'object',
    required: ['activeDelegates', 'standbyDelegates', 'delegateListRoundOffset'],
    additionalProperties: true,
    properties: {
        activeDelegates: {
            dataType: 'uint32',
        },
        standbyDelegates: {
            dataType: 'uint32',
        },
        delegateListRoundOffset: {
            dataType: 'uint32',
        },
    },
};
exports.dposAccountSchema = {
    type: 'object',
    properties: {
        delegate: {
            type: 'object',
            fieldNumber: 1,
            properties: {
                username: { dataType: 'string', fieldNumber: 1 },
                pomHeights: {
                    type: 'array',
                    items: { dataType: 'uint32' },
                    fieldNumber: 2,
                },
                consecutiveMissedBlocks: { dataType: 'uint32', fieldNumber: 3 },
                lastForgedHeight: { dataType: 'uint32', fieldNumber: 4 },
                isBanned: { dataType: 'boolean', fieldNumber: 5 },
                totalVotesReceived: { dataType: 'uint64', fieldNumber: 6 },
            },
            required: [
                'username',
                'pomHeights',
                'consecutiveMissedBlocks',
                'lastForgedHeight',
                'isBanned',
                'totalVotesReceived',
            ],
        },
        sentVotes: {
            type: 'array',
            fieldNumber: 2,
            items: {
                type: 'object',
                properties: {
                    delegateAddress: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    amount: {
                        dataType: 'uint64',
                        fieldNumber: 2,
                    },
                },
                required: ['delegateAddress', 'amount'],
            },
        },
        unlocking: {
            type: 'array',
            fieldNumber: 3,
            items: {
                type: 'object',
                properties: {
                    delegateAddress: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                    amount: {
                        dataType: 'uint64',
                        fieldNumber: 2,
                    },
                    unvoteHeight: {
                        dataType: 'uint32',
                        fieldNumber: 3,
                    },
                },
                required: ['delegateAddress', 'amount', 'unvoteHeight'],
            },
        },
    },
    default: {
        delegate: {
            username: '',
            pomHeights: [],
            consecutiveMissedBlocks: 0,
            lastForgedHeight: 0,
            isBanned: false,
            totalVotesReceived: BigInt(0),
        },
        sentVotes: [],
        unlocking: [],
    },
};
exports.voteWeightsSchema = {
    $id: '/dpos/voteWeights',
    type: 'object',
    properties: {
        voteWeights: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                properties: {
                    round: {
                        dataType: 'uint32',
                        fieldNumber: 1,
                    },
                    delegates: {
                        type: 'array',
                        fieldNumber: 2,
                        items: {
                            type: 'object',
                            properties: {
                                address: {
                                    dataType: 'bytes',
                                    fieldNumber: 1,
                                },
                                voteWeight: {
                                    dataType: 'uint64',
                                    fieldNumber: 2,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    required: ['voteWeights'],
};
//# sourceMappingURL=schema.js.map