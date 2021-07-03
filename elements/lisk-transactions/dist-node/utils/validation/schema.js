"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = {
    $id: 'lisk/transaction',
    type: 'object',
    required: ['type', 'amount', 'fee', 'senderPublicKey', 'timestamp'],
    properties: {
        id: {
            type: 'string',
        },
        blockId: {
            type: 'string',
        },
        amount: {
            type: ['string', 'integer'],
        },
        fee: {
            type: ['string', 'integer'],
        },
        type: {
            type: 'integer',
        },
        timestamp: {
            type: 'integer',
        },
        senderId: {
            type: 'string',
        },
        senderPublicKey: {
            type: 'string',
        },
        recipientId: {
            type: ['string', 'null'],
        },
        recipientPublicKey: {
            type: ['string', 'null'],
        },
        signature: {
            type: 'string',
        },
        signSignature: {
            type: 'string',
        },
        signatures: {
            type: 'array',
        },
        asset: {
            type: 'object',
        },
        receivedAt: {
            type: 'string',
        },
    },
};
exports.baseTransaction = {
    $id: 'lisk/base-transaction',
    type: 'object',
    required: [
        'id',
        'type',
        'amount',
        'fee',
        'senderPublicKey',
        'timestamp',
        'asset',
        'signature',
    ],
    properties: {
        id: {
            type: 'string',
            format: 'id',
        },
        blockId: {
            type: 'string',
            format: 'id',
        },
        height: {
            type: 'integer',
            minimum: 0,
        },
        confirmations: {
            type: 'integer',
            minimum: 0,
        },
        amount: {
            type: 'string',
            format: 'amount',
        },
        fee: {
            type: 'string',
            format: 'fee',
        },
        type: {
            type: 'integer',
            minimum: 0,
        },
        timestamp: {
            type: 'integer',
            minimum: -2147483648,
            maximum: 2147483647,
        },
        senderId: {
            type: 'string',
            format: 'address',
        },
        senderPublicKey: {
            type: 'string',
            format: 'publicKey',
        },
        senderSecondPublicKey: {
            type: 'string',
            format: 'publicKey',
        },
        recipientId: {
            type: 'string',
        },
        recipientPublicKey: {
            type: 'string',
            format: 'emptyOrPublicKey',
        },
        signature: {
            type: 'string',
            format: 'signature',
        },
        signSignature: {
            type: 'string',
            format: 'signature',
        },
        signatures: {
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'string',
                format: 'signature',
            },
            minItems: 0,
            maxItems: 15,
        },
        asset: {
            type: 'object',
        },
        receivedAt: {
            type: 'string',
            format: 'date-time',
        },
    },
};
exports.transferTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                recipientId: {
                    format: 'address',
                },
                amount: {
                    format: 'transferAmount',
                },
                asset: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            format: 'transferData',
                            maxLength: 64,
                        },
                    },
                },
            },
        },
    },
};
exports.signatureTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                amount: {
                    format: 'nonTransferAmount',
                },
                asset: {
                    type: 'object',
                    required: ['signature'],
                    properties: {
                        signature: {
                            type: 'object',
                            required: ['publicKey'],
                            properties: {
                                publicKey: {
                                    type: 'string',
                                    format: 'publicKey',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.delegateTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                amount: {
                    format: 'nonTransferAmount',
                },
                asset: {
                    type: 'object',
                    required: ['delegate'],
                    properties: {
                        delegate: {
                            type: 'object',
                            required: ['username'],
                            properties: {
                                username: {
                                    type: 'string',
                                    maxLength: 20,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.voteTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                amount: {
                    format: 'nonTransferAmount',
                },
                asset: {
                    type: 'object',
                    required: ['votes'],
                    properties: {
                        votes: {
                            type: 'array',
                            uniqueSignedPublicKeys: true,
                            minItems: 1,
                            maxItems: 33,
                            items: {
                                type: 'string',
                                format: 'signedPublicKey',
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.multiTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                amount: {
                    format: 'nonTransferAmount',
                },
                asset: {
                    type: 'object',
                    required: ['multisignature'],
                    properties: {
                        multisignature: {
                            type: 'object',
                            required: ['min', 'lifetime', 'keysgroup'],
                            properties: {
                                min: {
                                    type: 'integer',
                                    minimum: 1,
                                    maximum: 15,
                                },
                                lifetime: {
                                    type: 'integer',
                                    minimum: 1,
                                    maximum: 72,
                                },
                                keysgroup: {
                                    type: 'array',
                                    uniqueItems: true,
                                    minItems: 1,
                                    maxItems: 15,
                                    items: {
                                        type: 'string',
                                        format: 'additionPublicKey',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.dappTransaction = {
    $merge: {
        source: { $ref: 'lisk/base-transaction' },
        with: {
            properties: {
                amount: {
                    format: 'nonTransferAmount',
                },
                asset: {
                    type: 'object',
                    required: ['dapp'],
                    properties: {
                        dapp: {
                            type: 'object',
                            required: ['name', 'type', 'category', 'link'],
                            properties: {
                                icon: {
                                    type: 'string',
                                },
                                category: {
                                    type: 'integer',
                                },
                                type: {
                                    type: 'integer',
                                },
                                link: {
                                    type: 'string',
                                },
                                tags: {
                                    type: 'string',
                                },
                                description: {
                                    type: 'string',
                                },
                                name: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=schema.js.map