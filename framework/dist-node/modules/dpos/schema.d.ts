export declare const delegatesUserNamesSchema: {
    $id: string;
    type: string;
    properties: {
        registeredDelegates: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    username: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
    required: string[];
};
export declare const dposModuleParamsSchema: {
    $id: string;
    type: string;
    required: string[];
    additionalProperties: boolean;
    properties: {
        activeDelegates: {
            dataType: string;
        };
        standbyDelegates: {
            dataType: string;
        };
        delegateListRoundOffset: {
            dataType: string;
        };
    };
};
export declare const dposAccountSchema: {
    type: string;
    properties: {
        delegate: {
            type: string;
            fieldNumber: number;
            properties: {
                username: {
                    dataType: string;
                    fieldNumber: number;
                };
                pomHeights: {
                    type: string;
                    items: {
                        dataType: string;
                    };
                    fieldNumber: number;
                };
                consecutiveMissedBlocks: {
                    dataType: string;
                    fieldNumber: number;
                };
                lastForgedHeight: {
                    dataType: string;
                    fieldNumber: number;
                };
                isBanned: {
                    dataType: string;
                    fieldNumber: number;
                };
                totalVotesReceived: {
                    dataType: string;
                    fieldNumber: number;
                };
            };
            required: string[];
        };
        sentVotes: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    delegateAddress: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    amount: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
                required: string[];
            };
        };
        unlocking: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    delegateAddress: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    amount: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    unvoteHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
                required: string[];
            };
        };
    };
    default: {
        delegate: {
            username: string;
            pomHeights: never[];
            consecutiveMissedBlocks: number;
            lastForgedHeight: number;
            isBanned: boolean;
            totalVotesReceived: bigint;
        };
        sentVotes: never[];
        unlocking: never[];
    };
};
export declare const voteWeightsSchema: {
    $id: string;
    type: string;
    properties: {
        voteWeights: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    round: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    delegates: {
                        type: string;
                        fieldNumber: number;
                        items: {
                            type: string;
                            properties: {
                                address: {
                                    dataType: string;
                                    fieldNumber: number;
                                };
                                voteWeight: {
                                    dataType: string;
                                    fieldNumber: number;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    required: string[];
};
