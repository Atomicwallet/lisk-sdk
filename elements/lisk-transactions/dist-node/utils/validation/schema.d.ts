export declare const transaction: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        id: {
            type: string;
        };
        blockId: {
            type: string;
        };
        amount: {
            type: string[];
        };
        fee: {
            type: string[];
        };
        type: {
            type: string;
        };
        timestamp: {
            type: string;
        };
        senderId: {
            type: string;
        };
        senderPublicKey: {
            type: string;
        };
        recipientId: {
            type: string[];
        };
        recipientPublicKey: {
            type: string[];
        };
        signature: {
            type: string;
        };
        signSignature: {
            type: string;
        };
        signatures: {
            type: string;
        };
        asset: {
            type: string;
        };
        receivedAt: {
            type: string;
        };
    };
};
export declare const baseTransaction: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        id: {
            type: string;
            format: string;
        };
        blockId: {
            type: string;
            format: string;
        };
        height: {
            type: string;
            minimum: number;
        };
        confirmations: {
            type: string;
            minimum: number;
        };
        amount: {
            type: string;
            format: string;
        };
        fee: {
            type: string;
            format: string;
        };
        type: {
            type: string;
            minimum: number;
        };
        timestamp: {
            type: string;
            minimum: number;
            maximum: number;
        };
        senderId: {
            type: string;
            format: string;
        };
        senderPublicKey: {
            type: string;
            format: string;
        };
        senderSecondPublicKey: {
            type: string;
            format: string;
        };
        recipientId: {
            type: string;
        };
        recipientPublicKey: {
            type: string;
            format: string;
        };
        signature: {
            type: string;
            format: string;
        };
        signSignature: {
            type: string;
            format: string;
        };
        signatures: {
            type: string;
            uniqueItems: boolean;
            items: {
                type: string;
                format: string;
            };
            minItems: number;
            maxItems: number;
        };
        asset: {
            type: string;
        };
        receivedAt: {
            type: string;
            format: string;
        };
    };
};
export declare const transferTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                recipientId: {
                    format: string;
                };
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    properties: {
                        data: {
                            type: string;
                            format: string;
                            maxLength: number;
                        };
                    };
                };
            };
        };
    };
};
export declare const signatureTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    required: string[];
                    properties: {
                        signature: {
                            type: string;
                            required: string[];
                            properties: {
                                publicKey: {
                                    type: string;
                                    format: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const delegateTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    required: string[];
                    properties: {
                        delegate: {
                            type: string;
                            required: string[];
                            properties: {
                                username: {
                                    type: string;
                                    maxLength: number;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const voteTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    required: string[];
                    properties: {
                        votes: {
                            type: string;
                            uniqueSignedPublicKeys: boolean;
                            minItems: number;
                            maxItems: number;
                            items: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const multiTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    required: string[];
                    properties: {
                        multisignature: {
                            type: string;
                            required: string[];
                            properties: {
                                min: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                lifetime: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                keysgroup: {
                                    type: string;
                                    uniqueItems: boolean;
                                    minItems: number;
                                    maxItems: number;
                                    items: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const dappTransaction: {
    $merge: {
        source: {
            $ref: string;
        };
        with: {
            properties: {
                amount: {
                    format: string;
                };
                asset: {
                    type: string;
                    required: string[];
                    properties: {
                        dapp: {
                            type: string;
                            required: string[];
                            properties: {
                                icon: {
                                    type: string;
                                };
                                category: {
                                    type: string;
                                };
                                type: {
                                    type: string;
                                };
                                link: {
                                    type: string;
                                };
                                tags: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                name: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
